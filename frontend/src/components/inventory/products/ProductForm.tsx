"use client";

import { useState } from "react";
import { Product, ProductInput } from "@/types/inventory/products";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";
import { useCategories } from "@/hooks/inventory/useCategories";

interface Props {
  initial?: Partial<Product>;
  onSubmit: (data: ProductInput) => Promise<void>;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function ProductForm({ initial, onSubmit, submitLabel = "Save Product" }: Props) {
  const { suppliers } = useSuppliers({ page: 1 });
  const { categories } = useCategories({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductInput>({
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    unit: initial?.unit ?? "pcs",
    quantity: initial?.quantity ?? 0,
    reorderLevel: initial?.reorderLevel ?? 0,
    costPrice: initial?.costPrice ?? 0,
    sellingPrice: initial?.sellingPrice ?? 0,
    supplier: initial?.supplier ?? "",
    isActive: initial?.isActive ?? true,
  });

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.sku?.[0] ?? "Failed to save product.");
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
          <input required value={form.sku} onChange={(e) => update("sku", e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Barcode</label>
          <input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Name</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} rows={3} />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select value={form.category ?? ""} onChange={(e) => update("category", e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Unit</label>
          <input value={form.unit} onChange={(e) => update("unit", e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Quantity</label>
          <input type="number" min={0} value={form.quantity} onChange={(e) => update("quantity", Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Reorder Level</label>
          <input type="number" min={0} value={form.reorderLevel} onChange={(e) => update("reorderLevel", Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Cost Price</label>
          <input type="number" min={0} step="0.01" value={form.costPrice} onChange={(e) => update("costPrice", Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Selling Price</label>
          <input type="number" min={0} step="0.01" value={form.sellingPrice} onChange={(e) => update("sellingPrice", Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Supplier</label>
          <select value={form.supplier ?? ""} onChange={(e) => update("supplier", e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-blue-700">Active (visible for sale)</label>
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
