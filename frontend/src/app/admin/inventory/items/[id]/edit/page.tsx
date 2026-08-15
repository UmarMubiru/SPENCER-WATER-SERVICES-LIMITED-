"use client";

import { useParams, useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import ItemForm from "@/components/inventory/items/ItemForm";
import { useInventoryItem } from "@/hooks/inventory/useInventoryItems";
import { InventoryItemService } from "@/services/inventory/inventory-item.service";
import { InventoryItemInput } from "@/types/inventory/inventory-items";

export default function EditInventoryItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, item } = useInventoryItem(id as string);

  async function handleSubmit(data: InventoryItemInput) {
    await InventoryItemService.update(id as string, data);
    router.push(`/admin/inventory/items/${id}`);
  }

  if (loading || !item) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Edit Inventory Item" description={item.sku} />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <ItemForm initial={item} onSubmit={handleSubmit} submitLabel="Update Item" />
      </div>
    </div>
  );
}
