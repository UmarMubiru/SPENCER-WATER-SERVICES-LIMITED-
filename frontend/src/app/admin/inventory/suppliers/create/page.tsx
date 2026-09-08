"use client";

import { useRouter } from "next/navigation";
import SupplierForm from "@/components/inventory/suppliers/SupplierForm";
import { SupplierService } from "@/services/inventory/supplier.service";
import { SupplierInput } from "@/types/inventory/supplier";

export default function CreateSupplierPage() {
  const router = useRouter();

  async function handleSubmit(data: SupplierInput) {
    await SupplierService.create(data);
    router.push("/admin/inventory/suppliers");
  }

  return (
    <div className="space-y-8 p-8">
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <SupplierForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
