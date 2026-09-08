'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Eye, FilePlus2, Plus, Search, Trash2, X, FileText, Wrench, LayoutTemplate, BookOpen, Image, CheckCircle2, type LucideIcon } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';

type Page = { id: number | null; title: string; slug: string; page_type: string; status: string; meta_title: string; meta_description: string; is_fixed?: boolean };
type Dashboard = { website_status: string; pages: number; published_pages: number; drafts: number; services: number; portfolio: number; blogs: number; testimonials: number; media: number; recent_activity: { action: string; target: string; detail: string; created_at: string }[]; attention: { label: string; count: number; severity: string }[] };
const API = 'http://127.0.0.1:8000/api/content/';
const blank = { title: '', slug: '', page_type: 'CUSTOM', status: 'DRAFT', meta_title: '', meta_description: '' };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]); const [query, setQuery] = useState(''); const [open, setOpen] = useState(false); const [form, setForm] = useState(blank); const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dashboardData, setDashboardData] = useState<Dashboard | null>(null);
  const load = () => { void fetch(`${API}pages/`).then(r => r.json()).then(d => setPages(d.pages || [])).catch(() => setPages([])); };
  useEffect(() => { load(); void fetch(`${API}dashboard/`).then(r => r.ok ? r.json() : null).then(setDashboardData).catch(() => setDashboardData(null)); }, []);
  const stats: Array<[string, number, string, LucideIcon]> = dashboardData ? [
    ['Website pages', dashboardData.pages, `${dashboardData.published_pages} published`, FileText], ['Services', dashboardData.services, 'Service catalogue', Wrench],
    ['Blog posts', dashboardData.blogs, `${dashboardData.drafts} drafts to review`, BookOpen], ['Media assets', dashboardData.media, 'Images & documents', Image], ['Testimonials', dashboardData.testimonials, 'Customer proof', CheckCircle2],
  ] : [];
  const save = async (e: FormEvent) => { e.preventDefault(); setSaving(true); const r = await fetch(`${API}pages/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); setSaving(false); if (r.ok) { setOpen(false); setForm(blank); load(); } else alert('The page could not be saved. Check that its URL is unique.'); };
  const updateStatus = async (page: Page, status: string) => { if (!page.id) return; const r = await fetch(`${API}pages/${page.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); if (r.ok) load(); };
  const deletePage = async (page: Page) => { if (!page.id || !confirm('Are you sure you want to delete this page?')) return; const r = await fetch(`${API}pages/${page.id}/`, { method: 'DELETE' }); if (r.ok) load(); else alert('Failed to delete page'); };
  const handlePreview = (page: Page) => { const baseUrl = 'http://localhost:3000'; if (page.page_type === 'SERVICE') { window.open(`${baseUrl}/services/${page.slug.replace('service-', '')}`, '_blank'); } else if (page.slug === 'home') { window.open(`${baseUrl}/`, '_blank'); } else { window.open(`${baseUrl}/${page.slug}`, '_blank'); } };
  const handleEdit = (page: Page) => { if (page.page_type === 'SERVICE') { const serviceSlug = page.slug.replace('service-', ''); window.location.href = `/admin/content/website-content?service=${serviceSlug}`; } else { window.location.href = `/admin/content/website-content?page=${page.slug}`; } };
  const visible = pages.filter(page => `${page.title} ${page.slug}`.toLowerCase().includes(query.toLowerCase()));
  const paginatedPages = visible.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(visible.length / itemsPerPage);
  return (
    <AdminLayout
      title="Website pages"
      subtitle="Create, organise and publish fixed and custom website pages"
      activePath="/admin/content/pages"
      onSearch={setQuery}
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-4 p-5 max-w-6xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {stats.map(([label, value, note, Icon]) => (
            <div key={String(label)} className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600">{String(label)}</span>
                <Icon size={16} className="text-blue-600" />
              </div>
              <strong className="mt-2 block text-2xl text-blue-900">{String(value)}</strong>
              <span className="mt-1 block text-[10px] text-blue-400">{String(note)}</span>
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-blue-600">Pages are structured with reusable blocks, media and SEO settings.</p>
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">{pages.filter(p => p.status === 'PUBLISHED').length} published</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">{pages.filter(p => p.status === 'DRAFT').length} drafts</span>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus size={14}/>New page
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 px-3 py-2 flex items-center justify-between">
            <label className="flex max-w-md items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5">
              <Search size={14} className="text-blue-400"/>
              <input value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-xs outline-none" placeholder="Find a page"/>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                Page {currentPage} of {totalPages} ({visible.length} total)
              </span>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-blue-50 text-[10px] uppercase tracking-wide text-blue-600">
                <tr>
                  <th className="px-4 py-2.5">Page</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">SEO</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPages.map(page => (
                  <tr key={`${page.id}-${page.slug}`} className="border-t border-blue-100">
                    <td className="px-4 py-3">
                      <b className="block text-xs text-blue-900">{page.title}</b>
                      <span className="text-[10px] text-blue-400">/{page.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-blue-600">{page.is_fixed ? 'Core page' : page.page_type}</td>
                    <td className="px-4 py-3 text-xs">{page.meta_description ? <span className="text-blue-700">Ready</span> : <span className="text-blue-400">Needs description</span>}</td>
                    <td className="px-4 py-3 align-middle">
                      <select value={page.status} onChange={e => updateStatus(page, e.target.value)} className="rounded-full border-0 bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 cursor-pointer">
                        <option>DRAFT</option>
                        <option>REVIEW</option>
                        <option>APPROVED</option>
                        <option>SCHEDULED</option>
                        <option>PUBLISHED</option>
                        <option>ARCHIVED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handlePreview(page)} className="rounded-md p-1 text-blue-600 hover:bg-blue-50" title="Preview"><Eye size={12}/></button>
                        <button onClick={() => handleEdit(page)} className="rounded-md p-1 text-blue-600 hover:bg-blue-50" title="Edit"><FilePlus2 size={12}/></button>
                        {!page.is_fixed && <button onClick={() => deletePage(page)} className="rounded-md p-1 text-blue-600 hover:bg-blue-50" title="Delete"><Trash2 size={12}/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <form onSubmit={save} className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-blue-900">Create website page</h2>
                  <p className="text-xs text-blue-600">Start a new page as a draft, then add blocks and media.</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-blue-50"><X size={16}/></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-blue-700 sm:col-span-2">
                  Page title
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: slugify(e.target.value)})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 outline-none focus:border-blue-500 text-xs" placeholder="e.g. Careers"/>
                </label>
                <label className="text-xs font-medium text-blue-700 sm:col-span-2">
                  URL slug
                  <input required value={form.slug} onChange={e => setForm({...form, slug: slugify(e.target.value)})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 outline-none focus:border-blue-500 text-xs"/>
                </label>
                <label className="text-xs font-medium text-blue-700">
                  Page type
                  <select value={form.page_type} onChange={e => setForm({...form, page_type: e.target.value})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 text-xs">
                    <option value="CUSTOM">Custom page</option>
                    <option value="LANDING">Landing page</option>
                    <option value="LEGAL">Legal page</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-blue-700">
                  Workflow status
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 text-xs">
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">In review</option>
                    <option value="PUBLISHED">Publish now</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-blue-700 sm:col-span-2">
                  Meta title
                  <input value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 outline-none focus:border-blue-500 text-xs" placeholder="SEO title"/>
                </label>
                <label className="text-xs font-medium text-blue-700 sm:col-span-2">
                  Meta description
                  <textarea value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} className="mt-1 w-full rounded-lg border border-blue-200 px-2 py-1.5 outline-none focus:border-blue-500 resize-none text-xs" rows={2} placeholder="SEO description"/>
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-900 hover:bg-blue-50 text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create page'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
