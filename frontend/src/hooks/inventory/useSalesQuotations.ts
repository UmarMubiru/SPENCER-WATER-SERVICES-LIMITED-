"use client";

import { useEffect, useState } from "react";
import { SalesQuotation, ListSalesQuotationsParams } from "@/types/inventory/sales-quotations";
import { unwrapList } from "@/types/inventory/common";
import { SalesQuotationService } from "@/services/inventory/sales-quotation.service";

export function useSalesQuotations(params: ListSalesQuotationsParams) {
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    SalesQuotationService.getAll(params).then((res) => {
      const { items, total } = unwrapList<SalesQuotation>(res.data);
      setQuotations(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.status]);

  return { loading, quotations, total, refresh: fetchAll };
}

