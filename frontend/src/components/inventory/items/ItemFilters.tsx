"use client";

import { useCategories } from "@/hooks/inventory/useCategories";

interface Props {
  search: string;
  category: string;
  status: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function ItemFilters({
  search, category, status, onSearchChange, onCategoryChange, onStatusChange,
}: Props) {
  const { categories } = useCategories({ page: 1 });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search items..."
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none"
      />

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
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
