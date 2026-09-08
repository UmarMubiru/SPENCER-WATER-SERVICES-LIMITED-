"use client";

import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { StockMovement } from "@/types/inventory/movement";

interface Props {
  movements: StockMovement[];
}

export default function RecentMovements({ movements }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil((movements?.length ?? 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageMovements = (movements ?? []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 p-5">
        <h3 className="font-semibold text-blue-900">Recent Stock Movements</h3>
      </div>

      <div className="divide-y divide-blue-50">
        {pageMovements.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-blue-900">{m.inventoryItemName ?? m.inventoryItem}</p>
              <p className="text-sm text-blue-400">{m.reason || "—"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-700">{m.quantity}</span>
              <StatusBadge status={m.movementType} />
            </div>
          </div>
        ))}
        {(!movements || movements.length === 0) && (
          <div className="px-5 py-8 text-center text-blue-400">No recent movements.</div>
        )}
      </div>
      {(movements?.length ?? 0) > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 px-5 py-3">
          <span className="text-sm text-slate-500">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, movements.length)} of {movements.length} movements</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-50">Previous</button>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
