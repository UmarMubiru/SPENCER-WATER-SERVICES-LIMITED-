export interface Project {
  id: string;
  project_reference: string;
  name: string;
  status: string;
}

export type ListProjectsParams = {
  page?: number;
  serviceLine?: string;
  q?: string;
};
