export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;

export type ListCategoriesParams = { page: number; search?: string };
