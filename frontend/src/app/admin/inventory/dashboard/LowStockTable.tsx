"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "../common/StatusBadge";
import { InventoryItem } from "@/types/inventory/inventory-items";

interface Props {
  items: InventoryItem[];
}

export default function LowStockTable({ items }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedItems = (items ?? []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((items ?? []).length / itemsPerPage);

  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-semibold text-blue-900 text-base">Low Stock Items</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({(items ?? []).length} total)
          </span>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto hide-scrollbar">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-3 text-left text-blue-700 text-xs">SKU</th>
              <th className="px-4 py-3 text-left text-blue-700 text-xs">Item</th>
              <th className="px-4 py-3 text-blue-700 text-xs">Qty</th>
              <th className="px-4 py-3 text-blue-700 text-xs">Reorder</th>
              <th className="px-4 py-3 text-blue-700 text-xs">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className="border-t border-blue-50">
                <td className="px-4 py-3 text-blue-900 text-sm">{item.sku}</td>
                <td className="px-4 py-3 text-blue-900 text-sm">{item.name}</td>
                <td className="px-4 py-3 text-center text-blue-900 text-sm">{item.quantity}</td>
                <td className="px-4 py-3 text-center text-blue-900 text-sm">{item.reorderLevel}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/inventory/items/${item.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-blue-400 text-sm">
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
