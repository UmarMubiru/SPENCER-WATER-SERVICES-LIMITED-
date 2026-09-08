"use client";

import { useRouter } from "next/navigation";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import CategoryForm from "@/components/inventory/categories/CategoryForm";
import { CategoryService } from "@/services/inventory/category.service";
import { CategoryInput } from "@/types/inventory/categories";

export default function CreateCategoryPage() {
  const router = useRouter();

  async function handleSubmit(data: CategoryInput) {
    await CategoryService.create(data);
    router.push("/admin/inventory/categories");
  }

  return (
    <div className="space-y-8 p-8">
      <InventoryPageHeader title="Add Category" description="Create a new shared category." />
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <CategoryForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
