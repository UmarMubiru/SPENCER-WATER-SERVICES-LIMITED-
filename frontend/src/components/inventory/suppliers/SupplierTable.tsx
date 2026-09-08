"use client";

import StatusBadge from "../common/StatusBadge";
import { Supplier } from "@/types/inventory/supplier";

interface Props {
  suppliers: Supplier[];
}

export default function SupplierTable({ suppliers }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Name</th>
            <th className="px-6 py-4 text-left text-blue-700">Email</th>
            <th className="px-6 py-4 text-left text-blue-700">Phone</th>
            <th className="px-6 py-4 text-center text-blue-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {(suppliers ?? []).map((s) => (
            <tr key={s.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{s.name}</td>
              <td className="px-6 py-4 text-blue-700">{s.email || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{s.phone || "—"}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={s.status} /></td>
            </tr>
          ))}
          {(!suppliers || suppliers.length === 0) && (
            <tr><td colSpan={4} className="px-6 py-10 text-center text-blue-400">No suppliers found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
