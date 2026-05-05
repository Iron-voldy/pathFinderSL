import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faLocationDot,
  faUsers,
  faCarSide,
  faCalendarDays,
  faMoneyBill,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { transportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './TransportDetail.css';

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [bookingForm, setBookingForm] = useState({
    start_date: '',
    end_date: '',
    passenger_count: 1,
    pickup_location: '',
    dropoff_location: '',
    notes: '',
  });

  useEffect(() => {
    fetchGig();
  }, [id]);

  useEffect(() => {
    if (gig) {
      gsap.fromTo('.td-content', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }
  }, [gig]);

  const fetchGig = async () => {
    if (!id || isNaN(Number(id))) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await transportAPI.getGig(id);
      setGig(response.data);
      if (response.data) {
        setBookingForm((prev) => ({
          ...prev,
          pickup_location: response.data.start_location || '',
          dropoff_location: response.data.end_location || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching gig:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/userlogin');
      return;
    }
    const errors = {};
    if (!bookingForm.start_date) {
      errors.start_date = 'Start date is required.';
    } else if (bookingForm.start_date < tomorrowStr) {
      errors.start_date = 'Start date must be from tomorrow onwards.';
    }
    if (!bookingForm.end_date) {
      errors.end_date = 'End date is required.';
    } else if (bookingForm.start_date && bookingForm.end_date <= bookingForm.start_date) {
      errors.end_date = 'End date must be after start date.';
    }
    if (!bookingForm.passenger_count || parseInt(bookingForm.passenger_count) < 1) {
      errors.passenger_count = 'At least 1 passenger required.';
    } else if (parseInt(bookingForm.passenger_count) > gig.passenger_capacity) {
      errors.passenger_count = `Maximum ${gig.passenger_capacity} passengers allowed.`;
    }
    if (!bookingForm.pickup_location.trim()) {
      errors.pickup_location = 'Pickup location is required.';
    }
    if (!bookingForm.dropoff_location.trim()) {
      errors.dropoff_location = 'Drop-off location is required.';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setBookingLoading(true);
    try {
      await transportAPI.createBooking({
        gig_id: parseInt(id),
        ...bookingForm,
        passenger_count: parseInt(bookingForm.passenger_count),
      });
      setBookingSuccess(true);
    } catch (error) {
      alert(error?.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const images = gig?.images || [];
  const hasImages = images.length > 0;

  const calculateTotal = () => {
    if (!gig || !bookingForm.start_date || !bookingForm.end_date) return null;
    const start = new Date(bookingForm.start_date);
    const end = new Date(bookingForm.end_date);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return { days, total: (parseFloat(gig.price_per_day) * days).toFixed(2) };
  };

  const priceCalc = calculateTotal();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="td-page">
          <div className="td-loading">
            <div className="td-spinner" />
            <p>Loading transport details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!gig) {
    return (
      <>
        <Navbar />
        <div className="td-page">
          <div className="td-not-found">
            <h2>Transport service not found</h2>
            <button onClick={() => navigate('/transport')} className="td-back-btn">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Transport
            </button>
          </div>
        </div>
      </>
    );
  }

  if (bookingSuccess) {
    return (
      <>
        <Navbar />
        <div className="td-page">
          <div className="td-success">
            <div className="td-success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h2>Booking Submitted!</h2>
            <p>Your booking request has been sent to the driver. You'll be notified once confirmed.</p>
            <div className="td-success-actions">
              <button onClick={() => navigate('/transport')} className="td-back-btn">
                Browse More
              </button>
              <button onClick={() => navigate('/orders')} className="td-primary-btn">
                My Bookings
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="td-page">
        <div className="td-content">
          {/* Breadcrumb */}
          <div className="td-breadcrumb">
            <button onClick={() => navigate('/transport')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Transport
            </button>
            <span>/</span>
            <span>{gig.title}</span>
          </div>

          <div className="td-grid">
            {/* Left: images + details */}
            <div className="td-left">
              {/* Image gallery */}
              <div className="td-gallery">
                <div
                  className="td-gallery-main"
                  style={{
                    backgroundImage: `url(${hasImages ? images[currentImage] : '/transport_placeholder.jpg'})`,
                  }}
                >
                  <span className="td-badge">{gig.vehicle_category}</span>
                  {hasImages && images.length > 1 && (
                    <>
                      <button
                        className="td-gallery-nav td-gallery-prev"
                        onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button
                        className="td-gallery-nav td-gallery-next"
                        onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </>
                  )}
                </div>
                {hasImages && images.length > 1 && (
                  <div className="td-thumbnails">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`td-thumb ${i === currentImage ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                        onClick={() => setCurrentImage(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="td-details-card">
                <h1 className="td-title">{gig.title}</h1>

                <div className="td-route-bar">
                  <div className="td-route-point">
                    <FontAwesomeIcon icon={faLocationDot} />
                    <div>
                      <small>From</small>
                      <strong>{gig.start_location}</strong>
                    </div>
                  </div>
                  <div className="td-route-arrow">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                  <div className="td-route-point">
                    <FontAwesomeIcon icon={faLocationDot} />
                    <div>
                      <small>To</small>
                      <strong>{gig.end_location}</strong>
                    </div>
                  </div>
                </div>

                <div className="td-info-grid">
                  <div className="td-info-item">
                    <FontAwesomeIcon icon={faCarSide} />
                    <div>
                      <small>Vehicle</small>
                      <strong>
                        {gig.vehicle_type}
                        {gig.vehicle_make ? ` - ${gig.vehicle_make}` : ''}
                        {gig.vehicle_model ? ` ${gig.vehicle_model}` : ''}
                      </strong>
                    </div>
                  </div>
                  <div className="td-info-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <div>
                      <small>Capacity</small>
                      <strong>{gig.passenger_capacity} passengers</strong>
                    </div>
                  </div>
                  <div className="td-info-item">
                    <FontAwesomeIcon icon={faMoneyBill} />
                    <div>
                      <small>Price</small>
                      <strong>{gig.currency} {parseFloat(gig.price_per_day).toLocaleString()} / day</strong>
                    </div>
                  </div>
                  {gig.available_from && (
                    <div className="td-info-item">
                      <FontAwesomeIcon icon={faCalendarDays} />
                      <div>
                        <small>Available</small>
                        <strong>{gig.available_from} - {gig.available_to || 'Ongoing'}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {gig.description && (
                  <div className="td-description">
                    <h3>Description</h3>
                    <p>{gig.description}</p>
                  </div>
                )}

                {gig.driver && (
                  <div className="td-driver-info">
                    <h3>Driver</h3>
                    <div className="td-driver-row">
                      <div className="td-driver-avatar">
                        {gig.driver.profile_picture ? (
                          <img src={gig.driver.profile_picture} alt={gig.driver.full_name} />
                        ) : (
                          <span>{(gig.driver.full_name || '?')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong>{gig.driver.full_name}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: booking form */}
            <div className="td-right">
              <div className="td-booking-card">
                <h2 className="td-booking-title">Book This Service</h2>
                <div className="td-booking-price">
                  {gig.currency} {parseFloat(gig.price_per_day).toLocaleString()}
                  <small>/ day</small>
                </div>

                {!showBooking ? (
                  <button
                    className="td-primary-btn td-full-btn"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/userlogin');
                        return;
                      }
                      setShowBooking(true);
                    }}
                  >
                    Book Now
                  </button>
                ) : (
                  <form onSubmit={handleBooking} className="td-booking-form" noValidate>
                    <div className="td-form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        min={tomorrowStr}
                        className={formErrors.start_date ? 'input-error' : ''}
                        value={bookingForm.start_date}
                        onChange={(e) => {
                          setBookingForm((p) => ({ ...p, start_date: e.target.value }));
                          if (formErrors.start_date) setFormErrors((p) => ({ ...p, start_date: '' }));
                        }}
                      />
                      {formErrors.start_date && <span className="td-field-error">{formErrors.start_date}</span>}
                    </div>
                    <div className="td-form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        min={bookingForm.start_date || tomorrowStr}
                        className={formErrors.end_date ? 'input-error' : ''}
                        value={bookingForm.end_date}
                        onChange={(e) => {
                          setBookingForm((p) => ({ ...p, end_date: e.target.value }));
                          if (formErrors.end_date) setFormErrors((p) => ({ ...p, end_date: '' }));
                        }}
                      />
                      {formErrors.end_date && <span className="td-field-error">{formErrors.end_date}</span>}
                    </div>
                    <div className="td-form-group">
                      <label>Passengers</label>
                      <input
                        type="number"
                        min="1"
                        max={gig.passenger_capacity}
                        className={formErrors.passenger_count ? 'input-error' : ''}
                        value={bookingForm.passenger_count}
                        onChange={(e) => {
                          setBookingForm((p) => ({ ...p, passenger_count: e.target.value }));
                          if (formErrors.passenger_count) setFormErrors((p) => ({ ...p, passenger_count: '' }));
                        }}
                      />
                      {formErrors.passenger_count && <span className="td-field-error">{formErrors.passenger_count}</span>}
                    </div>
                    <div className="td-form-group">
                      <label>Pickup Location</label>
                      <input
                        type="text"
                        className={formErrors.pickup_location ? 'input-error' : ''}
                        value={bookingForm.pickup_location}
                        onChange={(e) => {
                          setBookingForm((p) => ({ ...p, pickup_location: e.target.value }));
                          if (formErrors.pickup_location) setFormErrors((p) => ({ ...p, pickup_location: '' }));
                        }}
                      />
                      {formErrors.pickup_location && <span className="td-field-error">{formErrors.pickup_location}</span>}
                    </div>
                    <div className="td-form-group">
                      <label>Drop-off Location</label>
                      <input
                        type="text"
                        className={formErrors.dropoff_location ? 'input-error' : ''}
                        value={bookingForm.dropoff_location}
                        onChange={(e) => {
                          setBookingForm((p) => ({ ...p, dropoff_location: e.target.value }));
                          if (formErrors.dropoff_location) setFormErrors((p) => ({ ...p, dropoff_location: '' }));
                        }}
                      />
                      {formErrors.dropoff_location && <span className="td-field-error">{formErrors.dropoff_location}</span>}
                    </div>
                    <div className="td-form-group">
                      <label>Notes (optional)</label>
                      <textarea
                        rows={3}
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm((p) => ({ ...p, notes: e.target.value }))
                        }
                      />
                    </div>

                    {priceCalc && (
                      <div className="td-price-summary">
                        <div className="td-price-row">
                          <span>
                            {gig.currency} {parseFloat(gig.price_per_day).toLocaleString()} x{' '}
                            {priceCalc.days} day{priceCalc.days > 1 ? 's' : ''}
                          </span>
                          <strong>
                            {gig.currency} {parseFloat(priceCalc.total).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="td-primary-btn td-full-btn"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </form>
                )}

                <p className="td-booking-note">
                  <FontAwesomeIcon icon={faCircleInfo} /> You won't be charged until the driver confirms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TransportDetail;
