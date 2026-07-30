export type SalesQuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";

export interface SalesQuotationItem {
  id: string;
  product: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesQuotation {
  id: string;
  customerName: string;
  customerEmail?: string;
  status: SalesQuotationStatus;
  validUntil?: string | null;
  notes?: string;
  items: SalesQuotationItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export type SalesQuotationInput = {
  customerName: string;
  customerEmail?: string;
  validUntil?: string | null;
  notes?: string;
  items: { product: string; quantity: number; unitPrice: number }[];
};

export type ListSalesQuotationsParams = { page: number; status?: string };
