"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mainNav, services } from "./site-data";
import AskAnythingChatbot from "../components/AskAnythingChatbot";

function Icon({ name, size = 20 }: { name: "bot" | "chevron" | "close" | "message" | "send" | "search" | "whatsapp" | "facebook" | "linkedin" | "instagram" | "tiktok" | "phone" | "email" | "location"; size?: number }) {
  const common = {
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    width: size,
    "aria-hidden": true,
  };

  if (name === "chevron") {
    return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
  }

  if (name === "search") {
    return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
  }

  if (name === "message") {
    return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-12.1 7.7L3 21l1.8-5.7A8.5 8.5 0 1 1 21 11.5Z" /></svg>;
  }

  if (name === "whatsapp") {
    return (
      <svg aria-hidden="true" fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15.02L2.3 21.7l4.8-1.25A9.94 9.94 0 1 0 12.04 2Zm0 1.8a8.13 8.13 0 0 1 6.9 12.45 8.08 8.08 0 0 1-10.9 2.46l-.34-.2-2.85.74.76-2.78-.22-.36A8.1 8.1 0 0 1 12.04 3.8Zm-3.48 4.3c-.18 0-.48.06-.73.34-.25.27-.96.94-.96 2.28s.98 2.65 1.12 2.83c.14.18 1.9 3.05 4.72 4.16 2.34.92 2.82.74 3.33.7.51-.05 1.66-.68 1.9-1.34.23-.66.23-1.22.16-1.34-.07-.12-.25-.19-.52-.33-.27-.14-1.66-.82-1.91-.91-.26-.1-.44-.14-.63.14-.18.27-.72.91-.88 1.1-.16.18-.32.2-.6.06-.27-.14-1.15-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.9-.16-.27-.02-.42.12-.56.13-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.51-.86-2.06-.22-.53-.45-.46-.62-.47h-.54Z" />
      </svg>
    );
  }

  if (name === "send") {
    return <svg {...common}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
  }

  if (name === "close") {
    return <svg {...common}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
  }

  if (name === "facebook") {
    return (
      <svg {...common} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg {...common} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg {...common} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    );
  }

  if (name === "email") {
    return (
      <svg {...common}>
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M12 8V4" />
      <path d="M9 4h6" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/search/?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setIsSearchOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    if (result.is_direct_link) {
      window.open(result.url, '_blank');
    } else {
      router.push(result.url);
    }
  };

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

  return (
    <>
      <div className="sws-topbar">
        <div className="sws-topbar-inner">
          <div className="sws-contact-items">
            <a href="tel:+256772123456" className="sws-contact-item">
              <Icon name="phone" size={15} />
              <span>+256 772 123 456</span>
            </a>
            <a href="mailto:info@spencerwaterservices.co.ug" className="sws-contact-item">
              <Icon name="email" size={15} />
              <span>info@spencerwaterservices.co.ug</span>
            </a>
            <div className="sws-contact-item">
              <Icon name="location" size={15} />
              <span>Namayumba</span>
            </div>
          </div>
          <div className="sws-socials">
            <a href="#" aria-label="Facebook">
              <Icon name="facebook" size={16} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Icon name="linkedin" size={16} />
            </a>
            <a href="#" aria-label="Instagram">
              <Icon name="instagram" size={16} />
            </a>
            <a href="#" aria-label="TikTok">
              <Icon name="tiktok" size={16} />
            </a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand logo-only" href="/">
            <img src="/sws-logo-current.png" alt="Spencer Water Services Ltd logo" width={350} height={250} />
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {mainNav.map((item) => (
              <Link className={isActive(item.href) ? "nav-link active" : "nav-link"} href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="sws-quote-button" href="/quotation">
              Request Quote
              <Icon name="send" size={20} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <img className="footer-logo" src="/sws-logo-current.png" alt="Spencer Water Services Ltd logo" width={350} height={250} />
        </div>
        <div>
          <h3>Quick Links</h3>
          {mainNav.map((item) => (
            <Link href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Services</h3>
          {services.map((item) => (
            <Link href={`/services/${item.slug}`} key={item.slug}>
              {item.title}
            </Link>
          ))}
        </div>
        <div>
          <h3>Contact</h3>
          <p>+256 700 123 456</p>
          <p>info@spencerwaterservices.co.ug</p>
          <p>Kampala, Uganda</p>
        </div>
      </div>
      <div className="footer-strip">
        <span>Emergency Contact: +256 700 123 456</span>
        <span>Copyright 2026 Spencer Water Services Ltd. All rights reserved.</span>
      </div>
    </footer>
  );
}

export function FloatingActions() {
  return (
    <>
      <div className="floating-stack" aria-label="Quick actions">
        <AskAnythingChatbot />
        <a className="whatsapp-btn" href="https://wa.me/256700123456" aria-label="WhatsApp Business">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15.02L2.3 21.7l4.8-1.25A9.94 9.94 0 1 0 12.04 2Zm0 1.8a8.13 8.13 0 0 1 6.9 12.45 8.08 8.08 0 0 1-10.9 2.46l-.34-.2-2.85.74.76-2.78-.22-.36A8.1 8.1 0 0 1 12.04 3.8Zm-3.48 4.3c-.18 0-.48.06-.73.34-.25.27-.96.94-.96 2.28s.98 2.65 1.12 2.83c.14.18 1.9 3.05 4.72 4.16 2.34.92 2.82.74 3.33.7.51-.05 1.66-.68 1.9-1.34.23-.66.23-1.22.16-1.34-.07-.12-.25-.19-.52-.33-.27-.14-1.66-.82-1.91-.91-.26-.1-.44-.14-.63.14-.18.27-.72.91-.88 1.1-.16.18-.32.2-.6.06-.27-.14-1.15-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.9-.16-.27-.02-.42.12-.56.13-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.51-.86-2.06-.22-.53-.45-.46-.62-.47h-.54Z"/>
          </svg>
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <Header />
      {children}
      <FloatingActions />
      <Footer />
    </div>
  );
}
