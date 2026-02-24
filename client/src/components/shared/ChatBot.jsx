import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chatRef = useRef(null);

  // Show tooltip after 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    // Hide tooltip after 8 seconds
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  const suggestions = [
    { 
      icon: '✈️', 
      title: 'Best travel deals',
      subtitle: 'to Sri Lanka destinations'
    },
    { 
      icon: '🏨', 
      title: 'Plan a relaxing getaway for',
      subtitle: 'my vacation...'
    },
    { 
      icon: '🌴', 
      title: 'Top beaches',
      subtitle: 'in Sri Lanka'
    },
    { 
      icon: '💰', 
      title: 'Budget travel guide',
      subtitle: 'for backpackers'
    },
  ];

  return (
    <div className="chatbot-wrapper" ref={chatRef}>
      {/* ===== CHAT WINDOW ===== */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Close button */}
          <button className="chatbot-panel-close" onClick={() => setIsOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Bot Character on side */}
          <div className="chatbot-panel-bot">
            <img src="/chatbot-bot.webp" alt="PathFinder Bot" className="panel-bot-image" />
          </div>

          {/* Chat Content */}
          <div className="chatbot-panel-content">
            {/* Suggestion Cards */}
            <div className="chatbot-suggestion-cards">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-card" disabled>
                  <span className="suggestion-card-icon">{s.icon}</span>
                  <div className="suggestion-card-text">
                    <span className="suggestion-title">{s.title}</span>
                    <span className="suggestion-subtitle">{s.subtitle}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="chatbot-panel-input">
              <img src="/chatbot-input-search.webp" alt="" className="input-search-icon" />
              <input
                type="text"
                placeholder="Ask me anything..."
                disabled
              />
              <span className="input-cursor">|</span>
            </div>

            {/* Coming Soon Badge */}
            <div className="chatbot-coming-soon-badge">
              <span className="badge-icon">🚀</span>
              <span>AI Assistant Coming Soon!</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOOLTIP ===== */}
      {showTooltip && !isOpen && (
        <div className="chatbot-tooltip">
          <p>Hi! Need help planning your trip? 🌏</p>
          <button className="tooltip-close" onClick={() => setShowTooltip(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ===== FLOATING BOT CHARACTER ===== */}
      <div 
        className={`chatbot-floating-bot ${isOpen ? 'open' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label="Open chat assistant"
      >
        <img 
          src="/chatbot-bot.webp" 
          alt="Chat Assistant" 
          className="floating-bot-image" 
        />
        {/* Glow effect */}
        <div className="floating-bot-glow"></div>
      </div>
    </div>
  );
};

export default ChatBot;
