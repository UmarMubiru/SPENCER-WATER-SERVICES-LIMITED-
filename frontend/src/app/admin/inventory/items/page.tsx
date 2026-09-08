"use client";

import { useState } from "react";
import Link from "next/link";
import ItemTable from "@/components/inventory/items/ItemTable";
import ItemFilters from "@/components/inventory/items/ItemFilters";
import Pagination from "@/components/inventory/common/Pagination";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";

export default function InventoryItemsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { loading, items, total } = useInventoryItems({ page, search, category, status });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory/items/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      <ItemFilters
        search={search}
        category={category}
        status={status}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onCategoryChange={(v) => { setCategory(v); setPage(1); }}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
      />

      {loading ? (
        <div className="p-8 text-blue-400">Loading...</div>
      ) : (
        <ItemTable items={items} />
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
