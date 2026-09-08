'use client';

import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full px-4 md:px-0">
        {children}
      </div>
    </div>
  );
}
