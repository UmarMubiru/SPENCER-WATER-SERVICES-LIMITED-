"use client";

import { useState } from "react";
import Link from "next/link";
import SupplierTable from "@/components/inventory/suppliers/SupplierTable";
import Pagination from "@/components/inventory/common/Pagination";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const { loading, suppliers, total } = useSuppliers({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory/suppliers/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Supplier
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <SupplierTable suppliers={suppliers} />
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
