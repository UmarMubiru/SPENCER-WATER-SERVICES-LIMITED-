export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, "name" | "description"> & { isActive?: boolean };

export type ListCategoriesParams = { page: number; search?: string };
