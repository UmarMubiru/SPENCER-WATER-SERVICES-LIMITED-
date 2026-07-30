"use client";

import { Category } from "@/types/inventory/categories";

interface Props {
  categories: Category[];
}

export default function CategoryTable({ categories }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Name</th>
            <th className="px-6 py-4 text-left text-blue-700">Description</th>
          </tr>
        </thead>
        <tbody>
          {(categories ?? []).map((c) => (
            <tr key={c.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{c.name}</td>
              <td className="px-6 py-4 text-blue-700">{c.description || "—"}</td>
            </tr>
          ))}
          {(!categories || categories.length === 0) && (
            <tr><td colSpan={2} className="px-6 py-10 text-center text-blue-400">No categories yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
