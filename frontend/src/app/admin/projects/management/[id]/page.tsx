'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '../../../components/AdminLayout';

export default function ProjectMonitoringPage() {
  const { id } = useParams<{ id: string }>();
  const areas = [
    { title: 'Project Team', description: 'Choose an available employee, assign their role, and track project responsibility.', primary: 'Assign employee', primaryHref: `/admin/projects/management/${id}/role-assignment`, secondary: 'View role allocations', secondaryHref: `/admin/projects/role-assignments` },
    { title: 'Casual Workers & Payment', description: 'Create project casual workers, assign them to measurable field tasks, and track piece-rate or daily payment.', primary: 'Add casual worker', primaryHref: `/admin/projects/casual-workers/create?project=${id}`, secondary: 'Manage work & payments', secondaryHref: `/admin/projects/management/${id}/casual-work` },
    { title: 'Activities', description: 'Create activities for this project; their progress automatically updates the project completion figure.', primary: 'Add activity', primaryHref: `/admin/projects/activities/${id}`, secondary: 'View all activities', secondaryHref: `/admin/projects/activities` },
    { title: 'Resources', description: 'Allocate tools, hired equipment, and money directly to this project\'s activities.', primary: 'Add resource', primaryHref: `/admin/projects/resources/${id}`, secondary: 'View all resources', secondaryHref: `/admin/projects/resources` },
  ];

  return (
    <AdminLayout
      title="Project Monitoring"
      subtitle="Choose what to create or manage for this specific project"
      activePath="/admin/projects"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href={`/admin/projects/details/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Project overview
          </Link>
          <Link href="/admin/projects/dashboard" className="text-sm text-blue-600 hover:underline">
            All projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {areas.map((area) => (
            <div key={area.title} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-blue-900">{area.title}</h2>
              <p className="text-sm text-blue-600 mt-2 min-h-10">{area.description}</p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link href={area.primaryHref} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                  {area.primary}
                </Link>
                <Link href={area.secondaryHref} className="px-4 py-2 rounded-lg border border-blue-200 text-blue-900 text-sm font-medium hover:bg-blue-50">
                  {area.secondary}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
