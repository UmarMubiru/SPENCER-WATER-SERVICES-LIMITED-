import inventoryAPI from "./api";
import { ListProductsParams, ProductInput } from "@/types/inventory/products";

export const ProductService = {
  getAll: (params: ListProductsParams) => inventoryAPI.get("/products/", { params }),
  getById: (id: string) => inventoryAPI.get(`/products/${id}/`),
  create: (data: ProductInput) => inventoryAPI.post("/products/", data),
  update: (id: string, data: Partial<ProductInput>) => inventoryAPI.patch(`/products/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/products/${id}/`),
  checkSku: (sku: string) => inventoryAPI.get("/products/check-sku/", { params: { sku } }),
};
