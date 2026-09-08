'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, BookOpen, CheckCircle2, FileText, Image, LayoutTemplate, Plus, Settings2, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import DashboardCard from '../../../../components/admin/ui/DashboardCard';

type Dashboard = { website_status: string; pages: number; published_pages: number; drafts: number; services: number; portfolio: number; blogs: number; testimonials: number; media: number; recent_activity: { action: string; target: string; detail: string; created_at: string }[]; attention: { label: string; count: number; severity: string }[] };
const API = 'http://127.0.0.1:8000/api/content/';

export default function ContentDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string; title: string; status: string; href: string }[]>([]);

  useEffect(() => { fetch(`${API}dashboard/`).then(r => r.ok ? r.json() : null).then(setData).catch(() => setData(null)); }, []);
  const runSearch = async (value: string) => { setQuery(value); if (!value.trim()) return setResults([]); const r = await fetch(`${API}search/?q=${encodeURIComponent(value)}`); if (r.ok) setResults((await r.json()).results); };
  const stats: Array<[string, number, string, LucideIcon, string]> = data ? [
    ['Website pages', data.pages, `${data.published_pages} published`, FileText, 'from-blue-600 to-blue-700'],
    ['Services', data.services, 'Service catalogue', Wrench, 'from-sky-500 to-blue-600'],
    ['Portfolio', data.portfolio, 'Featured work', LayoutTemplate, 'from-blue-400 to-blue-600'],
    ['Blog posts', data.blogs, `${data.drafts} drafts to review`, BookOpen, 'from-blue-800 to-blue-950'],
    ['Media assets', data.media, 'Images & documents', Image, 'from-blue-600 to-blue-700'],
    ['Testimonials', data.testimonials, 'Customer proof', CheckCircle2, 'from-sky-500 to-blue-600'],
  ] : [];

  return <AdminLayout title="Website Content Management" subtitle="Your command centre for everything on the public website" activePath="/admin/content/dashboard" onSearch={runSearch}>
    <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8">
      <PageHeader
        title="Website Content Management"
        description="Manage website pages, services, portfolio, blogs, media and search performance from one place"
        actionLabel="New Page"
        actionHref="/admin/content/pages"
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, note, Icon, tint]) => (
          <DashboardCard
            key={String(label)}
            label={String(label)}
            value={String(value)}
            icon={Icon}
            tint={tint}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Publishing workflow</p>
              <h3 className="text-lg font-semibold text-blue-900">Move content from draft to live</h3>
            </div>
            <Link className="text-sm font-semibold text-blue-600" href="/admin/content/pages">Manage pages</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Drafts', data?.drafts || 0, 'bg-blue-50 text-blue-700'], ['Review', 0, 'bg-blue-50 text-blue-700'], ['Scheduled', 0, 'bg-blue-50 text-blue-700'], ['Published', data?.published_pages || 0, 'bg-blue-50 text-blue-700']].map(([name, value, colour]) => (
              <div key={String(name)} className={`rounded-lg p-4 ${String(colour)}`}>
                <span className="text-xs font-semibold">{name}</span>
                <strong className="mt-2 block text-2xl">{value}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600"/>
            <h3 className="font-semibold text-blue-900">Content health</h3>
          </div>
          <div className="space-y-3">
            {data?.attention.map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                <span className="text-sm text-blue-900">{item.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.count ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-800'}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-blue-900">
            <Activity size={18} className="text-blue-600"/>
            Recent content activity
          </h3>
          <div className="space-y-3">
            {data?.recent_activity.length ? data.recent_activity.map(item => (
              <div key={`${item.action}-${item.created_at}`} className="border-l-2 border-blue-600 pl-3">
                <b className="block text-sm text-blue-900">{item.action}: {item.target}</b>
                <span className="text-xs text-blue-600">{item.detail || new Date(item.created_at).toLocaleString()}</span>
              </div>
            )) : <p className="text-sm text-blue-400">Changes you make here will appear in the audit timeline.</p>}
          </div>
        </section>
        <section className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-blue-900">
            <Settings2 size={18} className="text-blue-600"/>
            Workspace
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[['Pages', '/admin/content/pages'], ['Services', '/admin/content/services'], ['Portfolio', '/admin/content/portfolio'], ['Blog', '/admin/content/blogs'], ['Media library', '/admin/content/media'], ['Testimonials', '/admin/content/testimonials']].map(([name, href]) => (
              <Link key={name} href={href} className="rounded-lg border border-blue-200 p-3 text-sm font-semibold text-blue-900 transition hover:border-blue-600 hover:text-blue-600">{name}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  </AdminLayout>;
}
