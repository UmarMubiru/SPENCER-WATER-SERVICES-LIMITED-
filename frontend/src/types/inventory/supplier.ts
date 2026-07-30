export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export type SupplierInput = Omit<Supplier, "id" | "createdAt" | "updatedAt">;

export type ListSuppliersParams = { page: number; status?: string };
