"use client";

import { SiteFrame } from "../site-shell";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  project_reference: string;
  name: string;
  service_line: string;
  scope_description: string;
  site_location: string;
  contract_value: string;
  status: string;
  completion_percentage: number;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (serviceFilter) params.set("service_line", serviceFilter);
        if (searchQuery) params.set("q", searchQuery);
        const url = `${API_BASE}/api/projects/?${params.toString()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed fetching projects");
        const data = await res.json();
        if (mounted) setProjects(data);
      } catch (err) {
        // fallback to empty list
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [serviceFilter, searchQuery]);

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Projects</p>
            <p className="eyebrow">Portfolio</p>
            <h1>Projects</h1>
            <p className="section-copy">Selected water engineering work across drilling, pumping, treatment, distribution, and maintenance support.</p>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <div className="projects-header-row">
              <h2 className="section-title">Projects</h2>
              <p className="muted">{loading ? "Loading projects…" : `${projects.length} projects`}</p>
            </div>

            <div className="article-search" style={{ marginBottom: 18 }}>
              <input placeholder="Search projects" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                <option value="">All services</option>
                <option value="borehole_drilling">Borehole Drilling</option>
                <option value="solar_pump_installation">Solar Pump Installation</option>
                <option value="solar_power_taps">Solar Power Taps</option>
                <option value="water_pipe_laying">Water Pipe Laying</option>
                <option value="water_treatment">Water Treatment</option>
                <option value="plumbing">Plumbing</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="card-grid project-grid">
              {projects.map((p) => (
                <article className="project-card" key={p.id}>
                  <a href={`/projects/${p.project_reference}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <div className="project-media">
                    <div className="project-badge">{p.service_line.replaceAll("_", " ")}</div>
                    <div className="project-location">{p.site_location}</div>
                  </div>
                  <div className="project-body">
                    <h3 className="project-title">{p.name}</h3>
                    <p className="project-ref">{p.project_reference}</p>
                    <p className="project-desc">{p.scope_description}</p>
                    <div className="project-meta">
                      <div>
                        <strong>Status:</strong> <span className="muted">{p.status.replaceAll("_", " ")}</span>
                      </div>
                      <div>
                        <strong>Contract:</strong> <span className="muted">UGX {p.contract_value}</span>
                      </div>
                    </div>
                    <div className="progress-row">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${p.completion_percentage}%` }} />
                      </div>
                      <div className="progress-label">{p.completion_percentage}%</div>
                    </div>
                    <div className="project-dates">
                      <div><strong>Planned:</strong> <span className="muted">{p.planned_start_date || "-"} → {p.planned_end_date || "-"}</span></div>
                    </div>
                  </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
