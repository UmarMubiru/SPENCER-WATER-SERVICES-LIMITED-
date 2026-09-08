"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ItemForm from "@/components/inventory/items/ItemForm";
import { InventoryItemService } from "@/services/inventory/inventory-item.service";
import { InventoryItemInput } from "@/types/inventory/inventory-items";

export default function CreateItemPage() {
  const router = useRouter();
  const [purchaseNumber, setPurchaseNumber] = useState("");

  useEffect(() => {
    InventoryItemService.allocatePurchaseNumber()
      .then((response) => setPurchaseNumber(response.data.purchaseNumber));
  }, []);

  async function handleSubmit(data: InventoryItemInput) {
    await InventoryItemService.create(data);
    router.push("/admin/inventory/items");
  }

  return (
    <div className="space-y-8 p-8">
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <ItemForm purchaseNumber={purchaseNumber} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
