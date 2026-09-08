"use client";

import { useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import ProductForm from "@/components/inventory/products/ProductForm";
import { ProductService } from "@/services/inventory/product.service";
import { ProductInput } from "@/types/inventory/products";

export default function CreateProductPage() {
  const router = useRouter();

  async function handleSubmit(data: ProductInput) {
    await ProductService.create(data);
    router.push("/admin/inventory/products");
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Add Product" description="Add a new sellable catalogue item." />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

