import InventorySidebar from "@/components/inventory/layout/InventorySidebar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="inventory-module flex min-h-screen bg-[color:var(--background)] font-sans">
      <InventorySidebar />
      <main className="inventory-workspace min-h-screen flex-1 bg-[color:var(--background)] font-sans">
        {children}
      </main>
    </div>
  );
}
