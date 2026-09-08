"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InventoryQuotationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inventory leads page
    router.replace('/admin/inventory/leads');
  }, [router]);

  return null;
}
