"use client";

import { useParams } from "next/navigation";
import StatusBadge from "@/components/inventory/common/StatusBadge";
import MovementTable from "@/components/inventory/movements/MovementTable";
import { useInventoryItem } from "@/hooks/inventory/useInventoryItems";
import { useMovements } from "@/hooks/inventory/useMovements";

export default function InventoryItemDetailPage() {
  const { id } = useParams();
  const { loading, item } = useInventoryItem(id as string);
  const { movements } = useMovements({ page: 1, inventoryItem: id as string });

  if (loading || !item) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-blue-900">Item Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-blue-400">Category</dt><dd className="text-blue-900">{item.categoryName || "—"}</dd></div>
            <div><dt className="text-blue-400">Unit</dt><dd className="text-blue-900">{item.unit}</dd></div>
            <div><dt className="text-blue-400">Unit Cost</dt><dd className="text-blue-900">{item.unitCost}</dd></div>
            <div><dt className="text-blue-400">Warehouse</dt><dd className="text-blue-900">{item.warehouse || "—"}</dd></div>
            <div><dt className="text-blue-400">Supplier</dt><dd className="text-blue-900">{item.supplierName || "—"}</dd></div>
            <div><dt className="text-blue-400">Reorder Level</dt><dd className="text-blue-900">{item.reorderLevel}</dd></div>
          </dl>
          {item.description && (
            <div>
              <dt className="text-blue-400">Description</dt>
              <dd className="text-blue-900">{item.description}</dd>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-blue-900">Current Stock</h3>
          <h1 className="text-5xl font-bold text-blue-900">{item.quantity}</h1>
          <div className="mt-4"><StatusBadge status={item.status} /></div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-blue-900">Stock Movement Ledger</h3>
        <MovementTable movements={movements} hideItemColumn />
      </div>
    </div>
  );
}
