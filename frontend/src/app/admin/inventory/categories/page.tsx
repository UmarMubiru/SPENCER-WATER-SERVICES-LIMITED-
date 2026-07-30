"use client";

import { useState } from "react";
import CategoryTable from "@/components/inventory/categories/CategoryTable";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useCategories } from "@/hooks/inventory/useCategories";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const { loading, categories, total } = useCategories({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Categories"
        description="Shared categories used by Inventory Items and Products."
        actionLabel="Add Category"
        actionHref="/admin/inventory/categories/create"
      />

      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <CategoryTable categories={categories} />
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
