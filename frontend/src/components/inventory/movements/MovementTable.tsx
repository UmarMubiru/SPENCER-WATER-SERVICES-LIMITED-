"use client";

import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { StockMovement } from "@/types/inventory/movement";
import { MovementService } from "@/services/inventory/movement.service";

interface Props {
  movements: StockMovement[];
  // Hide the item name column when this table is already scoped to one item
  // (e.g. on the item detail page) — avoids a redundant, always-identical column.
  hideItemColumn?: boolean;
  onRefresh?: () => void;
}

const REASON_LABELS: Record<string, string> = {
  PURCHASE: "Purchase",
  RETURN: "Return",
  REQUEST_ISSUE: "Issued for Request",
  ADJUSTMENT: "Adjustment",
  DAMAGED: "Damaged",
  OTHER: "Other",
};

export default function MovementTable({ movements, hideItemColumn = false, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleEdit = (movement: StockMovement) => {
    setEditingId(movement.id);
    setEditQuantity(movement.quantity);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditQuantity(0);
  };

  const handleSave = async (movement: StockMovement) => {
    setSaving(true);
    try {
      await MovementService.update(movement.id, { quantity: editQuantity });
      setEditingId(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to update movement:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="min-w-full">
        <thead className="bg-blue-50/60">
          <tr>
            {!hideItemColumn && (
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Item</th>
            )}
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Category</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Qty Before</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Qty After</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Reason</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Reorder Level</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Date</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(movements ?? []).map((m) => (
            <tr key={m.id} className="border-t border-blue-50 transition-colors hover:bg-blue-50/40">
              {!hideItemColumn && (
                <td className="px-6 py-4 font-medium text-blue-900">
                  {m.inventoryItemName ?? m.inventoryItem}
                </td>
              )}
              <td className="px-6 py-4 text-blue-700">{m.categoryName || "-"}</td>
              <td className="px-6 py-4 text-center text-blue-700">{m.quantityBefore}</td>
              <td className="px-6 py-4 text-center font-medium text-blue-900">{m.quantityAfter}</td>
              <td className="px-6 py-4 text-blue-700">{REASON_LABELS[m.reason] ?? m.reason}</td>
              <td className="px-6 py-4 text-center text-blue-700">{m.reorderLevel}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={m.statusAfter} /></td>
              <td className="px-6 py-4 text-blue-700">
                {new Date(m.transactionDate).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-center">
                {editingId === m.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-blue-200 rounded text-center text-sm"
                      min="0"
                    />
                    <button
                      onClick={() => handleSave(m)}
                      disabled={saving}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(m)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
          {(!movements || movements.length === 0) && (
            <tr>
              <td colSpan={hideItemColumn ? 8 : 9} className="px-6 py-10 text-center text-blue-400">
                No movements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
