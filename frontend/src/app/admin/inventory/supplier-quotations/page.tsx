"use client";

import { useState } from "react";
import SupplierQuotationTable from "@/components/inventory/supplier-quotations/SupplierQuotationTable";
import Pagination from "@/components/inventory/common/Pagination";
import { useSupplierQuotations } from "@/hooks/inventory/useSupplierQuotations";
import { SupplierQuotationService } from "@/services/inventory/supplier-quotation.service";

export default function SupplierQuotationsPage() {
  const [page, setPage] = useState(1);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const { loading, quotations, total, refresh } = useSupplierQuotations({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  async function handleAction(id: string, action: "send" | "accept" | "reject") {
    setActionPending(true);
    setActionError("");
    try {
      await SupplierQuotationService[action](id);
      await refresh();
    } catch {
      setActionError("The quotation could not be updated. Please try again.");
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {actionError && <p role="alert" className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700">{actionError}</p>}
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <SupplierQuotationTable quotations={quotations} onAction={handleAction} actionPending={actionPending} />
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
