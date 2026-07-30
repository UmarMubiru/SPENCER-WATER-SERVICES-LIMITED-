"use client";

import { useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import SalesQuotationForm from "@/components/inventory/quotations/SalesQuotationForm";
import { SalesQuotationService } from "@/services/inventory/sales-quotation.service";
import { SalesQuotationInput } from "@/types/inventory/sales-quotations";

export default function CreateSalesQuotationPage() {
  const router = useRouter();

  async function handleSubmit(data: SalesQuotationInput) {
    await SalesQuotationService.create(data);
    router.push("/admin/inventory/quotations");
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="New Sales Quotation" description="Build a quote for a customer." />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <SalesQuotationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}