import { allScreenParams } from "../admin-data";
import { AdminScreen } from "../admin-ui";

type AdminModulePageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return allScreenParams();
}

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  const { slug } = await params;

  return <AdminScreen pathSegments={slug} />;
}
