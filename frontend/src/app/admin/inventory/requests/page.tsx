"use client";

import { useState } from "react";
import Link from "next/link";
import RequestTable from "@/components/inventory/requests/RequestTable";
import Pagination from "@/components/inventory/common/Pagination";
import { useMaterialRequests } from "@/hooks/inventory/useRequests";

export default function RequestsPage() {
  const [page, setPage] = useState(1);
  const { loading, requests, total } = useMaterialRequests({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/inventory/requests/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">New Request</Link>
      </div>
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
