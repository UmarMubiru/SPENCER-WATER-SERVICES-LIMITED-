"use client";

import Link from "next/link";
import StatusBadge from "../common/StatusBadge";
import { MaterialRequest } from "@/types/inventory/requests";

interface Props {
  requests: MaterialRequest[];
}

export default function RequestTable({ requests }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-blue-700">Project</th>
            <th className="px-6 py-4 text-left text-blue-700">Department</th>
            <th className="px-6 py-4 text-left text-blue-700">Requested By</th>
            <th className="px-6 py-4 text-center text-blue-700">Items</th>
            <th className="px-6 py-4 text-center text-blue-700">Status</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {(requests ?? []).map((r) => (
            <tr key={r.id} className="border-t border-blue-50">
              <td className="px-6 py-4 font-medium text-blue-900">{r.projectName || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{r.department || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{r.requestedByName || "—"}</td>
              <td className="px-6 py-4 text-center text-blue-900">{r.items?.length ?? 0}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={r.status} /></td>
              <td className="px-6 py-4 text-right">
                <Link href={`/admin/inventory/requests/${r.id}`} className="text-blue-600 hover:underline">View</Link>
              </td>
            </tr>
          ))}
          {(!requests || requests.length === 0) && (
            <tr><td colSpan={6} className="px-6 py-10 text-center text-blue-400">No requests found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
