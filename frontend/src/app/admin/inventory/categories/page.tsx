"use client";

import { useState } from "react";
import Link from "next/link";
import CategoryTable from "@/components/inventory/categories/CategoryTable";
import Pagination from "@/components/inventory/common/Pagination";
import { useCategories } from "@/hooks/inventory/useCategories";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const { loading, categories, total } = useCategories({ page });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/inventory/categories/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add Category</Link>
      </div>
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
