"use client";

import { useState } from "react";
import ProductTable from "@/components/inventory/products/ProductTable";
import ProductFilters from "@/components/inventory/products/ProductFilters";
import Pagination from "@/components/inventory/common/Pagination";
import { useProducts } from "@/hooks/inventory/useProducts";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
  });
  const { loading, products, total, refresh } = useProducts({ page, ...filters });
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <ProductFilters filters={filters} onFilterChange={setFilters} />
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
