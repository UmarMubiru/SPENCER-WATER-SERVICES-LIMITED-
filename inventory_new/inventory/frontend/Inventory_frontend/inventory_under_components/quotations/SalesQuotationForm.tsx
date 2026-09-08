"use client";

import { useState } from "react";
import { SalesQuotationInput } from "@/types/inventory/sales-quotations";
import { useProducts } from "@/hooks/inventory/useProducts";

interface Props {
  onSubmit: (data: SalesQuotationInput) => Promise<void>;
}

type LineItem = { product: string; quantity: number; unitPrice: number };

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function SalesQuotationForm({ onSubmit }: Props) {
  const { products } = useProducts({ page: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ product: "", quantity: 1, unitPrice: 0 }]);

  function updateLine(index: number, patch: Partial<LineItem>) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function pickProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateLine(index, {
      product: productId,
      unitPrice: product ? product.sellingPrice : 0,
    });
  }

  function addLine() {
    setLines((ls) => [...ls, { product: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validLines = lines.filter((l) => l.product && l.quantity > 0);
    if (validLines.length === 0) {
      setError("Add at least one product line.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customerName,
        customerEmail,
        validUntil: validUntil || null,
        notes,
        items: validLines,
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save quotation.");
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
          <label className={labelClass}>Customer Name</label>
          <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Customer Email</label>
          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClass} />
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
          <label className={labelClass}>Products</label>
          <button type="button" onClick={addLine} className="text-sm font-medium text-blue-600 hover:underline">
            + Add product
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="flex items-end gap-3">
              <div className="flex-1">
                <select
                  value={line.product}
                  onChange={(e) => pickProduct(i, e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Select product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                  ))}
                </select>
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
          ))}
        </div>

        <div className="mt-3 text-right text-sm font-medium text-blue-900">
          Total: {total.toFixed(2)}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Quotation"}
      </button>
    </form>
  );
}
