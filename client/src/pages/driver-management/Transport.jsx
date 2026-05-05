import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCalendarDays,
  faUsers,
  faMagnifyingGlass,
  faCarSide,
  faArrowRight,
  faFilter,
  faTimes,
  faStar,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { transportAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import './Transport.css';

const VEHICLE_CATEGORIES = {
  'Small Group (1-4)': ['Hatchback', 'Sedan', 'Luxury Car'],
  'Medium Group (5-7)': ['SUV', '4WD', 'MPV/Minivan'],
  'Large Group (8-30+)': ['Passenger Van', 'Mini Coach', 'Tour Bus'],
  Specialized: ['Campervan', 'Open-top Safari', 'Convertible'],
};

const CATEGORY_ICONS = {
  'Small Group (1-4)': faCarSide,
  'Medium Group (5-7)': faCarSide,
  'Large Group (8-30+)': faCarSide,
  Specialized: faCarSide,
};

const Transport = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    start_location: '',
    end_location: '',
    vehicle_category: '',
    vehicle_type: '',
    min_capacity: '',
    date: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchForm, setSearchForm] = useState({
    start_location: '',
    end_location: '',
    date: '',
    passengers: '',
  });

  const gigGridRef = useRef(null);

  const heroImages = [
    { src: '/transport-hero.jpg', alt: 'Sri Lanka Transport Services' },
    { src: '/transport-hero.jpg', alt: 'Comfortable Travel Across Sri Lanka' },
    { src: '/transport-hero.jpg', alt: 'Professional Transport Services' },
  ];

  useEffect(() => {
    fetchGigs();
  }, [filters]);

  useEffect(() => {
    if (gigs.length > 0 && gigGridRef.current) {
      const cards = gigGridRef.current.querySelectorAll('.tp-gig-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0.3, y: 30 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }
        );
      }
    }
  }, [gigs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.fromTo('.tp-hero-heading', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.tp-hero-sub', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .fromTo('.tp-hero-tag', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .fromTo('.tp-search-bar', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
  }, []);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null) delete params[k];
      });
      const response = await transportAPI.getGigs(params);
      setGigs(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      start_location: searchForm.start_location,
      end_location: searchForm.end_location,
      date: searchForm.date,
      min_capacity: searchForm.passengers,
      page: 1,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      search: '', start_location: '', end_location: '', vehicle_category: '',
      vehicle_type: '', min_capacity: '', date: '', sortBy: 'created_at',
      sortOrder: 'DESC', page: 1, limit: 12,
    });
    setSearchForm({ start_location: '', end_location: '', date: '', passengers: '' });
  };

  return (
    <>
      <Navbar />
      <div className="tp-page">
        {/* HERO */}
        <section className="tp-hero">
          <div className="tp-hero-carousel">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className={`tp-hero-slide ${i === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${img.src})` }}
              />
            ))}
            <div className="tp-hero-overlay" />
          </div>

          <div className="tp-hero-text">
            <h1 className="tp-hero-heading">Explore Sri Lanka Your Way</h1>
            <h2 className="tp-hero-sub">Book Trusted Drivers & Vehicles</h2>
            <p className="tp-hero-tag">From city transfers to cross-country tours</p>
          </div>

          <div className="tp-search-container">
            <form className="tp-search-bar" onSubmit={handleSearch}>
              <div className="tp-search-field">
                <label><FontAwesomeIcon icon={faLocationDot} /> FROM</label>
                <input
                  type="text"
                  placeholder="Starting location"
                  value={searchForm.start_location}
                  onChange={(e) => setSearchForm((p) => ({ ...p, start_location: e.target.value }))}
                />
              </div>
              <div className="tp-search-divider" />
              <div className="tp-search-field">
                <label><FontAwesomeIcon icon={faLocationDot} /> TO</label>
                <input
                  type="text"
                  placeholder="Destination"
                  value={searchForm.end_location}
                  onChange={(e) => setSearchForm((p) => ({ ...p, end_location: e.target.value }))}
                />
              </div>
              <div className="tp-search-divider" />
              <div className="tp-search-field">
                <label><FontAwesomeIcon icon={faCalendarDays} /> DATE</label>
                <input
                  type="date"
                  value={searchForm.date}
                  onChange={(e) => setSearchForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="tp-search-divider" />
              <div className="tp-search-field tp-search-field--small">
                <label><FontAwesomeIcon icon={faUsers} /> PASSENGERS</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Count"
                  value={searchForm.passengers}
                  onChange={(e) => setSearchForm((p) => ({ ...p, passengers: e.target.value }))}
                />
              </div>
              <button type="submit" className="tp-search-btn">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                Search
              </button>
            </form>
          </div>
        </section>

        {/* VEHICLE CATEGORIES */}
        <section className="tp-categories">
          <div className="tp-container">
            <h2 className="tp-section-title">Vehicle Categories</h2>
            <div className="tp-cat-grid">
              {Object.entries(VEHICLE_CATEGORIES).map(([cat, types]) => (
                <button
                  key={cat}
                  className={`tp-cat-card ${filters.vehicle_category === cat ? 'active' : ''}`}
                  onClick={() =>
                    handleFilterChange('vehicle_category', filters.vehicle_category === cat ? '' : cat)
                  }
                >
                  <FontAwesomeIcon icon={CATEGORY_ICONS[cat]} className="tp-cat-icon" />
                  <h3>{cat}</h3>
                  <p>{types.join(', ')}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="tp-main">
          <div className="tp-container">
            <div className="tp-toolbar">
              <div className="tp-toolbar-left">
                <h2 className="tp-section-title" style={{ margin: 0 }}>
                  Available Transport Services
                </h2>
                {pagination && (
                  <span className="tp-count">{pagination.totalItems} gigs found</span>
                )}
              </div>
              <div className="tp-toolbar-right">
                <button
                  className="tp-filter-toggle"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <FontAwesomeIcon icon={faFilter} /> Filters
                </button>
                <select
                  className="tp-sort"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
                  }}
                >
                  <option value="created_at-DESC">Newest First</option>
                  <option value="created_at-ASC">Oldest First</option>
                  <option value="price_per_day-ASC">Price: Low to High</option>
                  <option value="price_per_day-DESC">Price: High to Low</option>
                  <option value="passenger_capacity-DESC">Capacity: High to Low</option>
                </select>
              </div>
            </div>

            {/* Side filters panel (mobile overlay + desktop inline) */}
            <div className={`tp-filters-panel ${showMobileFilters ? 'open' : ''}`}>
              <div className="tp-filters-header">
                <h3>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="tp-filter-group">
                <label>Vehicle Type</label>
                <select
                  value={filters.vehicle_type}
                  onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  {Object.values(VEHICLE_CATEGORIES)
                    .flat()
                    .map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                </select>
              </div>

              <div className="tp-filter-group">
                <label>Min Passengers</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Any"
                  value={filters.min_capacity}
                  onChange={(e) => handleFilterChange('min_capacity', e.target.value)}
                />
              </div>

              <div className="tp-filter-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <button className="tp-filter-reset" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>

            {/* Gigs Grid */}
            {loading ? (
              <div className="tp-loading">
                <div className="tp-spinner" />
                <p>Loading transport services...</p>
              </div>
            ) : gigs.length === 0 ? (
              <div className="tp-empty">
                <FontAwesomeIcon icon={faCarSide} className="tp-empty-icon" />
                <h3>No transport services found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="tp-filter-reset" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="tp-gig-grid" ref={gigGridRef}>
                {gigs.map((gig) => {
                  const imgs = gig.images || [];
                  const thumb = imgs.length > 0 ? imgs[0] : '/transport_placeholder.jpg';
                  return (
                    <Link to={`/transport/${gig.id}`} key={gig.id} className="tp-gig-card">
                      <div className="tp-gig-img" style={{ backgroundImage: `url(${thumb})` }}>
                        <span className="tp-gig-badge">{gig.vehicle_category}</span>
                      </div>
                      <div className="tp-gig-body">
                        <h3 className="tp-gig-title">{gig.title}</h3>
                        <div className="tp-gig-route">
                          <span>{gig.start_location}</span>
                          <FontAwesomeIcon icon={faArrowRight} />
                          <span>{gig.end_location}</span>
                        </div>
                        <div className="tp-gig-meta">
                          <span className="tp-gig-type">{gig.vehicle_type}</span>
                          <span className="tp-gig-cap">
                            <FontAwesomeIcon icon={faUsers} /> {gig.passenger_capacity}
                          </span>
                        </div>
                        {gig.driver && (
                          <div className="tp-gig-driver">
                            <span>By {gig.driver.full_name}</span>
                          </div>
                        )}
                        <div className="tp-gig-footer">
                          <span className="tp-gig-price">
                            {gig.currency} {parseFloat(gig.price_per_day).toLocaleString()}
                            <small>/day</small>
                          </span>
                          <span className="tp-gig-view">
                            View Details <FontAwesomeIcon icon={faArrowRight} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="tp-pagination">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.currentPage) <= 2
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="tp-page-dots">...</span>}
                      <button
                        className={p === pagination.currentPage ? 'active' : ''}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Transport;
