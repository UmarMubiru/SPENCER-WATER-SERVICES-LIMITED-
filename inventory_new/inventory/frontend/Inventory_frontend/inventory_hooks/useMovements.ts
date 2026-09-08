"use client";

import { useEffect, useState } from "react";
import { StockMovement, ListMovementsParams } from "@/types/inventory/movement";
import { unwrapList } from "@/types/inventory/common";
import { MovementService } from "@/services/inventory/movement.service";

export function useMovements(params: ListMovementsParams) {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    MovementService.getAll(params).then((res) => {
      const { items, total } = unwrapList<StockMovement>(res.data);
      setMovements(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.movementType, params.inventoryItem]);

  return { loading, movements, total, refresh: fetchAll };
}

