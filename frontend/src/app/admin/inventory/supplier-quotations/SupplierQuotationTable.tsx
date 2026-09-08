"use client";

import StatusBadge from "../common/StatusBadge";
import { SupplierQuotation } from "@/types/inventory/supplier-quotations";

interface Props {
  quotations: SupplierQuotation[];
  onAction: (id: string, action: "send" | "accept" | "reject") => void;
  actionPending?: boolean;
}

export default function SupplierQuotationTable({ quotations, onAction, actionPending = false }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white shadow-sm hide-scrollbar">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Supplier</th>
            <th className="px-6 py-4 text-left text-blue-700">Valid Until</th>
            <th className="px-6 py-4 text-center text-blue-700">Items</th>
            <th className="px-6 py-4 text-left text-blue-700">Selected Items</th>
            <th className="px-6 py-4 text-center text-blue-700">Total</th>
            <th className="px-6 py-4 text-center text-blue-700">Status</th>
            <th className="px-6 py-4 text-right text-blue-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(quotations ?? []).map((q) => (
            <tr key={q.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{q.supplierName || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{q.validUntil || "—"}</td>
              <td className="px-6 py-4 text-center text-blue-900">{q.items?.length ?? 0}</td>
              <td className="px-6 py-4 text-sm text-blue-700"><ItemSummary items={q.items} /></td>
              <td className="px-6 py-4 text-center text-blue-900">{q.total}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={q.status} /></td>
              <td className="px-6 py-4 text-right">
                <SupplierActionMenu quotation={q} onAction={onAction} disabled={actionPending} />
              </td>
            </tr>
          ))}
          {(!quotations || quotations.length === 0) && (
            <tr><td colSpan={7} className="px-6 py-10 text-center text-blue-400">No supplier quotations found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SupplierActionMenu({ quotation, onAction, disabled }: { quotation: SupplierQuotation; onAction: Props["onAction"]; disabled: boolean }) {
  const actions = quotation.status === "DRAFT"
    ? [{ label: "Send", action: "send" as const }]
    : quotation.status === "SENT" || quotation.status === "RECEIVED"
      ? [{ label: "Accept", action: "accept" as const }, { label: "Reject", action: "reject" as const }]
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

function ItemSummary({ items }: { items: SupplierQuotation["items"] }) {
  return <div className="space-y-1">{items.map((item) => <div key={item.id}>{item.quantity} × {item.inventoryItemName || item.productName || "Item name unavailable"}</div>)}</div>;
}
