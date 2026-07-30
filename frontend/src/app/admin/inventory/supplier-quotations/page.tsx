"use client";

import { useState } from "react";
import SupplierQuotationTable from "@/components/inventory/supplier-quotations/SupplierQuotationTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useSupplierQuotations } from "@/hooks/inventory/useSupplierQuotations";

export default function SupplierQuotationsPage() {
  const [page, setPage] = useState(1);
  const { loading, quotations, total } = useSupplierQuotations({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Supplier Quotations"
        description="Requests for pricing sent to suppliers, for restocking inventory items or products."
        actionLabel="New Supplier Quotation"
        actionHref="/admin/inventory/supplier-quotations/create"
      />
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <SupplierQuotationTable quotations={quotations} />
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
