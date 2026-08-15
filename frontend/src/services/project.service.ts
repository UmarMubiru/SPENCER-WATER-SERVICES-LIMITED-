import { api } from "@/lib/api";
import { ListProjectsParams, Project } from "@/types/projects";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function buildQuery(params: ListProjectsParams) {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", params.page.toString());
  }
  if (params.serviceLine) {
    searchParams.set("service_line", params.serviceLine);
  }
  if (params.q) {
    searchParams.set("q", params.q);
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const ProjectService = {
  getAll: async (params: ListProjectsParams = {}) => {
    const response = await api.get(`/projects/${buildQuery(params)}`);
    const data = await response.json();
    if (Array.isArray(data)) {
      return data as Project[];
    }

    return (data as PaginatedResponse<Project>).results;
  },
};
