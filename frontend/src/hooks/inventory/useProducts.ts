"use client";

import { useEffect, useState } from "react";
import { Product, ListProductsParams } from "@/types/inventory/products";
import { unwrapList } from "@/types/inventory/common";
import { ProductService } from "@/services/inventory/product.service";

export function useProduct(id: string) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ProductService.getById(id)
      .then((res) => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    loading,
    product,
    refresh: async () => {
      const res = await ProductService.getById(id);
      setProduct(res.data);
    },
  };
}

export function useProducts(params: ListProductsParams) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    ProductService.getAll(params).then((res) => {
      const { items, total } = unwrapList<Product>(res.data);
      setProducts(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.search, params.category, params.status]);

  return { loading, products, total, refresh: fetchAll };
}
