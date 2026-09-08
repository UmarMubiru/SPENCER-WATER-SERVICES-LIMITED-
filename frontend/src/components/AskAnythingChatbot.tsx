'use client';

import { useState, useEffect, useRef } from 'react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const FAQ_DATABASE: FAQ[] = [
  // Services
  {
    question: "What services do you offer?",
    answer: "We offer borehole drilling, solar water pumping, water treatment, pipeline installation, plumbing services, water storage solutions, water taps & accessories, and water engineering consultancy.",
    category: "services",
    keywords: ["services", "offer", "provide", "what do you do", "capabilities"]
  },
  {
    question: "How much does borehole drilling cost?",
    answer: "Borehole drilling costs vary based on depth, location, geological conditions, and required equipment. We provide custom quotations after site assessment. Contact us for a free quote.",
    category: "pricing",
    keywords: ["cost", "price", "borehole", "drilling", "how much", "expensive"]
  },
  {
    question: "Do you offer solar water pumping?",
    answer: "Yes, we specialize in solar water pumping systems. These are ideal for remote locations, reduce running costs, and use clean renewable energy.",
    category: "services",
    keywords: ["solar", "pumping", "renewable", "energy", "sun"]
  },
  {
    question: "What areas do you serve?",
    answer: "We serve clients across Uganda, including homes, institutions, farms, businesses, and communities. Contact us to discuss your specific location.",
    category: "locations",
    keywords: ["location", "area", "serve", "where", "uganda", "region"]
  },
  {
    question: "How long does a typical project take?",
    answer: "Project timelines vary: borehole drilling typically 3-7 days, solar installation 2-5 days, pipeline work depends on length. We provide timelines in project quotations.",
    category: "timeline",
    keywords: ["long", "time", "duration", "timeline", "how long", "days"]
  },
  {
    question: "Do you provide maintenance services?",
    answer: "Yes, we offer maintenance support for all our installations. Regular maintenance ensures optimal performance and extends system lifespan.",
    category: "services",
    keywords: ["maintenance", "support", "repair", "service", "aftercare"]
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, mobile money, and cash payments. Payment terms are discussed during quotation and project agreement.",
    category: "payment",
    keywords: ["payment", "pay", "money", "cash", "bank", "mobile money"]
  },
  {
    question: "Do you provide warranties?",
    answer: "Yes, we provide warranties on our workmanship and equipment. Warranty terms vary by service and are included in our project agreements.",
    category: "warranty",
    keywords: ["warranty", "guarantee", "aftercare", "support"]
  },
  {
    question: "How can I get a quotation?",
    answer: "You can request a quotation through our website's quotation form, call us, email us, or use WhatsApp. We'll arrange a site visit and provide a detailed quote.",
    category: "quotation",
    keywords: ["quote", "quotation", "get quote", "estimate", "pricing"]
  },
  {
    question: "What is your contact information?",
    answer: "You can reach us via phone, email, WhatsApp, or visit our office. Our contact details are available on the Contact page.",
    category: "contact",
    keywords: ["contact", "phone", "email", "call", "reach", "number"]
  },
  {
    question: "Do you work with residential clients?",
    answer: "Yes, we work with residential clients, businesses, institutions, farms, and communities. We have solutions for all types of water needs.",
    category: "services",
    keywords: ["residential", "home", "house", "domestic", "individual"]
  },
  {
    question: "What are your working hours?",
    answer: "We operate during standard business hours. For emergencies, please call our emergency contact line.",
    category: "contact",
    keywords: ["hours", "time", "working", "open", "business hours"]
  },
  {
    question: "Do you provide site visits?",
    answer: "Yes, we provide site visits for project assessment. This helps us understand your requirements and provide accurate quotations.",
    category: "services",
    keywords: ["site visit", "assessment", "come to site", "location visit"]
  },
  {
    question: "What water treatment options do you offer?",
    answer: "We offer various water treatment solutions including filtration, chlorination, UV treatment, and reverse osmosis systems tailored to your water quality needs.",
    category: "services",
    keywords: ["treatment", "filter", "purify", "clean", "quality", "chlorination"]
  },
  {
    question: "Can you handle large commercial projects?",
    answer: "Yes, we have experience with large commercial and institutional projects including schools, hospitals, hotels, and industrial facilities.",
    category: "services",
    keywords: ["commercial", "large", "big", "industrial", "business", "corporate"]
  }
];

