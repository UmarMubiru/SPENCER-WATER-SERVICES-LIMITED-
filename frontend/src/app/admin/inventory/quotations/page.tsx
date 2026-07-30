"use client";

import { useState } from "react";
import SalesQuotationTable from "@/components/inventory/quotations/SalesQuotationTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useSalesQuotations } from "@/hooks/inventory/useSalesQuotations";

export default function SalesQuotationsPage() {
  const [page, setPage] = useState(1);
  const { loading, quotations, total } = useSalesQuotations({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Sales Quotations"
        description="Customer quotes built from sellable products."
        actionLabel="New Quotation"
        actionHref="/admin/inventory/quotations/create"
      />
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <SalesQuotationTable quotations={quotations} />
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
