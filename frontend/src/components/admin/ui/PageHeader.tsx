"use client";

import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-950">
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
