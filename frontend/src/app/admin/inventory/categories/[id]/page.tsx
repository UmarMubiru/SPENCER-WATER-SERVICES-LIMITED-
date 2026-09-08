"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryForm from "@/components/inventory/categories/CategoryForm";
import { CategoryService } from "@/services/inventory/category.service";
import { Category, CategoryInput } from "@/types/inventory/categories";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    CategoryService.getById(id).then((response) => setCategory(response.data)).catch(() => setError("Unable to load this category."));
  }, [id]);

  async function save(data: CategoryInput) {
    await CategoryService.update(id, data);
    router.push("/admin/inventory/categories");
  }

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!category) return <div className="p-8 text-blue-400">Loading...</div>;
  return <div className="p-8"><div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm"><CategoryForm initial={category} onSubmit={save} submitLabel="Update Category" /></div></div>;
}
