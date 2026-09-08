"use client";

import StatusBadge from "../common/StatusBadge";
import { SalesQuotation } from "@/types/inventory/sales-quotations";

interface Props {
  quotations: SalesQuotation[];
  onAction: (id: string, action: "send" | "accept" | "expire") => void;
  actionPending?: boolean;
}

export default function SalesQuotationTable({ quotations, onAction, actionPending = false }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Customer</th>
            <th className="px-6 py-4 text-left text-blue-700">Valid Until</th>
            <th className="px-6 py-4 text-left text-blue-700">Products</th>
            <th className="px-6 py-4 text-center text-blue-700">Total</th>
            <th className="px-6 py-4 text-center text-blue-700">Status</th>
            <th className="px-6 py-4 text-right text-blue-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(quotations ?? []).map((q) => (
            <tr key={q.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{q.customerName}</td>
              <td className="px-6 py-4 text-blue-700">{q.validUntil || "—"}</td>
              <td className="px-6 py-4 text-sm text-blue-700"><ItemSummary items={q.items} /></td>
              <td className="px-6 py-4 text-center text-blue-900">{q.total}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={q.status} /></td>
              <td className="px-6 py-4 text-right">
                <SalesActionMenu quotation={q} onAction={onAction} disabled={actionPending} />
              </td>
            </tr>
          ))}
          {(!quotations || quotations.length === 0) && (
            <tr><td colSpan={6} className="px-6 py-10 text-center text-blue-400">No sales quotations found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SalesActionMenu({ quotation, onAction, disabled }: { quotation: SalesQuotation; onAction: Props["onAction"]; disabled: boolean }) {
  const actions = quotation.status === "DRAFT"
    ? [{ label: "Send", action: "send" as const }]
    : quotation.status === "SENT"
      ? [{ label: "Accept", action: "accept" as const }, { label: "Expire", action: "expire" as const }]
      : [];

  if (actions.length === 0) return null;

  return (
    <details className="relative inline-block text-left">
      <summary className="cursor-pointer list-none rounded-md border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 [&::-webkit-details-marker]:hidden">
        Actions
      </summary>
      <div className="absolute right-0 z-10 mt-1 min-w-28 rounded-md border border-blue-100 bg-white py-1 shadow-lg">
        {actions.map(({ label, action }) => (
          <button key={action} type="button" onClick={() => onAction(quotation.id, action)} disabled={disabled} className="block w-full px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

function ItemSummary({ items }: { items: SalesQuotation["items"] }) {
  return <div className="space-y-1">{items.map((item) => <div key={item.id}>{item.quantity} × {item.productName ?? "Product name unavailable"}</div>)}</div>;
}
