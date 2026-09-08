import { SiteFrame } from "../site-shell";

interface SearchResult {
  type: string;
  title: string;
  description: string;
  url: string;
  icon?: string;
  is_direct_link?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
}

async function fetchSearchResults(query: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/search/?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      return await response.json();
    }
    return { results: [], query, count: 0 };
  } catch (error) {
    console.error('Search error:', error);
    return { results: [], query, count: 0 };
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'service': return '🔧';
    case 'service_section': return '📋';
    case 'faq': return '❓';
    case 'page': return '📄';
    case 'media': return '🖼️';
    case 'inventory': return '📦';
    case 'category': return '🏷️';
    default: return '🔍';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'service': return 'Service';
    case 'service_section': return 'Section';
    case 'faq': return 'FAQ';
    case 'page': return 'Page';
    case 'media': return 'Media';
    case 'inventory': return 'Equipment';
    case 'category': return 'Category';
    default: return 'Result';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'service': return '#1e63b8';
    case 'service_section': return '#2d7d46';
    case 'faq': return '#d97706';
    case 'page': return '#6b7280';
    case 'media': return '#7c3aed';
    case 'inventory': return '#0891b2';
    case 'category': return '#dc2626';
    default: return '#374151';
  }
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const searchResults = query ? await fetchSearchResults(query) : { results: [], query, count: 0 };

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Search</p>
            <h1>Search Results</h1>
            <p>
              {query 
                ? `Showing ${searchResults.count} results for "${query}"`
                : "Enter a search term to find services, pages, equipment, and more."
              }
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            {query && searchResults.count === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">No results found for "{query}"</p>
                <p className="text-gray-500">Try different keywords or browse our services.</p>
              </div>
            ) : query && searchResults.count > 0 ? (
              <>
                <div className="mb-8">
                  <p className="text-sm text-gray-500">
                    Found {searchResults.count} results across services, pages, equipment, and more
                  </p>
                </div>
                <div className="grid gap-4">
                  {searchResults.results.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
                      target={result.is_direct_link ? "_blank" : "_self"}
                      rel={result.is_direct_link ? "noopener noreferrer" : undefined}
                      className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{getTypeIcon(result.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-[#10243d]">
                              {result.title}
                            </h3>
                            <span
                              className="text-xs px-2 py-1 rounded text-white font-medium"
                              style={{ backgroundColor: getTypeColor(result.type) }}
                            >
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">Search our website</p>
                <p className="text-gray-500">
                  Use the search bar in the header to find services, pages, equipment, FAQs, and more.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
