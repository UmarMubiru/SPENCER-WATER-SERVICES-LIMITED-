"use client";

import React from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, emptyMessage = "No data available" }: Props<T>) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-50">
              {columns.map((column) => (
                <th key={String(column.key)} className="px-5 py-3 text-left text-blue-700">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, index) => (
              <tr key={index} className="border-t border-blue-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4 text-blue-900">
                    {column.render ? column.render(row[column.key as keyof T], row) : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-blue-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
