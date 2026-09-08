"use client";

interface Props {
  filters: {
    itemType: string;
    movementType: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: {
    itemType: string;
    movementType: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export default function MovementFilters({ filters, onFilterChange }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <select
        value={filters.itemType}
        onChange={(e) => onFilterChange({ ...filters, itemType: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Item Types</option>
        <option value="MATERIAL">Material</option>
        <option value="COMPANY_TOOL">Company Tool</option>
      </select>
      <select
        value={filters.movementType}
        onChange={(e) => onFilterChange({ ...filters, movementType: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Types</option>
        <option value="IN">Stock In</option>
        <option value="OUT">Stock Out</option>
      </select>
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
        placeholder="Start Date"
      />
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
        placeholder="End Date"
      />
    </div>
  );
}