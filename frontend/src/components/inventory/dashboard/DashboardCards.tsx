"use client";

import { Boxes, ShoppingBag, AlertTriangle, ClipboardList } from "lucide-react";

interface Props {
  totalItems: number;
  totalProducts: number;
  lowStock: number;
  pendingRequests: number;
}

const CARDS = (p: Props) => [
  { label: "Inventory Items", value: p.totalItems, icon: Boxes, tint: "from-blue-600 to-blue-700" },
  { label: "Products", value: p.totalProducts, icon: ShoppingBag, tint: "from-sky-500 to-blue-600" },
  { label: "Low Stock", value: p.lowStock, icon: AlertTriangle, tint: "from-blue-800 to-blue-950" },
  { label: "Pending Requests", value: p.pendingRequests, icon: ClipboardList, tint: "from-blue-400 to-blue-600" },
];

export default function DashboardCards(props: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS(props).map(({ label, value, icon: Icon, tint }) => (
        <div
          key={label}
          className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-blue-400">{label}</span>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} shadow-inner`}
            >
              <Icon size={17} className="text-white" />
            </span>
          </div>
          <div className="font-serif mt-4 text-[32px] font-semibold leading-none text-blue-950">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
