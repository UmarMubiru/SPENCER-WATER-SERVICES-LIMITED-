"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import StatusBadge from "@/components/inventory/common/StatusBadge";

import { useMaterialRequest } from "@/hooks/inventory/useRequests";
import { RequestService } from "@/services/inventory/requests.service";

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";

type Panel = null | "approve" | "reject" | "invalidate" | "fulfill" | "returnTool" | "extendReturn";

export default function RequestDetailPage() {
  const { id } = useParams();
  const { loading, request, refresh } = useMaterialRequest(id as string);

  const [panel, setPanel] = useState<Panel>(null);
  const [notes, setNotes] = useState("");
  const [approvedQty, setApprovedQty] = useState<Record<string, number>>({});
  const [issueQty, setIssueQty] = useState<Record<string, number>>({});
  const [returnQty, setReturnQty] = useState<Record<string, number>>({});
  const [returnCondition, setReturnCondition] = useState<Record<string, string>>({});
  const [returnNotes, setReturnNotes] = useState("");
  const [extendItemId, setExtendItemId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extendReason, setExtendReason] = useState("");
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

  function openReturnTool() {
    const defaults: Record<string, number> = {};
    const conditionDefaults: Record<string, string> = {};
    request?.items.forEach((l) => {
      if (l.inventoryItemType === "COMPANY_TOOL" && l.quantityIssued > 0) {
        defaults[l.id] = l.quantityIssued;
        conditionDefaults[l.id] = "GOOD";
      }
    });
    setReturnQty(defaults);
    setReturnCondition(conditionDefaults);
    setReturnNotes("");
    setError(null);
    setPanel("returnTool");
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

  async function runReturnTool() {
    setBusy(true);
    setError(null);
    try {
      // Return each tool item
      for (const [itemId, qty] of Object.entries(returnQty)) {
        if (qty > 0) {
          await RequestService.returnTool(itemId, {
            quantity_returned: qty,
            condition_at_return: returnCondition[itemId] || "GOOD",
            return_notes: returnNotes,
          });
        }
      }
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to return tools.");
    } finally {
      setBusy(false);
    }
  }

  function openExtendReturn(itemId: string, currentDate: string) {
    setExtendItemId(itemId);
    setExtendDate(currentDate);
    setExtendReason("");
    setError(null);
    setPanel("extendReturn");
  }

  async function runExtendReturn() {
    if (!extendItemId) return;
    setBusy(true);
    setError(null);
    try {
      await RequestService.extendReturnDate(extendItemId, {
        expected_return_date: extendDate,
        reason: extendReason,
      });
      setPanel(null);
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to extend return date.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !request) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
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

          {request.status === "APPROVED" && request.fulfillmentStatus === "COMPLETED" && request.items.some((l) => l.inventoryItemType === "COMPANY_TOOL" && l.quantityIssued > 0) && (
            <button
              onClick={openReturnTool}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Return Tools
            </button>
          )}
        </div>

        {/* Action panels */}
        {panel === "approve" && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="mb-1 text-sm font-semibold text-blue-800">Approve Request</h4>
            <p className="mb-3 text-xs text-blue-600">
              Set the quantity authorised for issue. It can be lower or higher than the requested amount; stock is checked when items are issued.
            </p>
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
                    value={approvedQty[line.id] ?? 0}
                    onChange={(e) =>
                      setApprovedQty((q) => ({ ...q, [line.id]: Number(e.target.value) }))
                    }
                    aria-label={`Approved quantity for ${line.inventoryItemName}`}
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

        {panel === "returnTool" && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50/40 p-5">
            <h4 className="mb-3 text-sm font-semibold text-green-800">Return Company Tools</h4>
            <p className="mb-3 text-xs text-green-600">
              Return tools to inventory. Select the quantity and condition for each tool.
            </p>
            {error && <p className="mb-3 text-sm text-green-700">{error}</p>}
            <div className="space-y-3">
              {request.items.filter((l) => l.inventoryItemType === "COMPANY_TOOL" && l.quantityIssued > 0).map((line) => (
                <div key={line.id} className="rounded-lg border border-green-200 bg-white p-3">
                  <div className="mb-2 text-sm font-medium text-green-900">
                    {line.inventoryItemName} — {line.quantityIssued} issued
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-green-600 mb-1">Quantity to Return</label>
                      <input
                        type="number"
                        min={0}
                        max={line.quantityIssued}
                        value={returnQty[line.id] ?? 0}
                        onChange={(e) =>
                          setReturnQty((q) => ({ ...q, [line.id]: Number(e.target.value) }))
                        }
                        className="w-24 rounded-lg border border-green-200 px-3 py-1.5 text-green-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-green-600 mb-1">Condition</label>
                      <select
                        value={returnCondition[line.id] || "GOOD"}
                        onChange={(e) =>
                          setReturnCondition((c) => ({ ...c, [line.id]: e.target.value }))
                        }
                        className="w-32 rounded-lg border border-green-200 px-3 py-1.5 text-green-900"
                      >
                        <option value="GOOD">Good</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {request.items.every((l) => l.inventoryItemType !== "COMPANY_TOOL" || l.quantityIssued <= 0) && (
                <p className="text-sm text-green-400">No company tools to return on this request.</p>
              )}
            </div>
            <textarea
              placeholder="Return notes (optional - describe damage, loss, etc.)"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className={`${inputClass} mt-4`}
              rows={2}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={runReturnTool}
                disabled={busy}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? "Returning..." : "Confirm Return"}
              </button>
              <button onClick={() => setPanel(null)} className="rounded-lg border border-green-200 px-4 py-2 text-sm text-green-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {panel === "extendReturn" && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="mb-3 text-sm font-semibold text-blue-800">Extend Return Date</h4>
            <p className="mb-3 text-xs text-blue-600">
              Extend the expected return date for this tool.
            </p>
            {error && <p className="mb-3 text-sm text-blue-700">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">New Expected Return Date</label>
                <input
                  type="date"
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Reason for Extension</label>
                <textarea
                  placeholder="Explain why the return date needs to be extended..."
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className={inputClass}
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={runExtendReturn}
                disabled={busy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Extending..." : "Confirm Extension"}
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
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Type</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Requested</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Approved</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Issued</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Remaining</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Responsible</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Expected Return</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Condition</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((line) => (
                <tr key={line.id} className="border-t border-blue-50">
                  <td className="px-4 py-3 text-blue-900">
                    {line.inventoryItemName} ({line.inventoryItemSku})
                  </td>
                  <td className="px-4 py-3 text-center text-blue-900">
                    <span className={`text-xs px-2 py-1 rounded-full ${line.inventoryItemType === "COMPANY_TOOL" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                      {line.inventoryItemType === "COMPANY_TOOL" ? "Tool" : "Material"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityRequested}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityApproved ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityIssued}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.quantityRemaining}</td>
                  <td className="px-4 py-3 text-center text-blue-900">{line.responsiblePersonName || "—"}</td>
                  <td className="px-4 py-3 text-center text-blue-900">
                    <div className="flex items-center justify-center gap-2">
                      {line.expectedReturnDate ? new Date(line.expectedReturnDate).toLocaleDateString() : "—"}
                      {line.inventoryItemType === "COMPANY_TOOL" && line.expectedReturnDate && (
                        <button
                          onClick={() => openExtendReturn(line.id, line.expectedReturnDate || "")}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Extend return date"
                        >
                          Extend
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-blue-900">
                    {line.conditionAtReturn ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        line.conditionAtReturn === "GOOD" ? "bg-green-100 text-green-800" :
                        line.conditionAtReturn === "DAMAGED" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {line.conditionAtReturn}
                      </span>
                    ) : line.conditionAtIssue || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
