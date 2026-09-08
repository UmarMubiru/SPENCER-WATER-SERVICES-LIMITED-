'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/reports/dashboard');
  }, [router]);

  return null;
}
