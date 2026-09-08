"use client";

import { useRouter } from "next/navigation";
import SupplierQuotationForm from "@/components/inventory/supplier-quotations/SupplierQuotationForm";
import { SupplierQuotationService } from "@/services/inventory/supplier-quotation.service";
import { SupplierQuotationInput } from "@/types/inventory/supplier-quotations";

export default function CreateSupplierQuotationPage() {
  const router = useRouter();

  async function handleSubmit(data: SupplierQuotationInput) {
    await SupplierQuotationService.create(data);
    router.push("/admin/inventory/supplier-quotations");
  }

  return (
    <div className="space-y-8 p-8">
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <SupplierQuotationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
