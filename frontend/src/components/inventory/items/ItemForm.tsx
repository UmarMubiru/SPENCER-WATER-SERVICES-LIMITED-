"use client";

import { useState } from "react";
import { InventoryItem, InventoryItemInput } from "@/types/inventory/inventory-items";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";
import { useCategories } from "@/hooks/inventory/useCategories";

interface Props {
  initial?: Partial<InventoryItem>;
  onSubmit: (data: InventoryItemInput) => Promise<void>;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function ItemForm({ initial, onSubmit, submitLabel = "Save Item" }: Props) {
  const { suppliers } = useSuppliers({ page: 1 });
  const { categories } = useCategories({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<InventoryItemInput>({
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    unit: initial?.unit ?? "pcs",
    reorderLevel: initial?.reorderLevel ?? 0,
    unitCost: initial?.unitCost ?? 0,
    supplier: initial?.supplier ?? "",
    warehouse: initial?.warehouse ?? "",
  });

  function update<K extends keyof InventoryItemInput>(key: K, value: InventoryItemInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.sku?.[0] ?? "Failed to save item.");
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>SKU</label>
          <input
            required
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Barcode</label>
          <input
            value={form.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Unit</label>
          <input
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Reorder Level</label>
          <input
            type="number"
            min={0}
            value={form.reorderLevel}
            onChange={(e) => update("reorderLevel", Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Unit Cost</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.unitCost}
            onChange={(e) => update("unitCost", Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Supplier</label>
          <select
            value={form.supplier ?? ""}
            onChange={(e) => update("supplier", e.target.value)}
            className={inputClass}
          >
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Warehouse</label>
          <input
            value={form.warehouse}
            onChange={(e) => update("warehouse", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
