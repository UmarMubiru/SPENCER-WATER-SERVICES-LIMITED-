"use client";

import { useEffect, useState } from "react";
import { MaterialRequest, ListRequestsParams } from "@/types/inventory/requests";
import { unwrapList } from "@/types/inventory/common";
import { RequestService } from "@/services/inventory/requests.service";

export function useMaterialRequest(id: string) {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<MaterialRequest | null>(null);

  const fetchOne = () =>
    RequestService.getById(id).then((res) => setRequest(res.data));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchOne().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { loading, request, refresh: fetchOne };
}

export function useMaterialRequests(params: ListRequestsParams) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [total, setTotal] = useState(0);

  const fetchAll = () =>
    RequestService.getAll(params).then((res) => {
      const { items, total } = unwrapList<MaterialRequest>(res.data);
      setRequests(items);
      setTotal(total);
    });

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.status, params.department]);

  return { loading, requests, total, refresh: fetchAll };
}
