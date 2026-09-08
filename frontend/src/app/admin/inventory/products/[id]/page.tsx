"use client";

import { useParams } from "next/navigation";
import StatusBadge from "@/components/inventory/common/StatusBadge";
import { useProduct } from "@/hooks/inventory/useProducts";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { loading, product } = useProduct(id as string);

  if (loading || !product) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-blue-900">Product Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-blue-400">Category</dt><dd className="text-blue-900">{product.categoryName || product.category || "—"}</dd></div>
            <div><dt className="text-blue-400">Unit</dt><dd className="text-blue-900">{product.unit}</dd></div>
            <div><dt className="text-blue-400">Cost Price</dt><dd className="text-blue-900">{product.costPrice}</dd></div>
            <div><dt className="text-blue-400">Selling Price</dt><dd className="text-blue-900">{product.sellingPrice}</dd></div>
            <div><dt className="text-blue-400">Supplier</dt><dd className="text-blue-900">{product.supplierName || "—"}</dd></div>
            <div><dt className="text-blue-400">Active</dt><dd className="text-blue-900">{product.isActive ? "Yes" : "No"}</dd></div>
          </dl>
          {product.description && (
            <div>
              <dt className="text-blue-400">Description</dt>
              <dd className="text-blue-900">{product.description}</dd>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-blue-900">Product Image</h3>
          {product.image ? (
            <div className="relative h-56 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 text-sm text-blue-400">
              No product image uploaded
            </div>
          )}
          <h3 className="mt-6 mb-4 font-semibold text-blue-900">Current Stock</h3>
          <h1 className="text-5xl font-bold text-blue-900">{product.quantity}</h1>
          <div className="mt-4"><StatusBadge status={product.status} /></div>
        </div>
      </div>
    </div>
  );
}
