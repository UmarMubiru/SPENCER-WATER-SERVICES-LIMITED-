"use client";

import { useEffect, useState } from "react";
import { SupplierQuotation, ListSupplierQuotationsParams } from "@/types/inventory/supplier-quotations";
import { unwrapList } from "@/types/inventory/common";
import { SupplierQuotationService } from "@/services/inventory/supplier-quotation.service";

export function useSupplierQuotations(params: ListSupplierQuotationsParams) {
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    SupplierQuotationService.getAll(params).then((res) => {
      const { items, total } = unwrapList<SupplierQuotation>(res.data);
      setQuotations(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.status, params.supplier]);

  return { loading, quotations, total, refresh: fetchAll };
}
