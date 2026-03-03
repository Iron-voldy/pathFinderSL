import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { hotelsAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './Hotels.css';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getNightCount = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;

  const [startYear, startMonth, startDay] = checkIn.split('-').map(Number);
  const [endYear, endMonth, endDay] = checkOut.split('-').map(Number);

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
  const diffInDays = (endUtc - startUtc) / MS_PER_DAY;

  return diffInDays > 0 ? diffInDays : null;
};

const getNextDate = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day));
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return nextDate.toISOString().split('T')[0];
};

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    star_classification: '',
    hotel_classification: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [searchErrors, setSearchErrors] = useState({});

  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();

  // Search form state
  const [searchForm, setSearchForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 2,
    children: 0,
  });

  const hotelGridRef = useRef(null);
  const guestsRef = useRef(null);

  const heroImages = [
    { src: '/hotel_hero_1.jpg', alt: 'Luxury Hotel Resort' },
    { src: '/hotel_hero_2.jpg', alt: 'Tropical Pool Villa' },
    { src: '/hotel_hero_3.jpg', alt: 'Premium Hotel Room' },
  ];

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  useEffect(() => {
    if (hotels.length > 0 && hotelGridRef.current) {
      const cards = hotelGridRef.current.querySelectorAll('.hotel-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { opacity: 0.3, y: 30 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }
        );
      }
    }
  }, [hotels]);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Hero GSAP animation on mount
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo('.hero-heading', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.hero-subheading', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .fromTo('.hero-tagline', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .fromTo('.search-bar', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setShowGuestsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelsAPI.getAll(filters);
      setHotels(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const errors = {};
    if (searchForm.checkIn && searchForm.checkIn < tomorrowStr) {
      errors.checkIn = 'Check-in must be from tomorrow onwards.';
    }
    if (searchForm.checkOut && searchForm.checkIn && searchForm.checkOut <= searchForm.checkIn) {
      errors.checkOut = 'Check-out must be after check-in.';
    }
    if (Object.keys(errors).length > 0) {
      setSearchErrors(errors);
      return;
    }
    setSearchErrors({});
    if (searchForm.location) {
      handleFilterChange('search', searchForm.location);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      city: '',
      star_classification: '',
      hotel_classification: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      page: 1,
      limit: 12,
    });
    setSearchForm({ location: '', checkIn: '', checkOut: '', rooms: 1, adults: 2, children: 0 });
    setSearchErrors({});
  };

  const starOptions = ['5-star', '4-star', '3-star', '2-star', '1-star'];
  const searchNights = getNightCount(searchForm.checkIn, searchForm.checkOut);

  const handleCheckInChange = (value) => {
    const nextCheckOut = getNextDate(value);

    setSearchForm((prev) => ({
      ...prev,
      checkIn: value,
      checkOut: !prev.checkOut || prev.checkOut <= value ? nextCheckOut : prev.checkOut,
    }));

    if (searchErrors.checkIn || searchErrors.checkOut) {
      setSearchErrors((prev) => ({ ...prev, checkIn: '', checkOut: '' }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="hotels-page">
        {/* ===== HERO SECTION ===== */}
        <section className="hotels-hero">
          <div className="hero-carousel">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${image.src})` }}
              />
            ))}
            <div className="hero-overlay" />
          </div>

          <div className="hero-text-content">
            <h1 className="hero-heading">Book Your Dream Hotel</h1>
            <h2 className="hero-subheading">Best Deals on Stays Worldwide</h2>
            <p className="hero-tagline">Compare prices and find your perfect accommodation</p>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <div className="search-bar-container">
            <form className="search-bar" onSubmit={handleSearch} noValidate>
              <div className="search-field search-field--location">
                <label>LOCATION</label>
                <div className="search-input-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchForm.location}
                    onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="search-divider" />

              <div className="search-field search-field--dates">
                <label>DATES</label>
                <div className="search-dates-row">
                  <div className="search-date-input">
                    <span className="date-label">CHECK-IN</span>
                    <div className="search-input-wrapper">
                      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        type="date"
                        min={tomorrowStr}
                        value={searchForm.checkIn}
                        className={searchErrors.checkIn ? 'input-error-date' : ''}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                      />
                    </div>
                    {searchErrors.checkIn && <span className="search-date-error">{searchErrors.checkIn}</span>}
                  </div>
                  <div className={`search-night-count${searchNights ? ' is-active' : ''}`} aria-live="polite">
                    {searchNights ? `${searchNights} Night${searchNights > 1 ? 's' : ''}` : 'Select dates'}
                  </div>
                  <div className="search-date-input">
                    <span className="date-label">CHECK-OUT</span>
                    <div className="search-input-wrapper">
                      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        type="date"
                        min={searchForm.checkIn || tomorrowStr}
                        value={searchForm.checkOut}
                        className={searchErrors.checkOut ? 'input-error-date' : ''}
                        onChange={(e) => { setSearchForm({ ...searchForm, checkOut: e.target.value }); if (searchErrors.checkOut) setSearchErrors((p) => ({ ...p, checkOut: '' })); }}
                      />
                    </div>
                    {searchErrors.checkOut && <span className="search-date-error">{searchErrors.checkOut}</span>}
                  </div>
                </div>
              </div>

              <div className="search-divider" />

              <div className="search-field search-field--guests" ref={guestsRef}>
                <label>ROOMS & GUESTS</label>
                <div
                  className="search-input-wrapper guests-trigger"
                  onClick={() => setShowGuestsModal((v) => !v)}
                >
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="guests-text">
                    {searchForm.rooms} Room{searchForm.rooms !== 1 ? 's' : ''},{' '}
                    {searchForm.adults + searchForm.children} Guest{searchForm.adults + searchForm.children !== 1 ? 's' : ''}
                  </span>
                  <svg className="guests-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', color: '#94a3b8', transition: 'transform 0.2s', transform: showGuestsModal ? 'rotate(180deg)' : 'none' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {showGuestsModal && (
                  <div className="guests-picker">
                    <div className="guests-picker__row">
                      <div className="guests-picker__info">
                        <div className="guests-picker__label">Rooms</div>
                      </div>
                      <div className="guests-picker__counter">
                        <button type="button" className="guests-picker__btn" disabled={searchForm.rooms <= 1} onClick={() => setSearchForm((f) => ({ ...f, rooms: f.rooms - 1 }))}>−</button>
                        <span className="guests-picker__count">{searchForm.rooms}</span>
                        <button type="button" className="guests-picker__btn" disabled={searchForm.rooms >= 10} onClick={() => setSearchForm((f) => ({ ...f, rooms: f.rooms + 1 }))}>+</button>
                      </div>
                    </div>
                    <div className="guests-picker__row">
                      <div className="guests-picker__info">
                        <div className="guests-picker__label">Adults</div>
                        <div className="guests-picker__sublabel">Age 18+</div>
                      </div>
                      <div className="guests-picker__counter">
                        <button type="button" className="guests-picker__btn" disabled={searchForm.adults <= 1} onClick={() => setSearchForm((f) => ({ ...f, adults: f.adults - 1 }))}>−</button>
                        <span className="guests-picker__count">{searchForm.adults}</span>
                        <button type="button" className="guests-picker__btn" disabled={searchForm.adults >= 20} onClick={() => setSearchForm((f) => ({ ...f, adults: f.adults + 1 }))}>+</button>
                      </div>
                    </div>
                    <div className="guests-picker__row">
                      <div className="guests-picker__info">
                        <div className="guests-picker__label">Children</div>
                        <div className="guests-picker__sublabel">Age 0–17</div>
                      </div>
                      <div className="guests-picker__counter">
                        <button type="button" className="guests-picker__btn" disabled={searchForm.children <= 0} onClick={() => setSearchForm((f) => ({ ...f, children: f.children - 1 }))}>−</button>
                        <span className="guests-picker__count">{searchForm.children}</span>
                        <button type="button" className="guests-picker__btn" disabled={searchForm.children >= 10} onClick={() => setSearchForm((f) => ({ ...f, children: f.children + 1 }))}>+</button>
                      </div>
                    </div>
                    <button type="button" className="guests-picker__done" onClick={() => setShowGuestsModal(false)}>Done</button>
                  </div>
                )}
              </div>

              <button type="submit" className="search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search Hotels
              </button>
            </form>
          </div>
        </section>

        {/* ===== MAIN CONTENT ===== */}
        <div className="hotels-main-content">
          <div className="hotels-container">

            {/* Mobile filter toggle */}
            <button
              className="btn-mobile-filters"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="18" x2="12" y2="18" />
              </svg>
              Filters & Sort
            </button>

            <div className="hotels-layout">
              {/* ===== SIDEBAR FILTERS ===== */}
              <aside className={`filters-sidebar ${showMobileFilters ? 'show' : ''}`}>
                <div className="filters-header">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="16" y2="12" />
                      <line x1="4" y1="18" x2="12" y2="18" />
                    </svg>
                    Filters & Sort
                  </h3>
                  <button className="close-filters" onClick={() => setShowMobileFilters(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Sort By */}
                <div className="filter-group">
                  <h4>Sort By</h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="">Select sorting option</option>
                    <option value="created_at">Newest First</option>
                    <option value="hotel_name">Name (A-Z)</option>
                    <option value="star_classification">Star Rating</option>
                    <option value="city">City</option>
                  </select>
                </div>

                {/* Star Classification */}
                <div className="filter-group">
                  <h4>Star Classification</h4>
                  <div className="star-filter-options">
                    {starOptions.map((star) => (
                      <label key={star} className="star-checkbox">
                        <input
                          type="radio"
                          name="star_filter"
                          checked={filters.star_classification === star}
                          onChange={() => handleFilterChange('star_classification', star)}
                        />
                        <span className="star-icons">
                          {[...Array(parseInt(star))].map((_, i) => (
                            <svg key={i} viewBox="0 0 24 24" fill="#f0a500" width="18" height="18">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </span>
                        <span className="star-label">{star}</span>
                      </label>
                    ))}
                    {filters.star_classification && (
                      <button
                        className="clear-star-filter"
                        onClick={() => handleFilterChange('star_classification', '')}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Property Type */}
                <div className="filter-group">
                  <h4>Property Type</h4>
                  <select
                    value={filters.hotel_classification}
                    onChange={(e) => handleFilterChange('hotel_classification', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Guesthouse">Guesthouse</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                {/* City */}
                <div className="filter-group">
                  <h4>City</h4>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <option value="">All Cities</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Negombo">Negombo</option>
                    <option value="Ella">Ella</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Mirissa">Mirissa</option>
                    <option value="Bentota">Bentota</option>
                    <option value="Dambulla">Dambulla</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Yala">Yala</option>
                  </select>
                </div>

                <button className="btn-reset" onClick={resetFilters}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset All Filters
                </button>
              </aside>

              {/* ===== HOTELS GRID ===== */}
              <main className="hotels-content">
                <div className="hotels-results-header">
                  <div className="results-count">
                    <h2>{loading ? 'Searching...' : `${pagination?.totalItems || 0} Hotels Found`}</h2>
                    <p>
                      {!loading && pagination && `Showing page ${pagination.currentPage} of ${pagination.totalPages}`}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner">
                      <div className="spinner-ring" />
                    </div>
                    <p>Finding the best hotels for you...</p>
                  </div>
                ) : hotels.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                      <path d="M3 21h18M3 7v14M21 7v14M6 11h.01M6 15h.01M6 19h.01M10 11h.01M10 15h.01M10 19h.01M14 11h.01M14 15h.01M14 19h.01M18 11h.01M18 15h.01M18 19h.01M5 7l7-4 7 4" />
                    </svg>
                    <h3>No Hotels Found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button onClick={resetFilters} className="btn-try-again">Reset Filters</button>
                  </div>
                ) : (
                  <>
                    <div className="hotels-grid" ref={hotelGridRef}>
                      {hotels.map((hotel) => (
                        <Link
                          to={`/hotels/${hotel.id}`}
                          key={hotel.id}
                          className="hotel-card"
                        >
                          <div className="hotel-card-image">
                            <img
                              src={hotel.hotel_image || '/placeholder-hotel.jpg'}
                              alt={hotel.hotel_name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png';
                              }}
                            />
                            {hotel.star_classification && (
                              <div className="hotel-star-badge">
                                <svg viewBox="0 0 24 24" fill="#f0a500" width="14" height="14">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                {hotel.star_classification}
                              </div>
                            )}
                          </div>
                          <div className="hotel-card-body">
                            <h3 className="hotel-card-title">{hotel.hotel_name}</h3>
                            <p className="hotel-card-location">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {hotel.hotel_address || `${hotel.city || 'Sri Lanka'}${hotel.country ? `, ${hotel.country}` : ''}`}
                            </p>
                            {hotel.sub_description && (
                              <p className="hotel-card-desc">
                                <span className="desc-label">Location : </span>
                                {hotel.sub_description}
                              </p>
                            )}
                            <div className="hotel-card-footer">
                              {hotel.hotel_classification && (
                                <span className="hotel-type-tag">{hotel.hotel_classification}</span>
                              )}
                              <div className="hotel-price">
                              <span className="price-amount">LKR {hotel.markup ? hotel.markup.toLocaleString() : '15,000'}</span>
                                <span className="price-unit">/ night</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="pagination">
                        <button
                          className="btn-page"
                          disabled={!pagination.hasPreviousPage}
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                          Previous
                        </button>

                        <div className="page-numbers">
                          {[...Array(pagination.totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === pagination.totalPages ||
                              (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  className={`btn-page-num ${page === pagination.currentPage ? 'active' : ''}`}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === pagination.currentPage - 2 ||
                              page === pagination.currentPage + 2
                            ) {
                              return <span key={page} className="page-ellipsis">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button
                          className="btn-page"
                          disabled={!pagination.hasNextPage}
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                        >
                          Next
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Hotels;
