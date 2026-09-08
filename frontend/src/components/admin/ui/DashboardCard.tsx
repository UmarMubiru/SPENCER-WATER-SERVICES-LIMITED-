"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint: string;
  href?: string;
  description?: string;
}

export default function DashboardCard({ label, value, icon: Icon, tint, href, description }: Props) {
  const Card = (
    <div
      className="group rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-blue-400">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tint} shadow-inner`}
        >
          <Icon size={16} className="text-white" />
        </span>
      </div>
      <div className="font-serif mt-3 text-[28px] font-semibold leading-none text-blue-950">
        {value}
      </div>
      {description && (
        <div className="mt-2 text-xs text-gray-500">
          {description}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {Card}
      </a>
    );
  }

  return Card;
}
