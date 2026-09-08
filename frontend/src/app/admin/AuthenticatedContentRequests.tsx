'use client';

import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthenticatedContentRequests() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const isContentRequest = url.includes('/api/content/') || url.includes('/api/website-images/') || url.includes('/api/users/');

      if (!isContentRequest) return originalFetch(input, init);

      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${token}`);
      return originalFetch(input, { ...init, headers });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  return null;
}
