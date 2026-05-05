import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHotel, faMapLocationDot, faVanShuttle, faBinoculars,
  faMagnifyingGlass, faClipboardCheck, faUmbrellaBeach,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/shared/Navbar';
import HeroSlider from '../components/shared/HeroSlider';
import Footer from '../components/shared/Footer';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  useEffect(() => {
    // Service pillars — no opacity so they're always visible
    gsap.from('.srv-pillar', {
      scrollTrigger: { trigger: '.srv-section', start: 'top 85%' },
      y: 60, stagger: 0.1, duration: 0.75, ease: 'power3.out',
    });

    // Destinations mosaic
    gsap.from('.dest-card', {
      scrollTrigger: { trigger: '.dest-section', start: 'top 80%' },
      y: 40, scale: 0.95, stagger: 0.07, duration: 0.6, ease: 'power3.out',
    });

    // Stats counter
    document.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2.5, ease: 'power2.out',
        scrollTrigger: { trigger: '.stats-section', start: 'top 85%', once: true },
        onUpdate() { el.textContent = Math.round(obj.val).toLocaleString() + suffix; },
      });
    });

    // Steps
    gsap.from('.step-item', {
      scrollTrigger: { trigger: '.steps-section', start: 'top 85%' },
      y: 40, stagger: 0.18, duration: 0.65, ease: 'power3.out',
    });
    gsap.from('.step-connector', {
      scrollTrigger: { trigger: '.steps-section', start: 'top 85%' },
      scaleX: 0, stagger: 0.2, duration: 0.8, delay: 0.3, ease: 'power2.inOut',
    });

    // AI section
    gsap.from('.ai-text', {
      scrollTrigger: { trigger: '.ai-section', start: 'top 82%' },
      x: -50, duration: 0.8, ease: 'power3.out',
    });
    gsap.from('.ai-visual', {
      scrollTrigger: { trigger: '.ai-section', start: 'top 82%' },
      x: 50, duration: 0.8, ease: 'power3.out',
    });

    // CTA
    gsap.from('.cta-content > *', {
      scrollTrigger: { trigger: '.final-cta', start: 'top 85%' },
      y: 35, stagger: 0.15, duration: 0.7, ease: 'power3.out',
    });
  }, []);

  return (
    <div className="home-page">
      {/* Navbar is position:fixed so it floats above all content including the hero slider */}
      <Navbar />

      {/* ── Animated hero slider replacing the video hero ── */}
      <HeroSlider />

      {/* ═══ SERVICES PILLARS ═══ */}
      <section className="srv-section">
        <div className="srv-eyebrow">WHAT WE OFFER</div>
        <div className="srv-grid">
          <Link to="/hotels" className="srv-pillar" style={{ '--bg': 'url(/hotel_hero_1.jpg)' }}>
            <div className="srv-inner">
              <span className="srv-fa-icon"><FontAwesomeIcon icon={faHotel} /></span>
              <h3>Hotels &amp; Stays</h3>
              <p>From luxury resorts to cosy boutique guesthouses across the island</p>
              <span className="srv-arrow"><FontAwesomeIcon icon={faArrowRight} /> Explore</span>
            </div>
          </Link>
          <Link to="/destinations" className="srv-pillar" style={{ '--bg': 'url(/sigiriya-rock.jpg)' }}>
            <div className="srv-inner">
              <span className="srv-fa-icon"><FontAwesomeIcon icon={faMapLocationDot} /></span>
              <h3>Destinations</h3>
              <p>Discover Sri Lanka's most breathtaking places and hidden gems</p>
              <span className="srv-arrow"><FontAwesomeIcon icon={faArrowRight} /> Explore</span>
            </div>
          </Link>
          <Link to="/transport" className="srv-pillar" style={{ '--bg': 'url(/transport-hero.jpg)' }}>
            <div className="srv-inner">
              <span className="srv-fa-icon"><FontAwesomeIcon icon={faVanShuttle} /></span>
              <h3>Transport</h3>
              <p>Verified drivers &amp; vehicles for any journey — city or cross-country</p>
              <span className="srv-arrow"><FontAwesomeIcon icon={faArrowRight} /> Explore</span>
            </div>
          </Link>
          <Link to="/destinations" className="srv-pillar" style={{ '--bg': 'url(/yala.jpg)' }}>
            <div className="srv-inner">
              <span className="srv-fa-icon"><FontAwesomeIcon icon={faBinoculars} /></span>
              <h3>Experiences</h3>
              <p>Wildlife safaris, cultural tours and ocean adventures await</p>
              <span className="srv-arrow"><FontAwesomeIcon icon={faArrowRight} /> Explore</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ DESTINATIONS MOSAIC ═══ */}
      <section className="dest-section">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">EXPLORE</span>
            <h2>Sri Lanka Awaits</h2>
            <p>23,000 km² of tropical paradise — from ancient kingdoms to turquoise shores</p>
          </div>
          <div className="dest-mosaic">
            <Link to="/destinations" className="dest-card dest-tall">
              <img src="/kandy.jpg" alt="Kandy" loading="lazy" />
              <div className="dest-label"><h4>Kandy</h4><span>Cultural Capital</span></div>
            </Link>
            <Link to="/destinations" className="dest-card dest-wide">
              <img src="/ella.jpg" alt="Ella" loading="lazy" />
              <div className="dest-label"><h4>Ella</h4><span>Hill Country</span></div>
            </Link>
            <Link to="/destinations" className="dest-card">
              <img src="/mirissa-beach.jpg" alt="Mirissa" loading="lazy" />
              <div className="dest-label"><h4>Mirissa</h4><span>Beach Paradise</span></div>
            </Link>
            <Link to="/destinations" className="dest-card">
              <img src="/galle-fort.jpg" alt="Galle" loading="lazy" />
              <div className="dest-label"><h4>Galle Fort</h4><span>Colonial Heritage</span></div>
            </Link>
            <Link to="/destinations" className="dest-card dest-wide">
              <img src="/yala.jpg" alt="Yala" loading="lazy" />
              <div className="dest-label"><h4>Yala</h4><span>Wildlife Safari</span></div>
            </Link>
            <Link to="/destinations" className="dest-card dest-tall">
              <img src="/trincomalee.jpg" alt="Trincomalee" loading="lazy" />
              <div className="dest-label"><h4>Trincomalee</h4><span>East Coast</span></div>
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/destinations" className="btn-outline-dark">View All Destinations →</Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="stats-bg" style={{ backgroundImage: 'url(/sigiriya.jpg)' }} />
        <div className="stats-overlay" />
        <div className="container stats-inner">
          <div className="stat-item">
            <div className="stat-num" data-target="2277" data-suffix="+">0</div>
            <div className="stat-label">Hotels &amp; Stays</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="50" data-suffix="+">0</div>
            <div className="stat-label">Destinations</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="10000" data-suffix="+">0</div>
            <div className="stat-label">Happy Travelers</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="500" data-suffix="+">0</div>
            <div className="stat-label">Verified Drivers</div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="steps-section">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">HOW IT WORKS</span>
            <h2>Travel in 3 Simple Steps</h2>
          </div>
          <div className="steps-row">
            <div className="step-item">
              <div className="step-num">01</div>
              <div className="step-fa-icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></div>
              <h3>Search &amp; Discover</h3>
              <p>Browse hotels, destinations, drivers and experiences tailored to Sri Lanka</p>
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-num">02</div>
              <div className="step-fa-icon"><FontAwesomeIcon icon={faClipboardCheck} /></div>
              <h3>Book Securely</h3>
              <p>Confirm bookings with real-time availability and instant confirmation</p>
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-num">03</div>
              <div className="step-fa-icon"><FontAwesomeIcon icon={faUmbrellaBeach} /></div>
              <h3>Explore &amp; Enjoy</h3>
              <p>Your adventure begins — with 24/7 local support every step of the way</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI TRAVEL ASSISTANT PROMO ═══ */}
      <section className="ai-section">
        <div className="container ai-wrap">
          <div className="ai-text">
            <span className="section-tag section-tag--light">AI POWERED</span>
            <h2>Your Personal<br />Sri Lanka<br />Travel Guide</h2>
            <p>Ask anything — best time to visit Sigiriya, where to eat in Galle, hidden beaches on the east coast. Our AI assistant knows Sri Lanka inside out and plans your perfect trip in seconds.</p>
            <div className="ai-features">
              <span>✓ Real-time destination insights</span>
              <span>✓ Personalised itinerary suggestions</span>
              <span>✓ Budget &amp; weather planning</span>
            </div>
          </div>
          <div className="ai-visual">
            <div className="ai-phone">
              <div className="ai-phone-header">
                <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                <span className="ai-phone-title">🤖 PathFinder AI</span>
              </div>
              <div className="ai-messages">
                <div className="ai-msg ai-msg--user">What's the best time to see blue whales off Mirissa?</div>
                <div className="ai-msg ai-msg--bot">
                  🐋 Blue whale season runs <strong>November–April</strong>. Peak months are Jan–March when calm seas allow deep-water excursions. Best departure point is Mirissa Harbour at dawn.
                </div>
                <div className="ai-msg ai-msg--user">Book a driver from Colombo to Mirissa?</div>
                <div className="ai-msg ai-msg--bot">Sure! I found 12 verified drivers for that route. The journey is ~140 km (~3 hrs). Want me to filter by vehicle type? 🚐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="final-cta" style={{ backgroundImage: 'url(/down_south.jpg)' }}>
        <div className="final-cta-overlay" />
        <div className="cta-content">
          <p className="cta-eyebrow">START YOUR JOURNEY</p>
          <h2>Your Sri Lanka Story<br />Starts Here</h2>
          <p className="cta-sub">Join thousands of travellers who've discovered paradise with PathFinderSL</p>
          <div className="cta-buttons">
            <Link to="/hotels" className="cta-btn cta-btn--primary">Browse Hotels</Link>
            <Link to="/transport" className="cta-btn cta-btn--outline">Book a Driver</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
