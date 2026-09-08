"use client";

import StatusBadge from "../common/StatusBadge";
import { StockMovement } from "@/types/inventory/movement";

interface Props {
  movements: StockMovement[];
}

export default function RecentMovements({ movements }: Props) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-4 py-2.5">
        <h3 className="font-semibold text-blue-900 text-base">Recent Stock Movements</h3>
      </div>

      <div className="divide-y divide-blue-50">
        {(movements ?? []).map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-blue-900 text-sm">{m.inventoryItemName ?? m.inventoryItem}</p>
              <p className="text-xs text-blue-400">{m.reason || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-700">{m.quantity}</span>
              <StatusBadge status={m.movementType} />
            </div>
          </div>
        ))}
        {(!movements || movements.length === 0) && (
          <div className="px-4 py-6 text-center text-blue-400 text-sm">No recent movements.</div>
        )}
      </div>
    </div>
  );
}
