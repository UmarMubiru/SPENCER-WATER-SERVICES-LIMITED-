"use client";

import { useState } from "react";
import SupplierTable from "@/components/inventory/suppliers/SupplierTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useSuppliers } from "@/hooks/inventory/useSuppliers";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const { loading, suppliers, total } = useSuppliers({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Suppliers"
        description="Vendors supplying inventory items and products."
        actionLabel="Add Supplier"
        actionHref="/admin/inventory/suppliers/create"
      />
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
