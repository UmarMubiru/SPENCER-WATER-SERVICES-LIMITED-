"use client";

import Link from "next/link";
import StatusBadge from "../common/StatusBadge";
import { MaterialRequest } from "@/types/inventory/requests";

interface Props {
  requests: MaterialRequest[];
}

export default function RequestTable({ requests }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="min-w-full">
        <thead className="bg-blue-50/60">
          <tr>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Request #</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Project</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Requester</th>
            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Requested On</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Items</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
            <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Fulfillment</th>
            <th className="px-6 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {(requests ?? []).map((r) => (
            <tr key={r.id} className="border-t border-blue-50 transition-colors hover:bg-blue-50/40">
              <td className="px-6 py-4 font-mono text-[13px] text-blue-900">{r.requestNumber}</td>
              <td className="px-6 py-4 font-medium text-blue-900">{r.projectName || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{r.requestedByName || "—"}</td>
              <td className="px-6 py-4 text-blue-700">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-6 py-4 text-center text-blue-900">{r.items?.length ?? 0}</td>
              <td className="px-6 py-4 text-center"><StatusBadge status={r.status} /></td>
              <td className="px-6 py-4 text-center"><StatusBadge status={r.fulfillmentStatus} /></td>
              <td className="px-6 py-4 text-right">
                <Link href={`/admin/inventory/requests/${r.id}`} className="text-blue-600 hover:underline">View</Link>
              </td>
            </tr>
          ))}
          {(!requests || requests.length === 0) && (
            <tr><td colSpan={8} className="px-6 py-10 text-center text-blue-400">No requests found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
