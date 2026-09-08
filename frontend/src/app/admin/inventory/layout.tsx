'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin/inventory': { title: 'Inventory Management', subtitle: 'Manage inventory items, suppliers, and stock movements' },
  '/admin/inventory/dashboard': { title: 'Inventory Dashboard', subtitle: 'Overview of inventory status and recent activities' },
  '/admin/inventory/items': { title: 'Inventory Items', subtitle: 'View and manage all inventory items' },
  '/admin/inventory/categories': { title: 'Categories', subtitle: 'Manage inventory item categories' },
  '/admin/inventory/suppliers': { title: 'Suppliers', subtitle: 'Manage supplier information' },
  '/admin/inventory/movements': { title: 'Stock Movements', subtitle: 'Track all stock in and out movements' },
  '/admin/inventory/products': { title: 'Products', subtitle: 'View and manage product catalog' },
  '/admin/inventory/requests': { title: 'Material Requests', subtitle: 'Manage material requests' },
  '/admin/inventory/quotations': { title: 'Sales Quotations', subtitle: 'Manage customer quotations' },
  '/admin/inventory/supplier-quotations': { title: 'Supplier Quotations', subtitle: 'Manage supplier quotations' },
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Get title/subtitle based on current path, default to inventory management
  const pageInfo = PAGE_TITLES[pathname] || PAGE_TITLES['/admin/inventory'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar
            activePath={pathname}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-[16.25rem] transition-all duration-300 min-h-screen flex flex-col">
            {/* Topbar - Fixed */}
            <div className="flex-shrink-0 sticky top-0 z-40">
              <Topbar
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isMenuOpen={isSidebarOpen}
              />
            </div>

            {/* Content */}
            <div className="admin-workspace flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
