"use client";

import Link from "next/link";
import StatusBadge from "../common/StatusBadge";
import { InventoryItem } from "@/types/inventory/inventory-items";

interface Props {
  items: InventoryItem[];
}

export default function ItemTable({ items }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="min-w-full">
        <thead className="bg-blue-50/60">
          <tr>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">SKU</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Item</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Category</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Qty</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Unit</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((item) => (
            <tr key={item.id} className="border-t border-blue-50 transition-colors hover:bg-blue-50/40">
              <td className="px-6 py-4 font-mono text-[13px] text-blue-900">{item.sku}</td>
              <td className="px-6 py-4 font-medium text-blue-900">{item.name}</td>
              <td className="px-6 py-4 text-blue-700">{item.categoryName || "—"}</td>
              <td className="px-6 py-4 text-center text-blue-900">{item.quantity}</td>
              <td className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">{item.unit}</td>
              <td className="px-6 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <Link href={`/admin/inventory/items/${item.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {(!items || items.length === 0) && (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-blue-400">
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
