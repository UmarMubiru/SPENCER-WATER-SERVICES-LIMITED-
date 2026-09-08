'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/user-management/credentials');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
