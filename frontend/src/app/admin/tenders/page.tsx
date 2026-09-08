'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TendersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/tenders/dashboard');
  }, [router]);

  return null;
}
