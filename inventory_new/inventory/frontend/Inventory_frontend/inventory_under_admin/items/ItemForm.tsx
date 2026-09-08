"use client";

import { useEffect, useState } from "react";
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

// datetime-local wants "YYYY-MM-DDTHH:mm" with no timezone/seconds
function nowForInput() {
  const d = new Date();
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function ItemForm({ initial, onSubmit, submitLabel = "Save Item" }: Props) {
  const { suppliers } = useSuppliers({ page: 1 });
  const { categories } = useCategories({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initial?.id);

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
    initialQuantity: 0,
    movementReason: "PURCHASE",
    transactionDate: nowForInput(),
  });

  useEffect(() => {
    setForm({
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
      initialQuantity: 0,
      movementReason: "PURCHASE",
      transactionDate: nowForInput(),
    });
  }, [initial?.id, initial?.sku, initial?.barcode, initial?.name, initial?.description, initial?.category, initial?.unit, initial?.reorderLevel, initial?.unitCost, initial?.supplier, initial?.warehouse]);

  function update<K extends keyof InventoryItemInput>(key: K, value: InventoryItemInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const initialQuantity = form.initialQuantity ?? 0;
  const itemPrice = Number(form.unitCost || 0) * Number(initialQuantity);

  function resetForm() {
    setForm({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      category: "",
      unit: "pcs",
      reorderLevel: 0,
      unitCost: 0,
      supplier: "",
      warehouse: "",
      initialQuantity: 0,
      movementReason: "PURCHASE",
      transactionDate: nowForInput(),
    });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: InventoryItemInput = {
        sku: form.sku,
        barcode: form.barcode,
        name: form.name,
        description: form.description,
        category: form.category,
        unit: form.unit,
        reorderLevel: form.reorderLevel,
        unitCost: form.unitCost,
        supplier: form.supplier,
        warehouse: form.warehouse,
        ...(isEditing
          ? {}
          : {
              initialQuantity: form.initialQuantity ?? 0,
              movementReason: form.movementReason,
              transactionDate: form.transactionDate,
            }),
      };

      await onSubmit(payload);
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Purchase No</label>
            <input
              required
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
              className={inputClass}
              placeholder="e.g. P-1001"
            />
          </div>

          <div>
            <label className={labelClass}>Item Category</label>
            <select
              value={form.category ?? ""}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Item Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. PVC Pipe 2 inch"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Item Barcode</label>
            <input
              value={form.barcode}
              onChange={(e) => update("barcode", e.target.value)}
              className={inputClass}
              placeholder="Optional barcode"
            />
          </div>

          <div>
            <label className={labelClass}>Rate / MRP</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.unitCost}
              onChange={(e) => update("unitCost", Number(e.target.value))}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Item Price</label>
            <input
              readOnly
              value={itemPrice.toFixed(2)}
              className={`${inputClass} bg-slate-100 text-slate-700 cursor-not-allowed`}
            />
          </div>

          {!isEditing && (
            <div>
              <label className={labelClass}>Item Quantity</label>
              <input
                type="number"
                min={0}
                value={form.initialQuantity}
                onChange={(e) => update("initialQuantity", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Unit</label>
            <input
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              className={inputClass}
              placeholder="pcs"
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
            <label className={labelClass}>Supplier</label>
            <select
              value={form.supplier ?? ""}
              onChange={(e) => update("supplier", e.target.value)}
              className={inputClass}
            >
              <option value="">Select supplier</option>
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
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-4">
          {!isEditing && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Purchase detail</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Total items</span>
                  <strong>{initialQuantity > 0 ? 1 : 0}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total item rate</span>
                  <strong>{form.unitCost.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total quantity</span>
                  <strong>{initialQuantity}</strong>
                </div>
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-base font-semibold text-slate-900">
                  <span>Grand total</span>
                  <span>{itemPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              New entry
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
          rows={3}
          placeholder="Item description..."
        />
      </div>

      {!isEditing && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
          <h4 className="mb-1 text-sm font-semibold text-blue-800">Opening Stock</h4>
          <p className="mb-4 text-xs text-blue-400">
            This creates the item and records opening stock as a stock movement.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Purchased or Returned</label>
              <select
                value={form.movementReason}
                onChange={(e) => update("movementReason", e.target.value as "PURCHASE" | "RETURN")}
                className={inputClass}
              >
                <option value="PURCHASE">Purchased</option>
                <option value="RETURN">Returned</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Date / Time</label>
              <input
                type="datetime-local"
                value={form.transactionDate ?? ""}
                onChange={(e) => update("transactionDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-400">
            Recorded against the supplier selected above.
          </p>
        </div>
      )}
    </form>
  );
}
