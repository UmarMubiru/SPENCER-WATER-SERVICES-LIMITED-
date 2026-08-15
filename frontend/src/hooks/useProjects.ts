"use client";

import { useEffect, useState } from "react";
import { Project, ListProjectsParams } from "@/types/projects";
import { ProjectService } from "@/services/project.service";

export function useProjects(params: ListProjectsParams = {}) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchAll = async () => {
    const data = await ProjectService.getAll(params);
    setProjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.serviceLine, params.q]);

  return { loading, projects, refresh: fetchAll };
}
