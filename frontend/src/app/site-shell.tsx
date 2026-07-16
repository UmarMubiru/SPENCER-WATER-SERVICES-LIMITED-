"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, services } from "./site-data";

function Icon({ name, size = 20 }: { name: "bot" | "chevron" | "close" | "message" | "send" | "search" | "whatsapp"; size?: number }) {
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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div className="browser-strip">spencerwaterservices.co.ug</div>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand logo-only" href="/">
            <img src="/sws-logo-current.png" alt="Spencer Water Services Ltd logo" width={350} height={250} />
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {mainNav.map((item) =>
              item.label === "Services" ? (
                <div className="nav-dropdown" key={item.label}>
                  <Link className={isActive(item.href) ? "nav-link nav-link-with-icon active" : "nav-link nav-link-with-icon"} href={item.href}>
                    {item.label}
                    <Icon name="chevron" size={15} />
                  </Link>
                  <div className="dropdown-panel">
                    <Link className="dropdown-feature" href="/services">
                      <strong>Services Overview</strong>
                      <span>Explore all Spencer Water engineering services.</span>
                    </Link>
                    <div className="dropdown-grid">
                      {services.map((service) => (
                        <Link className="dropdown-link" href={`/services/${service.slug}`} key={service.slug}>
                          <span className="mini-icon">{service.icon}</span>
                          <span>
                            <strong>{service.title}</strong>
                            <small>{service.shortDescription}</small>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link className={isActive(item.href) ? "nav-link active" : "nav-link"} href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="header-actions">
            <form className="top-search" role="search">
              <Icon name="search" size={19} />
              <input aria-label="Search website" placeholder="Search Spencer Water" type="search" />
            </form>
            <Link className="btn btn-primary" href="/quotation">
              Request Quote
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello. Ask me anything about borehole drilling, solar pumping, water treatment, plumbing, projects, or requesting a quotation." },
  ]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { from: "user", text: trimmed },
      { from: "bot", text: "Thanks. The AI assistant will answer from Spencer Water Services knowledge once the chatbot backend is connected. For now, I can help route this to quotation or contact." },
    ]);
    setDraft("");
  };

  return (
    <>
      {isChatOpen && (
        <section className="chatbot-panel" aria-label="AI chat assistant">
          <div className="chatbot-head">
            <div>
              <span>Spencer AI Assistant</span>
              <strong>Ask Anything</strong>
            </div>
            <button aria-label="Close chat" onClick={() => setIsChatOpen(false)} type="button">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div className={item.from === "bot" ? "chat-message bot" : "chat-message user"} key={`${item.from}-${index}`}>
                {item.text}
              </div>
            ))}
          </div>
          <div className="chatbot-prompts" aria-label="Suggested questions">
            {["Request a quotation", "Which service do I need?", "Talk to support"].map((item) => (
              <button key={item} onClick={() => sendMessage(item)} type="button">{item}</button>
            ))}
          </div>
          <form className="chatbot-form" onSubmit={(event) => { event.preventDefault(); sendMessage(draft); }}>
            <input aria-label="Ask Spencer AI" onChange={(event) => setDraft(event.target.value)} placeholder="Ask about water services..." value={draft} />
            <button aria-label="Send message" type="submit"><Icon name="send" size={17} /></button>
          </form>
        </section>
      )}
      <div className="floating-stack" aria-label="Quick actions">
        <button className="ask-anything-btn" onClick={() => setIsChatOpen((value) => !value)} type="button" aria-expanded={isChatOpen}>
          <Icon name="bot" size={21} />
          <span>Ask Anything</span>
        </button>
        <a className="float-btn float-green" href="https://wa.me/256700123456" aria-label="WhatsApp Business">
          <Icon name="whatsapp" size={28} />
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
