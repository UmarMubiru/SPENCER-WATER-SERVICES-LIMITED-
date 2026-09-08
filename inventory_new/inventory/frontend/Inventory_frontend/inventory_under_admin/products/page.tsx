"use client";

import { useState } from "react";
import ProductTable from "@/components/inventory/products/ProductTable";
import ProductFilters from "@/components/inventory/products/ProductFilters";
import Pagination from "@/components/inventory/common/Pagination";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import { useProducts } from "@/hooks/inventory/useProducts";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { loading, products, total } = useProducts({ page, search, category, status });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-8">
      <InventoryPageHeader
        title="Products"
        description="Catalogue of items sold to customers."
        actionLabel="Add Product"
        actionHref="/admin/inventory/products/create"
      />

      <ProductFilters
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
        <ProductTable products={products} />
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
