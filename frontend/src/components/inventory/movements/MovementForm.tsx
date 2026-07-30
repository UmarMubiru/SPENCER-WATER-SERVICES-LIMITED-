"use client";

import { useState } from "react";
import { StockMovementInput, MovementType } from "@/types/inventory/movement";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";

interface Props {
  onSubmit: (data: StockMovementInput) => Promise<void>;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function MovementForm({ onSubmit }: Props) {
  const { items } = useInventoryItems({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<StockMovementInput>({
    inventoryItem: "",
    movementType: "IN" as MovementType,
    quantity: 1,
    reason: "",
    reference: "",
  });

  function update<K extends keyof StockMovementInput>(key: K, value: StockMovementInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedItem = items.find((i) => i.id === form.inventoryItem);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.inventoryItem) {
      setError("Select an inventory item.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to record movement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-800">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Inventory Item</label>
        <select
          value={form.inventoryItem}
          onChange={(e) => update("inventoryItem", e.target.value)}
          className={inputClass}
        >
          <option value="">— Select item —</option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.sku} — {it.name} (in stock: {it.quantity})
            </option>
          ))}
        </select>
        {selectedItem && (
          <p className="mt-1 text-xs text-blue-400">
            Current stock: {selectedItem.quantity} {selectedItem.unit}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Movement Type</label>
          <select
            value={form.movementType}
            onChange={(e) => update("movementType", e.target.value as MovementType)}
            className={inputClass}
          >
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Quantity</label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => update("quantity", Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Reason</label>
          <input
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            placeholder="e.g. Restock, damaged goods"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Reference</label>
          <input
            value={form.reference}
            onChange={(e) => update("reference", e.target.value)}
            placeholder="e.g. PO number"
            className={inputClass}
          />
        </div>
      </div>

      {form.movementType === "OUT" && selectedItem && form.quantity > selectedItem.quantity && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          This exceeds current stock ({selectedItem.quantity} available). The backend will reject this.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Recording..." : "Record Movement"}
      </button>
    </form>
  );
}
