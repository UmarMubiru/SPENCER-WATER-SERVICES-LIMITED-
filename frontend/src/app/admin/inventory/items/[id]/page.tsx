"use client";

import { useParams } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import StatusBadge from "@/components/inventory/common/StatusBadge";
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
      <InventoryPageHeader
        title={item.name}
        description={item.sku}
        actionLabel="Edit Item"
        actionHref={`/admin/inventory/items/${item.id}/edit`}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-blue-900">Item Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-blue-400">Category</dt><dd className="text-blue-900">{item.category || "—"}</dd></div>
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

      <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 p-5">
          <h3 className="font-semibold text-blue-900">Movement History</h3>
        </div>
        <div className="divide-y divide-blue-50">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-blue-900">{m.reason || "—"}</p>
                <p className="text-sm text-blue-400">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-700">{m.quantity}</span>
                <StatusBadge status={m.movementType} />
              </div>
            </div>
          ))}
          {movements.length === 0 && (
            <div className="px-5 py-8 text-center text-blue-400">No movements yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
