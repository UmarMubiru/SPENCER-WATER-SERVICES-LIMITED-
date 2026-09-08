"use client";

import { useParams, useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import ProductForm from "@/components/inventory/products/ProductForm";
import { useProduct } from "@/hooks/inventory/useProducts";
import { ProductService } from "@/services/inventory/product.service";
import { ProductInput } from "@/types/inventory/products";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, product } = useProduct(id as string);

  async function handleSubmit(data: ProductInput) {
    await ProductService.update(id as string, data);
    router.push(`/admin/inventory/products/${id}`);
  }

  if (loading || !product) {
    return <div className="p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Edit Product" description={product.sku} />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <ProductForm initial={product} onSubmit={handleSubmit} submitLabel="Update Product" />
      </div>
    </div>
  );
}