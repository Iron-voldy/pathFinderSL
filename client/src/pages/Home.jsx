import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo('.hero-content h1',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5 }
      );

      gsap.fromTo('.hero-content p',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8 }
      );

      gsap.fromTo('.hero-cta',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.1 }
      );

      // Features animation
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 80%',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        }
      );

      // Stats animation
      gsap.fromTo('.stat-item',
        { opacity: 0, scale: 0.8 },
        {
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 80%',
          },
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.6,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      
      {/* Video Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          >
            <source src="/travelVid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="container">
            <h1 className="hero-title">Discover Sri Lanka</h1>
            <p className="hero-subtitle">
              Your Gateway to Unforgettable Journeys
            </p>
            <div className="hero-cta">
              <Link to="/hotels" className="btn-primary">
                Explore Hotels
              </Link>
              <Link to="/tours" className="btn-secondary">
                View Tours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <h2 className="section-title">Why Choose PathFinderSL?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/hotel.gif" alt="Premium Hotels" />
              </div>
              <h3>Premium Hotels</h3>
              <p>Handpicked accommodations from luxury resorts to cozy guesthouses</p>
              <Link to="/hotels" className="feature-link">Explore Hotels →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="/way.gif" alt="Expert Guidance" />
              </div>
              <h3>Expert Guidance</h3>
              <p>Curated tours and destinations by local travel experts</p>
              <Link to="/tours" className="feature-link">View Tours →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="/best-price.gif" alt="Best Prices" />
              </div>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees</p>
              <Link to="/hotels" className="feature-link">See Deals →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="/sri-lanka.png" alt="Local Experience" />
              </div>
              <h3>Local Experience</h3>
              <p>Authentic Sri Lankan hospitality and culture</p>
              <Link to="/destinations" className="feature-link">Discover →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2,277+</div>
              <div className="stat-label">Hotels & Stays</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Destinations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Start Your Journey Today</h2>
          <p>Find the perfect accommodation for your Sri Lankan adventure</p>
          <Link to="/hotels" className="btn-large">
            Browse Hotels
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
