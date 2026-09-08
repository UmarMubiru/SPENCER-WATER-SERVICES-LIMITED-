type PageContent = {
  fields: Record<string, string>;
  images: Array<{ key: string; label: string; image_url: string | null; alt_text: string }>;
};

type AboutContent = {
  core_values: Array<{ title: string; description: string; icon: string; display_order: number }>;
  team_members: Array<{ id: number | null; name: string; role_title: string; bio: string; photo_url: string | null; display_order: number }>;
};

type PublicSiteContent = {
  pages: Record<string, PageContent>;
  about: AboutContent;
  services: Array<{
    name: string; slug: string; description: string; short_description: string; icon: string; display_order: number;
    hero_eyebrow: string; hero_title: string; hero_description: string; hero_image: string | null; hero_images: Array<string | null>; hero_alt_text: string;
    gallery_images: Array<{ id: number; url: string; name: string; alt_text: string }>;
    meta_title: string; meta_description: string;
    sections: Array<{ label: string; heading: string; content: string; image: string | null; process_images?: string[]; alt_text: string; display_order: number }>;
    faqs: Array<{ id: number; question: string; answer: string; display_order: number }>;
  }>;
  public_projects: Array<{ id: string; title: string; description: string; location: string; category: string; cover_image: string | null; latitude: string | null; longitude: string | null }>;
  testimonials: Array<{ customer_name: string; company_name: string; rating: number; content: string; project_reference: string }>;
  blog_posts: Array<{ title: string; slug: string; excerpt: string; featured_image: string | null; published_at: string | null }>;
};

const CMS_API_URL = (process.env.CMS_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function getPublicSiteContent(): Promise<PublicSiteContent | null> {
  try {
    const response = await fetch(`${CMS_API_URL}/api/content/core-pages/public/site/`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    return response.json() as Promise<PublicSiteContent>;
  } catch {
    // The static page content remains available while the CMS is unavailable.
    return null;
  }
}

export function field(
  content: PublicSiteContent | null,
  page: string,
  key: string,
  fallback: string,
) {
  return content?.pages[page]?.fields[key]?.trim() || fallback;
}

export function image(
  content: PublicSiteContent | null,
  page: string,
  key: string,
): { key: string; label: string; image_url: string; alt_text: string } | null {
  const item = content?.pages[page]?.images.find((candidate) => candidate.key === key);
  if (!item?.image_url) return null;
  // Only return if image_url is a valid non-empty string
  if (typeof item.image_url !== 'string' || item.image_url.trim() === '') return null;
  return { ...item, image_url: item.image_url };
}
