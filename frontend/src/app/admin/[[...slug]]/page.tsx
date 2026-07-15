import { AdminScreen } from "../admin-ui";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <AdminScreen pathSegments={slug ?? []} />;
}
