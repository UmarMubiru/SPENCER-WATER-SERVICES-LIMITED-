"use client";

import { useEffect, useState } from "react";
import { SiteFrame } from "../../site-shell";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams();
  const ref = params?.project_reference as string;
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) return;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/projects/?q=${encodeURIComponent(ref)}`, { cache: "no-store" });
        const data = await res.json();
        setProject(data && data.length ? data[0] : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ref]);

  if (loading) return <SiteFrame><main className="section"><div className="section-inner">Loading…</div></main></SiteFrame>;
  if (!project) return <SiteFrame><main className="section"><div className="section-inner">Project not found</div></main></SiteFrame>;

  return (
    <SiteFrame>
      <main>
        <section className="hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Projects / {project.name}</p>
            <h1>{project.name}</h1>
            <p className="section-copy">{project.scope_description}</p>
          </div>
        </section>
        <section className="section">
          <div className="section-inner">
            <h2 className="section-title">Project Details</h2>
            <div className="card-grid">
              <div className="project-card">
                <div className="project-body">
                  <p><strong>Reference:</strong> {project.project_reference}</p>
                  <p><strong>Service:</strong> {project.service_line}</p>
                  <p><strong>Location:</strong> {project.site_location}</p>
                  <p><strong>Contract Value:</strong> UGX {project.contract_value}</p>
                  <p><strong>Status:</strong> {project.status}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
