"use client";

import { useEffect, useState } from "react";
import { Supplier, ListSuppliersParams } from "@/types/inventory/supplier";
import { unwrapList } from "@/types/inventory/common";
import { SupplierService } from "@/services/inventory/supplier.service";

export function useSuppliers(params: ListSuppliersParams) {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    SupplierService.getAll(params).then((res) => {
      const { items, total } = unwrapList<Supplier>(res.data);
      setSuppliers(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.status]);

  return { loading, suppliers, total, refresh: fetchAll };
}

