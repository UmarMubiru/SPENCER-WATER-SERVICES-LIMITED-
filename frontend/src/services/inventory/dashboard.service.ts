import inventoryAPI from "./api";

export const DashboardService = {

  summary: () =>
    inventoryAPI.get("/dashboard/")

};