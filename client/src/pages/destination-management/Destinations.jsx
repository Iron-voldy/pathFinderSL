import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { destinationsAPI } from '../../services/api';
import './Destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => fetchDestinations(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDestinations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await destinationsAPI.getAll({ search, is_active: true, limit: 100 });
      setDestinations(response.data || []);
    } catch {
      setError('Failed to load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dest-page">
        {/* Hero */}
        <section className="dest-hero">
          <div className="dest-hero__content">
            <p className="dest-hero__eyebrow">
              <span className="dest-hero__eyebrow-dot" />
              Sri Lanka
            </p>
            <h1 className="dest-hero__title">Explore Destinations</h1>
            <p className="dest-hero__subtitle">
              Discover the island's most captivating places — from ancient cities to pristine shores.
            </p>
            <div className="dest-hero__search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="dest-grid-section">
          <div className="dest-grid-wrap">
            {error ? (
              <div className="dest-error">{error}</div>
            ) : loading ? (
              <div className="dest-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="dest-skeleton" />
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div className="dest-empty">
                <p>No destinations found{search ? ` for "${search}"` : ''}.</p>
              </div>
            ) : (
              <>
                <div className="dest-section-header">
                  <h2 className="dest-section-title">
                    {search ? `Results for "${search}"` : 'All Destinations'}
                  </h2>
                  <span className="dest-section-count">{destinations.length} places</span>
                </div>
                <div className="dest-grid">
                {destinations.map((dest) => (
                  <Link to={`/destinations/${dest.id}`} key={dest.id} className="dest-card">
                    <div className="dest-card__image-wrap">
                      {dest.image_url ? (
                        <img
                          src={dest.image_url}
                          alt={dest.name}
                          className="dest-card__image"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <div className="dest-card__image-overlay" />
                      {dest.region ? (
                        <span className="dest-card__region">{dest.region}</span>
                      ) : null}
                    </div>
                    <div className="dest-card__body">
                      <h3 className="dest-card__name">{dest.name}</h3>
                      {dest.tagline ? <p className="dest-card__tagline">{dest.tagline}</p> : null}
                    </div>
                    <div className="dest-card__footer">
                      <span className="dest-card__count">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" />
                        </svg>
                        {dest.activityCount ?? 0} activities
                      </span>
                      <span className="dest-card__explore">
                        Explore
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Destinations;
