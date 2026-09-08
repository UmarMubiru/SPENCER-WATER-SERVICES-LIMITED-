"use client";

import { useEffect, useState } from "react";
import { Category, ListCategoriesParams } from "@/types/inventory/categories";
import { unwrapList } from "@/types/inventory/common";
import { CategoryService } from "@/services/inventory/category.service";

export function useCategories(params: ListCategoriesParams) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    CategoryService.getAll(params).then((res) => {
      const { items, total } = unwrapList<Category>(res.data);
      setCategories(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.search]);

  return { loading, categories, total, refresh: fetchAll };
}

