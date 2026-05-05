import Navbar from '../shared/Navbar';
import '../../pages/user-management/auth/AuthPages.css';

const copyByPortal = {
  user: {
    eyebrow: 'Traveler account',
    brandLabel: 'Traveler space',
    title: 'Keep your Sri Lanka plans in one refined traveler space.',
    description:
      'Save hotel ideas, manage your profile, and return to your planning flow without starting from scratch.',
    highlights: [
      {
        title: 'Saved stays',
        text: 'Keep your shortlist ready and come back to it anytime.',
      },
      {
        title: 'Profile ready',
        text: 'Store your traveler details in one clean account space.',
      },
      {
        title: 'Secure recovery',
        text: 'Use email OTP verification whenever you need account help.',
      },
    ],
    image: null,
  },
  admin: {
    eyebrow: 'Admin portal',
    brandLabel: 'Operations access',
    title: 'Protected access for hotel management',
    description:
      'The admin entry is kept separate from the public navbar, with secured hotel CRUD routes and dedicated credentials for staff access.',
    highlights: [
      {
        title: 'Separate entry',
        text: 'The admin route stays distinct from the public traveler flow.',
      },
      {
        title: 'Protected tools',
        text: 'Hotel operations stay behind role-aware access controls.',
      },
      {
        title: 'Recovery flow',
        text: 'Staff can regain access through a secure OTP verification flow.',
      },
    ],
    image: '/hotel_hero_2.jpg',
  },
};

const AuthShell = ({ portal = 'user', heading, subheading, story, children }) => {
  const defaults = copyByPortal[portal] || copyByPortal.user;
  const content = {
    ...defaults,
    ...story,
    highlights: story?.highlights || defaults.highlights,
  };

  return (
    <>
      <Navbar />

      <main className={`auth-page auth-page--${portal}`}>
        <div className="auth-shell">
          <section className="auth-shell__story">
            <div className="auth-shell__story-card">
              <div className="auth-shell__brand">
                <span className="auth-shell__brand-mark">PF</span>
                <div className="auth-shell__brand-copy">
                  <strong>PathFinderSL</strong>
                  <span>{content.brandLabel}</span>
                </div>
              </div>

              <div className="auth-shell__story-main">
                <p className="auth-shell__eyebrow">{content.eyebrow}</p>
                <h1>{heading || content.title}</h1>
                <p className="auth-shell__lead">{subheading || content.description}</p>

                <div className="auth-shell__highlight-list">
                  {content.highlights.map((item, index) => {
                    const isWide =
                      content.highlights.length % 2 === 1 &&
                      index === content.highlights.length - 1;

                    return (
                      <div
                        key={item.title}
                        className={`auth-shell__highlight ${
                          isWide ? 'auth-shell__highlight--wide' : ''
                        }`}
                      >
                        <span className="auth-shell__highlight-icon">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="auth-shell__highlight-copy">
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {content.image ? (
                  <div className="auth-shell__story-media">
                    <img src={content.image} alt="PathFinderSL travel inspiration" />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="auth-shell__form-panel">{children}</section>
        </div>
      </main>
    </>
  );
};

export default AuthShell;
