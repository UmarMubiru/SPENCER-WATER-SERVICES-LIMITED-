"use client";

// All-blue palette by design: severity/urgency is communicated through
// intensity (light -> dark) and fill vs outline, never through hue.
const STYLES: Record<string, string> = {
  IN_STOCK: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  LOW_STOCK: "bg-blue-200 text-blue-900 ring-1 ring-inset ring-blue-300",
  OUT_OF_STOCK: "bg-blue-800 text-white",

  ACTIVE: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  INACTIVE: "bg-blue-100 text-blue-500 ring-1 ring-inset ring-blue-200",

  PENDING: "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300",
  APPROVED: "bg-blue-600 text-white",
  REJECTED: "border border-blue-400 text-blue-500 bg-white",
  INVALID: "bg-blue-50 text-blue-400 ring-1 ring-inset ring-blue-200 line-through",

  NOT_ISSUED: "border border-blue-300 text-blue-500 bg-white",
  PARTIALLY_ISSUED: "bg-blue-200 text-blue-900 ring-1 ring-inset ring-blue-300",
  COMPLETED: "bg-blue-900 text-white",

  DRAFT: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200",
  SENT: "bg-blue-300 text-blue-900",
  ACCEPTED: "bg-blue-700 text-white",

  IN: "bg-blue-100 text-blue-800",
  OUT: "bg-blue-700 text-white",
};

const LABELS: Record<string, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  INVALID: "Invalid",
  NOT_ISSUED: "Not Issued",
  PARTIALLY_ISSUED: "Partially Issued",
  COMPLETED: "Completed",
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  IN: "Stock In",
  OUT: "Stock Out",
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        STYLES[status] ?? "bg-blue-100 text-blue-700"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
