import InventorySidebar from "@/components/inventory/layout/InventorySidebar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <InventorySidebar />
      <main className="min-h-[calc(100vh-4rem)] flex-1">
        {children}
      </main>
    </div>
  );
}