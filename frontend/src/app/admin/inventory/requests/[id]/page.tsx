"use client";

import { useParams, useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import StatusBadge from "@/components/inventory/common/StatusBadge";
import { useMaterialRequest } from "@/hooks/inventory/useRequests";
import { RequestService } from "@/services/inventory/requests.service";

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, request, refresh } = useMaterialRequest(id as string);

  async function handleApprove() {
    await RequestService.approve(id as string);
    refresh();
  }

  async function handleReject() {
    await RequestService.reject(id as string);
    refresh();
  }

  async function handleIssue() {
    try {
      await RequestService.issue(id as string);
      refresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Failed to issue request.");
    }
  }

  if (loading || !request) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader
        title={request.projectName || "Material Request"}
        description={request.department || "—"}
      />

      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <StatusBadge status={request.status} />

          {request.status === "PENDING" && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="rounded-lg border border-blue-400 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
              >
                Reject
              </button>
            </div>
          )}

          {request.status === "APPROVED" && (
            <button
              onClick={handleIssue}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Issue
            </button>
          )}
        </div>

        <dl className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-blue-400">Requested By</dt><dd className="text-blue-900">{request.requestedByName || "—"}</dd></div>
          <div><dt className="text-blue-400">Department</dt><dd className="text-blue-900">{request.department || "—"}</dd></div>
        </dl>

        {request.notes && (
          <div className="mb-6">
            <dt className="text-blue-400">Notes</dt>
            <dd className="text-blue-900">{request.notes}</dd>
          </div>
        )}

        <h3 className="mb-3 font-semibold text-blue-900">Items</h3>
        <div className="overflow-hidden rounded-lg border border-blue-100">
          <table className="min-w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-blue-700">Item</th>
                <th className="px-4 py-3 text-center text-blue-700">Requested</th>
                <th className="px-4 py-3 text-center text-blue-700">Approved</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((line) => (
                <tr key={line.id} className="border-t border-blue-50">
                  <td className="px-4 py-3 text-blue-900">
                    {line.inventoryItemName ?? line.inventoryItem} ({line.inventoryItemSku})
                  </td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityRequested}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityApproved ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}