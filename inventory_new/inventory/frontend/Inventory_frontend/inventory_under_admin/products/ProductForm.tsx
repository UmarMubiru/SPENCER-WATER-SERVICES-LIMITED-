"use client";

import Image from "next/image";
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
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export default function ProductForm({ initial, onSubmit, submitLabel = "Save Product" }: Props) {
  const { suppliers } = useSuppliers({ page: 1 });
  const { categories } = useCategories({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image ?? null);
  const [manageStock, setManageStock] = useState(true);

  const [form, setForm] = useState<ProductInput>({
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    unit: initial?.unit ?? "pcs",
    brand: initial?.brand ?? "",
    warehouse: initial?.warehouse ?? "",
    image: initial?.image ?? "",
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(initial?.image ?? null);
      update("image", initial?.image ?? "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
      update("image", result);
    };
    reader.readAsDataURL(file);
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="relative h-14 w-14 overflow-hidden rounded-3xl bg-white p-2 shadow-sm">
                <Image src="/sws-logo-current.png" alt="Spencer logo" fill className="object-contain" />
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-slate-900">Spencer Water Services</p>
            <p className="mt-2 text-center text-sm text-slate-500">Build products with shared inventory categories and a polished creation workflow.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-100 p-4">
              <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-3xl bg-white">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Product preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <span className="text-3xl">🖼️</span>
                  </div>
                )}
              </div>
            </div>
            <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Upload product image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="mt-2 text-xs text-slate-500">Max 5MB. Recommended 1:1 aspect ratio.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-blue-950 p-5 text-white shadow-sm">
            <p className="text-sm font-semibold">Design notes</p>
            <div className="mt-4 space-y-3 text-sm text-blue-200">
              <div className="rounded-2xl bg-blue-900/10 p-3">
                <p className="font-medium">Shared categories</p>
                <p>Products and internal items use the same category structure.</p>
              </div>
              <div className="rounded-2xl bg-blue-900/10 p-3">
                <p className="font-medium">Stock controls</p>
                <p>Use the toggle to enable per-product inventory tracking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className={inputClass}
                  placeholder="SKU code"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                <label className={labelClass}>Brand</label>
                <input
                  value={form.brand ?? ""}
                  onChange={(e) => update("brand", e.target.value)}
                  className={inputClass}
                  placeholder="Brand name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sub Category</label>
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
              <div>
                <label className={labelClass}>Business Location</label>
                <input
                  value={form.warehouse ?? ""}
                  onChange={(e) => update("warehouse", e.target.value)}
                  className={inputClass}
                  placeholder="Warehouse or location"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Product Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={inputClass}
                rows={5}
                placeholder="Write description ..."
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Cost Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => update("costPrice", Number(e.target.value))}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Selling Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => update("sellingPrice", Number(e.target.value))}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
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
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => update("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active and visible for sale</label>
              </div>
            </div>

            {manageStock && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) => update("quantity", Number(e.target.value))}
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
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
