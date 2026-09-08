"use client";

import { useCategories } from "@/hooks/inventory/useCategories";

interface Props {
  filters: {
    search: string;
    category: string;
    status: string;
  };
  onFilterChange: (filters: {
    search: string;
    category: string;
    status: string;
  }) => void;
}

export default function ProductFilters({ filters, onFilterChange }: Props) {
  const { categories } = useCategories({ page: 1 });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <input
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        placeholder="Search products..."
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none"
      />

      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Status</option>
        <option value="IN_STOCK">In Stock</option>
        <option value="LOW_STOCK">Low Stock</option>
        <option value="OUT_OF_STOCK">Out of Stock</option>
      </select>
    </div>
  );
}
