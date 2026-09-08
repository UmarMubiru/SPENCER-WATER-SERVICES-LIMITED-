'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/content/pages');
  }, [router]);

  return null;
}
