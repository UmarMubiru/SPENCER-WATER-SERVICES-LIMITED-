"use client";

import { useEffect, useState } from "react";
import { InventoryItem, ListInventoryItemsParams } from "@/types/inventory/inventory-items";
import { unwrapList } from "@/types/inventory/common";
import { InventoryItemService } from "@/services/inventory/inventory-item.service";

export function useInventoryItem(id: string) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    InventoryItemService.getById(id)
      .then((res) => setItem(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    loading,
    item,
    refresh: async () => {
      const res = await InventoryItemService.getById(id);
      setItem(res.data);
    },
  };
}

export function useInventoryItems(params: ListInventoryItemsParams) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    InventoryItemService.getAll(params).then((res) => {
      const { items, total } = unwrapList<InventoryItem>(res.data);
      setItems(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.search, params.category, params.status]);

  return { loading, items, total, refresh: fetchAll };
}

