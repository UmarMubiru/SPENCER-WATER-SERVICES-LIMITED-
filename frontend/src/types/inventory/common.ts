export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

// DRF's default pagination wrapper.
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function unwrapList<T>(data: T[] | PaginatedResponse<T>) {
  if (Array.isArray(data)) return { items: data, total: data.length };
  return { items: data.results, total: data.count };
}
