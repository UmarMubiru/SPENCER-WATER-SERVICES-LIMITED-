"use client";

interface Props {
  movementType: string;
  onMovementTypeChange: (value: string) => void;
}

export default function MovementFilters({ movementType, onMovementTypeChange }: Props) {
  return (
    <div className="grid gap-4 md:w-64">
      <select
        value={movementType}
        onChange={(e) => onMovementTypeChange(e.target.value)}
        className="rounded-lg border border-blue-200 px-4 py-2 text-blue-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">All Types</option>
        <option value="IN">Stock In</option>
        <option value="OUT">Stock Out</option>
      </select>
    </div>
  );
}