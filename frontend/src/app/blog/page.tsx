'use client';

import { useState, useEffect } from 'react';
import { field, getPublicSiteContent, image } from "../content-api";
import { SiteFrame } from "../site-shell";
import { Search, Calendar, Clock, ArrowRight, CheckCircle, Droplets, Zap, Wrench, Sun } from "lucide-react";
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
  reading_time: number;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export default function BlogPage() {
  const [content, setContent] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contentData, postsRes, categoriesRes] = await Promise.all([
        getPublicSiteContent(),
        fetch('http://127.0.0.1:8000/api/content/blog/'),
        fetch('http://127.0.0.1:8000/api/content/blog/categories/'),
      ]);

      setContent(contentData);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const publishedPosts = (postsData.posts || []).filter((post: BlogPost) => post.status === 'PUBLISHED');
        setPosts(publishedPosts);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }
    } catch (err) {
      console.error('Error loading blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    return selectedCategory === 'all' || post.category === selectedCategory;
  });

  // Get featured post
  const featuredPost = posts.find(post => post.is_featured) || posts[0];
  const otherPosts = posts.filter(post => post.id !== featuredPost?.id);

  if (loading) {
    return (
      <SiteFrame>
        <main>
          <div className="section-inner text-center py-12">
            <div className="text-slate-500">Loading insights...</div>
          </div>
        </main>
      </SiteFrame>
    );
  }

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
          <div className="section-inner hero-centered">
            <p className="eyebrow">{field(content, 'blog', 'hero_eyebrow', 'HOME / INSIGHTS')}</p>
            <h1><span className="hero-blue-accent">Water</span>, Engineering & Infrastructure Insights</h1>
            <p className="text-white">{field(content, 'blog', 'hero_description', 'Practical knowledge from our experience in water systems, irrigation, pumping, treatment and infrastructure.')}</p>
            <div className="hero-actions center-actions">
              <Link className="btn btn-secondary" href="#featured">Explore Articles</Link>
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

        {/* Featured Article */}
        {featuredPost && (
          <section id="featured" className="section bg-white">
            <div className="section-inner">
              <div className="mb-4">
                <span className="text-[#1e63b8] font-semibold text-sm tracking-wider">{field(content, 'blog', 'featured_label', 'Featured insight').toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Link href={`/blog/${featuredPost.slug}`} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Droplets size={64} className="text-blue-300" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col justify-center h-full">
                  {featuredPost.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-[#1e63b8] text-sm font-medium rounded-full w-fit mb-4">
                      {featuredPost.category}
                    </span>
                  )}
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#1e63b8] transition-colors">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{featuredPost.reading_time} min read</span>
                    </div>
                    {featuredPost.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(featuredPost.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-[#1e63b8] font-semibold hover:text-[#1a5699] transition-colors"
                  >
                    Read Article
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Navigation */}
        <section className="section bg-gray-50">
          <div className="section-inner">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">EXPLORE TOPICS</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#1e63b8] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1e63b8] hover:text-[#1e63b8]'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-[#1e63b8] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1e63b8] hover:text-[#1e63b8]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="section bg-white">
          <div className="section-inner">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{field(content, 'blog', 'latest_heading', 'Latest Insights')}</h2>
              <p className="text-gray-600">{field(content, 'blog', 'latest_description', 'Practical knowledge for better water systems.')}</p>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Droplets size={40} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{field(content, 'blog', 'empty_heading', 'Insights Are Coming')}</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">{field(content, 'blog', 'empty_description', 'We’re preparing practical guides and insights covering water engineering, irrigation, pumping, treatment and infrastructure.')}</p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 bg-[#1e63b8] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1a5699] transition-all shadow-lg hover:shadow-xl"
                >
                  Explore Our Services
                  <ArrowRight size={20} />
                </Link>
              </div>
            ) : (
              <div className="blog-carousel">
                <div className="blog-carousel-track">
                  {filteredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="blog-card-carousel group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100 flex items-center justify-center">
                          <Droplets size={64} className="text-blue-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {post.is_featured && (
                        <div className="absolute top-4 right-4 bg-[#1e63b8] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1e63b8] text-xs font-bold rounded-full mb-4 border border-blue-100">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1e63b8] transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <Clock size={14} className="text-blue-500" />
                            <span className="font-medium">{post.reading_time} min</span>
                          </div>
                          {post.published_at && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                              <Calendar size={14} className="text-blue-500" />
                              <span className="font-medium">{new Date(post.published_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#1e63b8] transition-colors">
                          <ArrowRight size={16} className="text-[#1e63b8] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  ))}
                  {filteredPosts.map((post) => (
                    <Link
                      key={`${post.id}-duplicate`}
                      href={`/blog/${post.slug}`}
                      className="blog-card-carousel group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100 flex items-center justify-center">
                          <Droplets size={64} className="text-blue-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {post.is_featured && (
                        <div className="absolute top-4 right-4 bg-[#1e63b8] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1e63b8] text-xs font-bold rounded-full mb-4 border border-blue-100">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1e63b8] transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <Clock size={14} className="text-blue-500" />
                            <span className="font-medium">{post.reading_time} min</span>
                          </div>
                          {post.published_at && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                              <Calendar size={14} className="text-blue-500" />
                              <span className="font-medium">{new Date(post.published_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-[#1e63b8] transition-colors">
                          <ArrowRight size={16} className="text-[#1e63b8] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Why Our Insights */}
        <section className="section bg-gray-50">
          <div className="section-inner">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{field(content, 'blog', 'why_heading', 'Why Our Insights?')}</h2>
              <p className="text-gray-600">{field(content, 'blog', 'why_description', 'Knowledge you can trust for your water projects.')}</p>
            </div>
            <div className="insights-features-grid">
              <div className="insight-feature-card">
                <div className="insight-icon-wrapper">
                  <CheckCircle size={28} className="text-[#1e63b8]" />
                </div>
                <h3>Practical Experience</h3>
                <p>Knowledge drawn from real water and infrastructure projects across Uganda.</p>
              </div>
              <div className="insight-feature-card">
                <div className="insight-icon-wrapper">
                  <Wrench size={28} className="text-[#1e63b8]" />
                </div>
                <h3>Technical Guidance</h3>
                <p>Understand systems, technologies and maintenance requirements for water solutions.</p>
              </div>
              <div className="insight-feature-card">
                <div className="insight-icon-wrapper">
                  <Sun size={28} className="text-[#1e63b8]" />
                </div>
                <h3>Local Context</h3>
                <p>Information relevant to Uganda's water, agricultural and infrastructure environment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">{field(content, 'blog', 'cta_eyebrow', 'Project support')}</p>
              <h2>{field(content, 'blog', 'cta_heading', 'Talk to Spencer Water about your water project')}</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">{field(content, 'blog', 'cta_button', 'Request Quotation')}</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
