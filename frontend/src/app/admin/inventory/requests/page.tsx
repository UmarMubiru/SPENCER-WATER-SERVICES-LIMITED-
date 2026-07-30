"use client";

import { useState } from "react";
import RequestTable from "@/components/inventory/requests/RequestTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useMaterialRequests } from "@/hooks/inventory/useRequests";

export default function RequestsPage() {
  const [page, setPage] = useState(1);
  const { loading, requests, total } = useMaterialRequests({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader title="Material Requests" description="Project leads requesting inventory items." />
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <RequestTable requests={requests} />
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

