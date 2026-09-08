'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CRMPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/crm/leads');
  }, [router]);

  return null;
}
