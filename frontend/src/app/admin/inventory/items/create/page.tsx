"use client";

import { useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import ItemForm from "@/components/inventory/items/ItemForm";
import { InventoryItemService } from "@/services/inventory/inventory-item.service";
import { InventoryItemInput } from "@/types/inventory/inventory-items";

export default function CreateInventoryItemPage() {
  const router = useRouter();

  async function handleSubmit(data: InventoryItemInput) {
    await InventoryItemService.create(data);
    router.push("/admin/inventory/items");
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Add Inventory Item" description="Register new project-use stock." />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <ItemForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
