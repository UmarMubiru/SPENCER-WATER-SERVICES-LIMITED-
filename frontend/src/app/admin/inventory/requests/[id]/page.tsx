"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import StatusBadge from "@/components/inventory/common/StatusBadge";

import { useMaterialRequest } from "@/hooks/inventory/useRequests";
import { RequestService } from "@/services/inventory/requests.service";

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";

type Panel = null | "approve" | "reject" | "invalidate" | "fulfill";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { loading, request, refresh } = useMaterialRequest(id as string);

  const [panel, setPanel] = useState<Panel>(null);
  const [notes, setNotes] = useState("");
  const [approvedQty, setApprovedQty] = useState<Record<string, number>>({});
  const [issueQty, setIssueQty] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openApprove() {
    const defaults: Record<string, number> = {};
    request?.items.forEach((l) => { defaults[l.id] = l.quantityRequested; });
    setApprovedQty(defaults);
    setNotes("");
    setError(null);
    setPanel("approve");
  }

  function openFulfill() {
    const defaults: Record<string, number> = {};
    request?.items.forEach((l) => { defaults[l.id] = l.quantityRemaining; });
    setIssueQty(defaults);
    setError(null);
    setPanel("fulfill");
  }

  async function runApprove() {
    setBusy(true);
    setError(null);
    try {
      await RequestService.approve(id as string, approvedQty, notes);
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to approve request.");
    } finally {
      setBusy(false);
    }
  }

  async function runReject() {
    setBusy(true);
    setError(null);
    try {
      await RequestService.reject(id as string, notes);
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to reject request.");
    } finally {
      setBusy(false);
    }
  }

  async function runInvalidate() {
    setBusy(true);
    setError(null);
    try {
      await RequestService.invalidate(id as string, notes);
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to mark request invalid.");
    } finally {
      setBusy(false);
    }
  }

  async function runFulfill() {
    setBusy(true);
    setError(null);
    try {
      await RequestService.fulfill(id as string, issueQty);
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to issue items.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !request) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader
        title={request.requestNumber}
        description={`${request.projectName || "—"} · ${request.department || "—"}`}
      />

      <div className="rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            <StatusBadge status={request.fulfillmentStatus} />
          </div>

          {request.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={openApprove}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Approve
              </button>
              <button
                onClick={() => { setNotes(""); setError(null); setPanel("reject"); }}
                className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Reject
              </button>
              <button
                onClick={() => { setNotes(""); setError(null); setPanel("invalidate"); }}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-50"
              >
                Mark Invalid
              </button>
            </div>
          )}

          {request.status === "APPROVED" && request.fulfillmentStatus !== "COMPLETED" && (
            <button
              onClick={openFulfill}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Issue Items
            </button>
          )}
        </div>

        {/* Action panels */}
        {panel === "approve" && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="mb-3 text-sm font-semibold text-blue-800">Approve Request</h4>
            {error && <p className="mb-3 text-sm text-blue-700">{error}</p>}
            <div className="space-y-2">
              {request.items.map((line) => (
                <div key={line.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-blue-800">
                    {line.inventoryItemName} — requested {line.quantityRequested}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={line.quantityRequested}
                    value={approvedQty[line.id] ?? 0}
                    onChange={(e) =>
                      setApprovedQty((q) => ({ ...q, [line.id]: Number(e.target.value) }))
                    }
                    className="w-24 rounded-lg border border-blue-200 px-3 py-1.5 text-blue-900"
                  />
                </div>
              ))}
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} mt-4`}
              rows={2}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={runApprove}
                disabled={busy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Approving..." : "Confirm Approval"}
              </button>
              <button onClick={() => setPanel(null)} className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {(panel === "reject" || panel === "invalidate") && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="mb-3 text-sm font-semibold text-blue-800">
              {panel === "reject" ? "Reject Request" : "Mark Request Invalid"}
            </h4>
            {error && <p className="mb-3 text-sm text-blue-700">{error}</p>}
            <textarea
              placeholder="Reason (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              rows={2}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={panel === "reject" ? runReject : runInvalidate}
                disabled={busy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Confirm"}
              </button>
              <button onClick={() => setPanel(null)} className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {panel === "fulfill" && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="mb-3 text-sm font-semibold text-blue-800">Issue Items</h4>
            {error && <p className="mb-3 text-sm text-blue-700">{error}</p>}
            <div className="space-y-2">
              {request.items.filter((l) => l.quantityRemaining > 0).map((line) => (
                <div key={line.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-blue-800">
                    {line.inventoryItemName} — {line.quantityRemaining} remaining
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={line.quantityRemaining}
                    value={issueQty[line.id] ?? 0}
                    onChange={(e) =>
                      setIssueQty((q) => ({ ...q, [line.id]: Number(e.target.value) }))
                    }
                    className="w-24 rounded-lg border border-blue-200 px-3 py-1.5 text-blue-900"
                  />
                </div>
              ))}
              {request.items.every((l) => l.quantityRemaining <= 0) && (
                <p className="text-sm text-blue-400">Everything on this request has already been issued.</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={runFulfill}
                disabled={busy}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {busy ? "Issuing..." : "Confirm Issue"}
              </button>
              <button onClick={() => setPanel(null)} className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Requester / reviewer / issuer summary */}
        <dl className="mb-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-blue-400">Requested By</dt>
            <dd className="text-blue-900">{request.requestedByName || "—"}</dd>
          </div>
          <div>
            <dt className="text-blue-400">Requested On</dt>
            <dd className="text-blue-900">{new Date(request.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-blue-400">Reviewed By</dt>
            <dd className="text-blue-900">{request.reviewedByName || "—"}</dd>
          </div>
          <div>
            <dt className="text-blue-400">Reviewed On</dt>
            <dd className="text-blue-900">
              {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-blue-400">Issued By</dt>
            <dd className="text-blue-900">{request.issuedByName || "—"}</dd>
          </div>
          <div>
            <dt className="text-blue-400">Issued On</dt>
            <dd className="text-blue-900">
              {request.issuedAt ? new Date(request.issuedAt).toLocaleString() : "—"}
            </dd>
          </div>
        </dl>

        {request.notes && (
          <div className="mb-4">
            <dt className="text-blue-400 text-sm">Requester Notes</dt>
            <dd className="text-blue-900">{request.notes}</dd>
          </div>
        )}

        {request.reviewNotes && (
          <div className="mb-6">
            <dt className="text-blue-400 text-sm">Reviewer Notes</dt>
            <dd className="text-blue-900">{request.reviewNotes}</dd>
          </div>
        )}

        <h3 className="mb-3 font-semibold text-blue-900">Items</h3>
        <div className="overflow-hidden rounded-xl border border-blue-100">
          <table className="min-w-full">
            <thead className="bg-blue-50/60">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Item</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Requested</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Approved</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Issued</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((line) => (
                <tr key={line.id} className="border-t border-blue-50">
                  <td className="px-4 py-3 text-blue-900">
                    {line.inventoryItemName} ({line.inventoryItemSku})
                  </td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityRequested}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityApproved ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityIssued}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityRemaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
