"use client";

import { useState } from "react";
import SalesQuotationTable from "@/components/inventory/quotations/SalesQuotationTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useSalesQuotations } from "@/hooks/inventory/useSalesQuotations";
import { SalesQuotationService } from "@/services/inventory/sales-quotation.service";

export default function SalesQuotationsPage() {
  const [page, setPage] = useState(1);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const { loading, quotations, total, refresh } = useSalesQuotations({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  async function handleAction(id: string, action: "send" | "accept" | "expire") {
    setActionPending(true);
    setActionError("");
    try {
      await SalesQuotationService[action](id);
      await refresh();
    } catch {
      setActionError("The quotation could not be updated. Please try again.");
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Sales Quotations"
        description="Customer quotes built from sellable products."
        actionLabel="New Quotation"
        actionHref="/admin/inventory/quotations/create"
      />
      {actionError && <p role="alert" className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700">{actionError}</p>}
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <SalesQuotationTable quotations={quotations} onAction={handleAction} actionPending={actionPending} />
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
