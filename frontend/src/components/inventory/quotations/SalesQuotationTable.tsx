"use client";

import StatusBadge from "../common/StatusBadge";
import { SalesQuotation } from "@/types/inventory/sales-quotations";

interface Props {
  quotations: SalesQuotation[];
}

export default function SalesQuotationTable({ quotations }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Customer</th>
            <th className="px-6 py-4 text-left text-blue-700">Valid Until</th>
            <th className="px-6 py-4 text-center text-blue-700">Total</th>
            <th className="px-6 py-4 text-center text-blue-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {(quotations ?? []).map((q) => (
            <tr key={q.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{q.customerName}</td>
              <td className="px-6 py-4 text-blue-700">{q.validUntil || "—"}</td>
              <td className="px-6 py-4 text-center text-blue-900">{q.total}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={q.status} /></td>
            </tr>
          ))}
          {(!quotations || quotations.length === 0) && (
            <tr><td colSpan={4} className="px-6 py-10 text-center text-blue-400">No sales quotations found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
