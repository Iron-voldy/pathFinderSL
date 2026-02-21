import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { hotelsAPI } from '../services/api';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import './HotelDetail.css';

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const detailRef = useRef(null);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  useEffect(() => {
    if (hotel && detailRef.current) {
      gsap.from('.detail-header', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('.detail-section', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 0.3,
      });
    }
  }, [hotel]);

  const fetchHotel = async () => {
    setLoading(true);
    try {
      const response = await hotelsAPI.getById(id);
      setHotel(response.data);
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="hotel-detail-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading hotel details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div className="hotel-detail-page">
          <div className="error-state">
            <h2>Hotel not found</h2>
            <Link to="/hotels" className="btn-back">← Back to Hotels</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="hotel-detail-page" ref={detailRef}>
      {/* Hero Image */}
      <div className="detail-hero">
        <img
          src={hotel.hotel_image || '/placeholder-hotel.jpg'}
          alt={hotel.hotel_name}
          onError={(e) => {
            e.target.src = '/placeholder-hotel.jpg';
          }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="container">
        <Link to="/hotels" className="btn-back-link">← Back to Hotels</Link>

        {/* Header */}
        <div className="detail-header">
          <div className="header-main">
            <h1>{hotel.hotel_name}</h1>
            <p className="location">
              📍 {hotel.hotel_address || `${hotel.city}, ${hotel.country}`}
            </p>
          </div>
          <div className="header-meta">
            {hotel.star_classification && (
              <div className="rating-badge">{hotel.star_classification}</div>
            )}
            {hotel.hotel_classification && (
              <div className="type-badge">{hotel.hotel_classification}</div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="detail-grid">
          {/* Main Content */}
          <div className="detail-main">
            {/* Description */}
            {hotel.hotel_description && (
              <div className="detail-section">
                <h2>About This Property</h2>
                <p className="description">{hotel.hotel_description}</p>
              </div>
            )}

            {hotel.sub_description && (
              <div className="detail-section">
                <div className="highlight-box">
                  <span className="highlight-icon">✨</span>
                  <p>{hotel.sub_description}</p>
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="detail-section">
              <h2>Location</h2>
              <div className="info-grid">
                {hotel.city && (
                  <div className="info-item">
                    <span className="info-label">City</span>
                    <span className="info-value">{hotel.city}</span>
                  </div>
                )}
                {hotel.country && (
                  <div className="info-item">
                    <span className="info-label">Country</span>
                    <span className="info-value">{hotel.country}</span>
                  </div>
                )}
                {hotel.micro_location && (
                  <div className="info-item">
                    <span className="info-label">Area</span>
                    <span className="info-value">{hotel.micro_location}</span>
                  </div>
                )}
                {hotel.latitude && hotel.longitude && (
                  <div className="info-item">
                    <span className="info-label">Coordinates</span>
                    <span className="info-value">
                      {hotel.latitude}, {hotel.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="detail-section">
              <h2>Property Details</h2>
              <div className="info-grid">
                {hotel.provider && (
                  <div className="info-item">
                    <span className="info-label">Provider</span>
                    <span className="info-value">{hotel.provider}</span>
                  </div>
                )}
                {hotel.hotel_status && (
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`status-badge status-${hotel.hotel_status}`}>
                      {hotel.hotel_status}
                    </span>
                  </div>
                )}
                {hotel.auto_confirmation !== null && (
                  <div className="info-item">
                    <span className="info-label">Instant Confirmation</span>
                    <span className="info-value">
                      {hotel.auto_confirmation ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {hotel.trip_advisor_link && (
              <div className="detail-section">
                <a
                  href={hotel.trip_advisor_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  View on TripAdvisor →
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Book This Property</h3>
              <p className="sidebar-text">
                Contact us to check availability and make a reservation.
              </p>
              <button className="btn-book">Check Availability</button>
              <Link to="/contact" className="btn-contact">
                Contact Us
              </Link>
            </div>

            {hotel.markup && (
              <div className="sidebar-card">
                <div className="info-row">
                  <span>Service Charge</span>
                  <span className="text-primary font-semibold">{hotel.markup}%</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default HotelDetail;
