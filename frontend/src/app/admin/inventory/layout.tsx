import InventorySidebar from "@/components/inventory/layout/InventorySidebar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="inventory-module flex">
      <InventorySidebar />
      <main className="inventory-workspace min-h-screen flex-1">
        {children}
      </main>
    </div>
  );
}
