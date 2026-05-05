import React, { useEffect, useRef, useState } from 'react';
import { aiTripPlannerAPI } from '../../services/api';
import './ChatBot.css';

const starterSuggestions = [
  'Plan a 3 day relaxing beach trip in Sri Lanka',
  'I want a 4 day cultural trip for 2 people',
  'Help me plan an adventure trip in Sri Lanka',
];

const createMessage = (role, text, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  ...extra,
});

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plannerState, setPlannerState] = useState({});
  const [messages, setMessages] = useState([
    createMessage(
      'assistant',
      'Tell me what kind of Sri Lanka trip you want, and I will ask only the missing details before planning it.'
    ),
  ]);

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const handleToggle = () => {
    setIsOpen((current) => !current);
    setShowTooltip(false);
  };

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    setIsOpen(true);
    setShowTooltip(false);
    setMessages((current) => [...current, createMessage('user', message)]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiTripPlannerAPI.sendMessage({
        message,
        plannerState,
      });

      setPlannerState(response.plannerState || {});
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.assistantMessage, {
          status: response.status,
          followUp: response.followUp || null,
          itinerary: response.itinerary || null,
          selectedCities: response.selectedCities || [],
          transportSuggestions: response.transportSuggestions || [],
        }),
      ]);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        'The AI planner is unavailable right now. Please try again in a moment.';

      setMessages((current) => [...current, createMessage('assistant', errorMessage)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(inputValue);
  };

  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  const latestFollowUp = latestAssistantMessage?.followUp || null;
  const showStarterSuggestions = messages.length <= 1;

  return (
    <div className="chatbot-wrapper" ref={chatRef}>
      {isOpen && (
        <div className="chatbot-panel">
          <button className="chatbot-panel-close" onClick={() => setIsOpen(false)} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="chatbot-panel-bot">
            <img src="/chatbot-bot.webp" alt="PathFinder Bot" className="panel-bot-image" />
          </div>

          <div className="chatbot-panel-content">
            <div className="chatbot-panel-header">
              <span className="chatbot-panel-eyebrow">AI trip planner</span>
              <h3>PathFinderSL Assistant</h3>
              <p>Ask for a trip, answer the follow-up questions, and get a grounded itinerary from your data.</p>
            </div>

            {showStarterSuggestions ? (
              <div className="chatbot-suggestion-cards">
                {starterSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="suggestion-card"
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={isLoading}
                  >
                    <span className="suggestion-card-icon">Plan</span>
                    <div className="suggestion-card-text">
                      <span className="suggestion-title">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="chatbot-messages" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`chatbot-message chatbot-message--${message.role}`}>
                  <div className={`chatbot-bubble chatbot-bubble--${message.role}`}>
                    <p>{message.text}</p>

                    {message.followUp?.suggestions?.length ? (
                      <div className="chatbot-chip-row">
                        {message.followUp.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="chatbot-chip"
                            disabled={isLoading}
                            onClick={() => sendMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {message.selectedCities?.length ? (
                      <div className="chatbot-city-list">
                        {message.selectedCities.map((city) => (
                          <span key={city.city} className="chatbot-city-pill">
                            {city.city}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {message.itinerary?.length ? (
                      <div className="chatbot-itinerary">
                        {message.itinerary.map((day) => (
                          <div key={`${message.id}-${day.day}`} className="chatbot-day-card">
                            {day.travelMinutes && day.travelFromPrevCity ? (
                              <div className="chatbot-day-card__travel">
                                🚗 {Math.round(day.travelMinutes / 60) >= 1
                                  ? `~${Math.round(day.travelMinutes / 60)}h`
                                  : `${day.travelMinutes}min`} drive from {day.travelFromPrevCity}
                              </div>
                            ) : null}
                            <div className="chatbot-day-card__top">
                              <strong>Day {day.day}</strong>
                              <span>{day.city}</span>
                            </div>
                            {day.hotel ? (
                              <div className="chatbot-day-card__hotel">
                                🏨 {day.hotel.name}
                                {day.hotel.starClassification ? ` · ${day.hotel.starClassification}` : ''}
                              </div>
                            ) : null}
                            <ul className="chatbot-day-card__activities">
                              {day.activities.map((activity) => (
                                <li key={activity.lifestyleId}>
                                  {activity.name}
                                  {activity.price ? <span className="activity-price"> · {activity.price}</span> : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {message.transportSuggestions?.length ? (
                      <div className="chatbot-transport">
                        <span className="chatbot-transport__label">Transport options</span>
                        {message.transportSuggestions.map((option) => (
                          <div key={option.id} className="chatbot-transport__card">
                            <strong>{option.title}</strong>
                            <span>{option.route}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="chatbot-message chatbot-message--assistant">
                  <div className="chatbot-bubble chatbot-bubble--assistant chatbot-bubble--loading">
                    Planning your trip...
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            {latestFollowUp ? (
              <div className="chatbot-followup-hint">
                Next detail needed: <strong>{latestFollowUp.question}</strong>
              </div>
            ) : null}

            <form className="chatbot-panel-input" onSubmit={handleSubmit}>
              <img src="/chatbot-input-search.webp" alt="" className="input-search-icon" />
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Describe the trip you want..."
                disabled={isLoading}
              />
              <button type="submit" className="chatbot-send-button" disabled={isLoading || !inputValue.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {showTooltip && !isOpen && (
        <div className="chatbot-tooltip">
          <p>Need help planning a Sri Lanka trip?</p>
          <button className="tooltip-close" onClick={() => setShowTooltip(false)} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`chatbot-floating-bot ${isOpen ? 'open' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open chat assistant"
      >
        <img src="/chatbot-bot.webp" alt="Chat Assistant" className="floating-bot-image" />
        <div className="floating-bot-glow"></div>
      </div>
    </div>
  );
};

export default ChatBot;
