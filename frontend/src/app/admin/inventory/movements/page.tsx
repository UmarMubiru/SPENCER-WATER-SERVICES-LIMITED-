"use client";

import { useState } from "react";
import Link from "next/link";
import MovementTable from "@/components/inventory/movements/MovementTable";
import MovementFilters from "@/components/inventory/movements/MovementFilters";
import Pagination from "@/components/inventory/common/Pagination";
import { useMovements } from "@/hooks/inventory/useMovements";

export default function MovementsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    itemType: "",
    movementType: "",
    startDate: "",
    endDate: "",
  });
  const { loading, movements, total, refresh } = useMovements({ page, ...filters });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory/movements/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Record Movement
        </Link>
      </div>

      <MovementFilters filters={filters} onFilterChange={setFilters} />
      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <MovementTable movements={movements} onRefresh={refresh} />
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
