export type SupplierQuotationStatus = "DRAFT" | "SENT" | "RECEIVED" | "ACCEPTED" | "REJECTED";

export interface SupplierQuotationItem {
  id: string;
  inventoryItem?: string | null;
  inventoryItemName?: string;
  product?: string | null;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SupplierQuotation {
  id: string;
  supplier: string;
  supplierName?: string;
  status: SupplierQuotationStatus;
  validUntil?: string | null;
  notes?: string;
  items: SupplierQuotationItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Each line references exactly one of inventoryItem / product.
export type SupplierQuotationInput = {
  supplier: string;
  validUntil?: string | null;
  notes?: string;
  items: {
    inventoryItem?: string | null;
    product?: string | null;
    quantity: number;
    unitPrice: number;
  }[];
};

export type ListSupplierQuotationsParams = { page: number; status?: string; supplier?: string };
