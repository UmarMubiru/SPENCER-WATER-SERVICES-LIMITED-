"use client";

import { useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import MovementForm from "@/components/inventory/movements/MovementForm";
import { MovementService } from "@/services/inventory/movement.service";
import { StockMovementInput } from "@/types/inventory/movement";

export default function CreateMovementPage() {
  const router = useRouter();

  async function handleSubmit(data: StockMovementInput) {
    await MovementService.create(data);
    router.push("/admin/inventory/movements");
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Record Stock Movement" description="Log stock in or out for an inventory item." />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <MovementForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
