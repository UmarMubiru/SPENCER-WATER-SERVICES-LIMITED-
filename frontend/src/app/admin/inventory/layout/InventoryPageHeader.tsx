"use client";

import Link from "next/link";

interface InventoryPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function InventoryPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: InventoryPageHeaderProps) {
  return (
    <div className="inventory-page-header flex items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-white shadow-sm hover:bg-blue-700 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
