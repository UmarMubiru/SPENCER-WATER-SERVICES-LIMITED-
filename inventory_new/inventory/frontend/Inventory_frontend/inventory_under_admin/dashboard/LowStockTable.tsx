"use client";

import Link from "next/link";
import StatusBadge from "../common/StatusBadge";
import { InventoryItem } from "@/types/inventory/inventory-items";

interface Props {
  items: InventoryItem[];
}

export default function LowStockTable({ items }: Props) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 p-5">
        <h3 className="font-semibold text-blue-900">Low Stock Items</h3>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-5 py-3 text-left text-blue-700">SKU</th>
              <th className="px-5 py-3 text-left text-blue-700">Item</th>
              <th className="px-5 py-3 text-blue-700">Qty</th>
              <th className="px-5 py-3 text-blue-700">Reorder</th>
              <th className="px-5 py-3 text-blue-700">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-blue-50">
                <td className="px-5 py-4 text-blue-900">{item.sku}</td>
                <td className="px-5 py-4 text-blue-900">{item.name}</td>
                <td className="px-5 py-4 text-center text-blue-900">{item.quantity}</td>
                <td className="px-5 py-4 text-center text-blue-900">{item.reorderLevel}</td>
                <td className="px-5 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/inventory/items/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-blue-400">
                  No low stock items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
