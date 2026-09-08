import React from "react";
import { field, getPublicSiteContent, image } from "../../content-api";
import { SiteFrame } from "../../site-shell";
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, CheckCircle, Droplets } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  meta_description: string | null;
  reading_time: number;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/content/blog/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    const posts = data.posts || [];
    return posts.find((post: BlogPost) => post.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getRelatedPosts(currentPost: BlogPost): Promise<BlogPost[]> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/content/blog/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    const posts = data.posts || [];
    return posts
      .filter((post: BlogPost) => post.id !== currentPost.id && post.status === 'PUBLISHED')
      .slice(0, 3);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const post = await getBlogPost(slug);
  const relatedPosts = post ? await getRelatedPosts(post) : [];

  if (!post) {
    return (
      <SiteFrame>
        <main>
          <section className="section">
            <div className="section-inner text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
              <Link href="/blog" className="text-[#1e63b8] hover:text-[#1a5699]">
                ← Back to Blog
              </Link>
            </div>
          </section>
        </main>
      </SiteFrame>
    );
  }

  // Format content with markdown-like parsing
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let currentList: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        elements.push(<h2 key={i} className="text-3xl font-bold text-gray-900 mt-10 mb-6 pb-3 border-b-2 border-blue-100">{line.replace(/^#\s*/, '')}</h2>);
      } else if (line.startsWith('## ')) {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        elements.push(<h3 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4 text-[#1e63b8]">{line.replace(/^##\s*/, '')}</h3>);
      } else if (line.startsWith('### ')) {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        elements.push(<h4 key={i} className="text-xl font-semibold text-gray-900 mt-6 mb-3">{line.replace(/^###\s*/, '')}</h4>);
      } else if (line.startsWith('- ')) {
        inList = true;
        currentList.push(line);
      } else if (line.startsWith('✓') || line.startsWith('•')) {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^[-•]\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        elements.push(<div key={i} className="flex items-start gap-3 mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"><CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">{line.replace(/^[✓•]\s*/, '')}</span></div>);
      } else {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
          currentList = [];
          inList = false;
        }
        elements.push(<p key={i} className="mb-6 text-gray-700 leading-relaxed text-lg">{line}</p>);
      }
    }

    if (inList && currentList.length > 0) {
      elements.push(<ul key="final-list" className="space-y-3 mb-6 pl-6 border-l-4 border-blue-200">{currentList.map((item, idx) => <li key={idx} className="text-gray-700 leading-relaxed pl-2">{item.replace(/^-\s*/, '')}</li>)}</ul>);
    }

    return elements;
  };

  const heroImages = [
    image(content, 'blog', 'hero_image_1'),
    image(content, 'blog', 'hero_image_2'),
    image(content, 'blog', 'hero_image_3'),
  ];

  return (
    <SiteFrame>
      <main>
        {/* Hero Section */}
        <section className="hero hero-home hero-photo-stack" id="blog-hero">
          {heroImages.map((heroImage, index) => (
            <div
              className={`hero-photo hero-photo-${["one", "two", "three"][index]}`}
              key={index}
              role="img"
              aria-label={heroImage?.alt_text || ""}
              style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined}
            />
          ))}
          <div className="hero-centered">
            <p className="eyebrow">{post.category || 'INSIGHTS'}</p>
            <h1>{post.title}</h1>
            <p className="text-white">{post.excerpt}</p>
            <div className="hero-actions center-actions">
              <Link className="btn btn-secondary" href="/blog">Back to Insights</Link>
              <Link className="btn btn-primary" href="/quotation">Get Quote</Link>
            </div>
          </div>

          <div className="sws-feature-strip">
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <strong>Quality & Reliability</strong>
                <span>We deliver lasting solutions</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <strong>Expert Engineers</strong>
                <span>Skilled, certified & experienced</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20"/>
                  <path d="M12 2v20"/>
                  <path d="m4.93 4.93 14.14 14.14"/>
                  <path d="m19.07 4.93-14.14 14.14"/>
                </svg>
              </div>
              <div>
                <strong>Sustainable Approach</strong>
                <span>Solutions for a better tomorrow</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <strong>Nationwide Service</strong>
                <span>Across Uganda & beyond</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="section">
          <div className="section-inner">
            <p className="text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-[#1e63b8]">Home</Link>
              {' / '}
              <Link href="/blog" className="hover:text-[#1e63b8]">Blog</Link>
              {' / '}
              <span className="text-gray-900">{post.category || 'Article'}</span>
            </p>
          </div>
        </section>

        {/* Article Metadata */}
        <section className="section">
          <div className="section-inner max-w-4xl">
            <div className="flex items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : new Date(post.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.reading_time} min read</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featured_image && (
          <section className="section">
            <div className="section-inner max-w-4xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="section bg-gradient-to-b from-white to-blue-50/30">
          <div className="section-inner max-w-2xl">
            <article className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="prose prose-lg prose-blue max-w-none">
                  <div className="text-gray-800 leading-relaxed space-y-6">
                    {formatContent(post.content)}
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t-2 border-gradient-to-r from-blue-100 to-indigo-100">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1e63b8] text-sm font-semibold rounded-full border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="section bg-gray-50">
            <div className="section-inner max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {relatedPost.featured_image ? (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                        <Droplets size={48} className="text-blue-300" />
                      </div>
                    )}
                    <div className="p-4">
                      {relatedPost.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-[#1e63b8] text-xs font-medium rounded-full mb-2">
                          {relatedPost.category}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#1e63b8] transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{relatedPost.reading_time} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">Project support</p>
              <h2>Talk to Spencer Water about your water project</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">Request Quotation</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
