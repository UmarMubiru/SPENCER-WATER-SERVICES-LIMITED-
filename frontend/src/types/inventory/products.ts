import { StockStatus } from "./common";

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string | null;
  categoryName?: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: StockStatus;
  supplier?: string | null;
  supplierName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<
  Product,
  "id" | "status" | "supplierName" | "categoryName" | "createdAt" | "updatedAt"
>;

export type ListProductsParams = {
  page: number;
  search?: string;
  category?: string;
  status?: string;
};