export default function AskAnythingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: 'user' | 'bot'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findFAQ = (query: string): FAQ | null => {
    const normalizedQuery = query.toLowerCase();
    
    // First try exact match
    const exactMatch = FAQ_DATABASE.find(faq => 
      faq.question.toLowerCase() === normalizedQuery
    );
    if (exactMatch) return exactMatch;

    // Then try keyword matching
    const queryWords = normalizedQuery.split(/\s+/);
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    FAQ_DATABASE.forEach(faq => {
      let score = 0;
      queryWords.forEach(word => {
        if (faq.question.toLowerCase().includes(word)) score += 2;
        if (faq.answer.toLowerCase().includes(word)) score += 1;
        if (faq.keywords.some(kw => kw.toLowerCase().includes(word))) score += 3;
      });
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    return highestScore > 0 ? bestMatch : null;
  };

  const searchWebsite = (query: string): string => {
    const normalizedQuery = query.toLowerCase();
    
    // Simple search implementation
    const searchResults: string[] = [];
    
    if (normalizedQuery.includes('borehole') || normalizedQuery.includes('drilling')) {
      searchResults.push('Check our Borehole Drilling service page for detailed information');
    }
    if (normalizedQuery.includes('solar') || normalizedQuery.includes('pumping')) {
      searchResults.push('Visit our Solar Water Pumping section for comprehensive details');
    }
    if (normalizedQuery.includes('treatment') || normalizedQuery.includes('filter')) {
      searchResults.push('See our Water Treatment services for purification options');
    }
    if (normalizedQuery.includes('pipeline') || normalizedQuery.includes('piping')) {
      searchResults.push('Our Pipeline Installation page has full details');
    }
    if (normalizedQuery.includes('plumbing')) {
      searchResults.push('Plumbing Services page covers all plumbing needs');
    }
    if (normalizedQuery.includes('storage') || normalizedQuery.includes('tank')) {
      searchResults.push('Water Storage Solutions page has storage options');
    }
    if (normalizedQuery.includes('project') || normalizedQuery.includes('portfolio')) {
      searchResults.push('Our Projects page showcases completed work');
    }
    if (normalizedQuery.includes('contact') || normalizedQuery.includes('phone') || normalizedQuery.includes('email')) {
      searchResults.push('Contact page has all our contact information');
    }
    if (normalizedQuery.includes('quote') || normalizedQuery.includes('quotation')) {
      searchResults.push('Request a quotation through our Quotation page');
    }

    if (searchResults.length > 0) {
      return `I found some relevant information: ${searchResults.join(', ')}. Would you like me to provide more details about any of these?`;
    }
    
    return '';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate processing delay
    setTimeout(() => {
      let botResponse = '';

      // First try FAQ database
      const faqMatch = findFAQ(userMessage);
      if (faqMatch) {
        botResponse = faqMatch.answer;
      } else {
        // Then try website search
        const searchResult = searchWebsite(userMessage);
        if (searchResult) {
          botResponse = searchResult;
        } else {
          // Fallback to contact form
          botResponse = "I don't have specific information about that in my database. Would you like me to connect you with our team for detailed assistance? They can provide personalized answers to your questions.";
          setShowContactForm(true);
        }
      }

      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="ask-anything-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3-3s1 1-3 3" />
          <path d="M12 17v.01" />
        </svg>
        Ask Anything
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="chatbot-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-header">
              <div className="chatbot-header-content">
                <div className="chatbot-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3-3s1 1-3 3" />
                    <path d="M12 17v.01" />
                  </svg>
                </div>
                <div>
                  <h3>Ask Anything</h3>
                  <p>I'm here to help with questions about our services, projects, and company</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="chatbot-close">×</button>
            </div>

            <div className="chatbot-messages">
              {messages.length === 0 && (
                <div className="chatbot-welcome">
                  <div className="chatbot-welcome-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3-3s1 1-3 3" />
                      <path d="M12 17v.01" />
                    </svg>
                  </div>
                  <div className="chatbot-welcome-text">
                    <h4>Welcome! 👋</h4>
                    <p>I can help you with:</p>
                    <ul>
                      <li>🔍 Information about our services</li>
                      <li>📋 Project details and timelines</li>
                      <li>💰 Pricing and quotations</li>
                      <li>📍 Contact information</li>
                      <li>🤝 General company information</li>
                    </ul>
                    <p>Feel free to ask me anything!</p>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`chatbot-message ${msg.type}`}>
                  {msg.content}
                </div>
              ))}

              {isTyping && (
                <div className="chatbot-message bot typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {showContactForm && (
                <div className="chatbot-message bot">
                  <div className="contact-form-suggestion">
                    <p>Would you like to connect with our team?</p>
                    <a href="/contact" className="btn btn-primary btn-sm">Contact Us</a>
                    <button onClick={() => setShowContactForm(false)} className="btn btn-secondary btn-sm">No thanks</button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="chatbot-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="chatbot-send"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chatbot-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .chatbot-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 500px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
        }

        .chatbot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #1e63b8 0%, #3b82f6 100%);
          border-radius: 16px 16px 0 0;
        }

        .chatbot-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .chatbot-header h3 {
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .chatbot-header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          margin: 0;
        }

        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          min-height: 300px;
        }

        .chatbot-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
        }

        .chatbot-welcome-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1e63b8 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 16px;
        }

        .chatbot-welcome-text h4 {
          color: #1e40af;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .chatbot-welcome-text p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 12px 0;
        }

        .chatbot-welcome-text ul {
          text-align: left;
          color: #6b7280;
          font-size: 14px;
          list-style: none;
          padding: 0;
          margin: 0 0 12px 0;
        }

        .chatbot-welcome-text li {
          padding: 4px 0;
        }

        .chatbot-message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .chatbot-message.user {
          background: linear-gradient(135deg, #1e63b8 0%, #3b82f6 100%);
          color: white;
          margin-left: auto;
        }

        .chatbot-message.bot {
          background: #f3f4f6;
          color: #1f2937;
        }

        .chatbot-message.typing {
          padding: 16px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        .contact-form-suggestion {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-form-suggestion p {
          margin: 0;
        }

        .contact-form-suggestion .btn {
          padding: 8px 16px;
          font-size: 14px;
        }

        .chatbot-input-area {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        .chatbot-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .chatbot-send {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #1e63b8 0%, #3b82f6 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .chatbot-send:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .chatbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
