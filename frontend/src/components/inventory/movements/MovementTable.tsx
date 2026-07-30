"use client";

import StatusBadge from "../common/StatusBadge";
import { StockMovement } from "@/types/inventory/movement";

interface Props {
  movements: StockMovement[];
}

export default function MovementTable({ movements }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Item</th>
            <th className="px-6 py-4 text-left text-blue-700">Reason</th>
            <th className="px-6 py-4 text-center text-blue-700">Qty</th>
            <th className="px-6 py-4 text-center text-blue-700">Type</th>
            <th className="px-6 py-4 text-left text-blue-700">By</th>
            <th className="px-6 py-4 text-left text-blue-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {(movements ?? []).map((m) => (
            <tr key={m.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">
                {m.inventoryItemName ?? m.inventoryItem}
              </td>
              <td className="px-6 py-4 text-blue-700">{m.reason || "—"}</td>
              <td className="px-6 py-4 text-center text-blue-900">{m.quantity}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={m.movementType} /></td>
              <td className="px-6 py-4 text-blue-700">{m.performedByName || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{new Date(m.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {(!movements || movements.length === 0) && (
            <tr><td colSpan={6} className="px-6 py-10 text-center text-blue-400">No movements found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
