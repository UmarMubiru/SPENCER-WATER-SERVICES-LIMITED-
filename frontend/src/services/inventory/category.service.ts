import inventoryAPI from "./api";
import { ListCategoriesParams, CategoryInput } from "@/types/inventory/categories";

export const CategoryService = {
  getAll: (params: ListCategoriesParams) => inventoryAPI.get("/categories/", { params }),
  getById: (id: string) => inventoryAPI.get(`/categories/${id}/`),
  create: (data: CategoryInput) => inventoryAPI.post("/categories/", data),
  update: (id: string, data: Partial<CategoryInput>) => inventoryAPI.patch(`/categories/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/categories/${id}/`),
};
