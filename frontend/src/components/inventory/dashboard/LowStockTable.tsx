"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { InventoryItem } from "@/types/inventory/inventory-items";

interface Props {
  items: InventoryItem[];
}

export default function LowStockTable({ items }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil((items?.length ?? 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = (items ?? []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            {pageItems.map((item) => (
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
      {(items?.length ?? 0) > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 px-5 py-3">
          <span className="text-sm text-slate-500">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, items.length)} of {items.length} items</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-50">Previous</button>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
