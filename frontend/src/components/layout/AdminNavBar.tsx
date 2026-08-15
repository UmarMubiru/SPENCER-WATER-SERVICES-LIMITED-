"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Droplet } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Inventory", href: "/admin/inventory/dashboard" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100/70 bg-white/90 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-9">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 shadow-sm ring-1 ring-blue-200">
              <img
                src="/sws-logo-current.png"
                alt="Spencer Water Services logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-serif text-[15px] font-semibold text-blue-950">
              Spencer&nbsp;Water
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname?.startsWith(link.href.split("/").slice(0, 3).join("/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13.5px] font-medium transition-colors ${
                    active ? "text-blue-700" : "text-blue-400 hover:text-blue-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative text-blue-400 transition-colors hover:text-blue-700">
            <Bell size={19} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-blue-100" />

          <button className="flex items-center gap-2 text-[13.5px] font-medium text-blue-800 hover:text-blue-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">
              U
            </span>
            User
            <ChevronDown size={15} className="text-blue-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
