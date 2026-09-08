"use client";

import Link from "next/link";
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
            <th className="px-6 py-4 text-left text-blue-700">Items</th>
            <th className="px-6 py-4 text-left text-blue-700">Status</th>
            <th className="px-6 py-4 text-left text-blue-700">Description</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {(categories ?? []).map((c) => (
            <tr key={c.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{c.name}</td>
              <td className="px-6 py-4 text-blue-700">{c.itemCount ?? 0}</td>
              <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
              <td className="px-6 py-4 text-blue-700">{c.description || "—"}</td>
              <td className="px-6 py-4 text-right"><Link href={`/admin/inventory/categories/${c.id}`} className="text-blue-600 hover:underline">Edit</Link></td>
            </tr>
          ))}
          {(!categories || categories.length === 0) && (
            <tr><td colSpan={5} className="px-6 py-10 text-center text-blue-400">No categories yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
