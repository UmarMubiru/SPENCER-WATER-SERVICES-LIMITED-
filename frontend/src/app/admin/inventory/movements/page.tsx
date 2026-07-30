"use client";

import { useState } from "react";
import MovementTable from "@/components/inventory/movements/MovementTable";
import MovementFilters from "@/components/inventory/movements/MovementFilters";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useMovements } from "@/hooks/inventory/useMovements";

export default function MovementsPage() {
  const [movementType, setMovementType] = useState("");
  const [page, setPage] = useState(1);

  const { loading, movements, total } = useMovements({ page, movementType });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Stock Movements"
        description="Audit trail of inventory item stock in/out."
        actionLabel="Record Movement"
        actionHref="/admin/inventory/movements/create"
      />

      <MovementFilters
        movementType={movementType}
        onMovementTypeChange={(v) => { setMovementType(v); setPage(1); }}
      />

      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <MovementTable movements={movements} />
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
