"use client";

import { useState } from "react";
import { SupplierQuotationInput } from "@/types/inventory/supplier-quotations";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { useProducts } from "@/hooks/inventory/useProducts";

interface Props {
  onSubmit: (data: SupplierQuotationInput) => Promise<void>;
}

type Target = "inventoryItem" | "product";
type LineItem = {
  target: Target;
  inventoryItem: string;
  product: string;
  quantity: number;
  unitPrice: number;
};

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

const emptyLine = (): LineItem => ({
  target: "inventoryItem",
  inventoryItem: "",
  product: "",
  quantity: 1,
  unitPrice: 0,
});

export default function SupplierQuotationForm({ onSubmit }: Props) {
  const { suppliers } = useSuppliers({ page: 1 });
  const { items } = useInventoryItems({ page: 1 });
  const { products } = useProducts({ page: 1 });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supplier, setSupplier] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  function updateLine(index: number, patch: Partial<LineItem>) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((ls) => [...ls, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supplier) {
      setError("Select a supplier.");
      return;
    }

    const validLines = lines.filter(
      (l) => (l.target === "inventoryItem" ? l.inventoryItem : l.product) && l.quantity > 0
    );
    if (validLines.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        supplier,
        validUntil: validUntil || null,
        notes,
        items: validLines.map((l) => ({
          inventoryItem: l.target === "inventoryItem" ? l.inventoryItem : null,
          product: l.target === "product" ? l.product : null,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save supplier quotation.");
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
          <label className={labelClass}>Supplier</label>
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputClass} required>
            <option value="">— Select supplier —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Valid Until</label>
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>Requested Items</label>
          <button type="button" onClick={addLine} className="text-sm font-medium text-blue-600 hover:underline">
            + Add line
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="rounded-lg border border-blue-100 p-4">
              <div className="mb-3 flex gap-4 text-sm">
                <label className="flex items-center gap-1.5 text-blue-700">
                  <input
                    type="radio"
                    checked={line.target === "inventoryItem"}
                    onChange={() => updateLine(i, { target: "inventoryItem", product: "" })}
                  />
                  Inventory Item
                </label>
                <label className="flex items-center gap-1.5 text-blue-700">
                  <input
                    type="radio"
                    checked={line.target === "product"}
                    onChange={() => updateLine(i, { target: "product", inventoryItem: "" })}
                  />
                  Product
                </label>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  {line.target === "inventoryItem" ? (
                    <select
                      value={line.inventoryItem}
                      onChange={(e) => updateLine(i, { inventoryItem: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">— Select item —</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.sku} — {it.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={line.product}
                      onChange={(e) => updateLine(i, { product: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">— Select product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                    className={inputClass}
                    placeholder="Qty"
                  />
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                    className={inputClass}
                    placeholder="Unit price"
                  />
                </div>

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="rounded-lg border border-blue-200 px-3 py-2 text-blue-500 hover:bg-blue-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Supplier Quotation"}
      </button>
    </form>
  );
}
