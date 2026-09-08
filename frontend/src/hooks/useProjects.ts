import { useState, useEffect } from "react";

interface Project {
  id: string;
  project_reference: string;
  name: string;
  service_line: string;
  scope_description: string;
  site_location: string;
  contract_value: number;
  status: string;
  completion_percentage: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
}

interface UseProjectsOptions {
  page?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/projects/');
        if (response.ok) {
          const data = await response.json();
          setProjects(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
        } else {
          setError('Failed to fetch projects');
        }
      } catch (err) {
        setError('Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [options.page]);

  return { projects, loading, error };
}
