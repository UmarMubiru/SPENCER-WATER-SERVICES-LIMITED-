"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Tag,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  FileSpreadsheet,
  Truck,
  Droplet,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/inventory/dashboard", icon: LayoutDashboard },
  { label: "Inventory Items", href: "/admin/inventory/items", icon: Boxes },
  { label: "Products", href: "/admin/inventory/products", icon: ShoppingBag },
  { label: "Categories", href: "/admin/inventory/categories", icon: Tag },
  { label: "Stock Movements", href: "/admin/inventory/movements", icon: ArrowLeftRight },
  { label: "Requests", href: "/admin/inventory/requests", icon: ClipboardList },
  { label: "Sales Quotations", href: "/admin/inventory/quotations", icon: FileText },
  { label: "Supplier Quotations", href: "/admin/inventory/supplier-quotations", icon: FileSpreadsheet },
  { label: "Suppliers", href: "/admin/inventory/suppliers", icon: Truck },
];

export default function InventorySidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="inventory-sidebar sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto md:block"
      style={{
        background: "linear-gradient(180deg, var(--navy) 0%, var(--blue) 100%)",
      }}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-7">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 ring-1 ring-sky-300/30">
          <Droplet size={18} className="text-sky-300" fill="currentColor" fillOpacity={0.25} />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-[15px] uppercase font-bold text-white">Spencer</p>
          <p className="text-[11px] uppercase font-semibold tracking-wider text-white">Water Services</p>
        </div>
      </div>

      <div className="mx-5 mb-4 h-px bg-gradient-to-r from-white/20 via-white/8 to-transparent" />

      <nav className="flex flex-col gap-1 px-3 pb-8">
        {SIDEBAR_LINKS.map(({ label, href, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inventory-sidebar-link group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-white font-medium transition-all duration-150 ${
                active
                  ? "bg-white/12 text-white"
                  : "text-white hover:bg-white/8"
              }`}
            >
              {/* Signature glow bar for the active item */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-sky-300"
                  style={{ boxShadow: "0 0 12px 2px rgba(56,189,248,0.65)" }}
                />
              )}
              <Icon
                size={17}
                className={active ? "text-sky-300" : "text-white"}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
