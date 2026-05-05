import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './HeroSlider.css';

/* ─── Destination data ──────────────────────────────────── */
const data = [
  {
    place: 'North Central Province – Sri Lanka',
    title: 'SIGIRIYA',
    title2: 'LION ROCK',
    description:
      "Soaring 200 metres above the jungle canopy, Sigiriya's Lion Rock is Sri Lanka's most awe-inspiring landmark. This UNESCO World Heritage fortress reveals ancient frescoes, mirror-wall inscriptions and jaw-dropping dawn views of mist rolling through boundless rainforest.",
    image: '/sigiriya.jpg',
  },
  {
    place: 'Southern Coast – Sri Lanka',
    title: 'MIRISSA',
    title2: 'BEACH',
    description:
      "An aerial paradise of turquoise lagoons, powdery coral sand and emerald coconut groves — Mirissa is Sri Lanka's most picture-perfect bay. Swim in calm tropical waters by day and dine on fresh catch beneath a canopy of stars at night.",
    image: '/mirissa.jpg',
  },
  {
    place: 'Deep South – Sri Lanka',
    title: 'DOWN',
    title2: 'SOUTH',
    description:
      "The Deep South coast enchants travellers with traditional oruwa fishing boats, volcanic black-sand shores and calm sapphire seas fringed by lush green hills. An authentic, unhurried slice of Sri Lankan coastal life far from the tourist crowds.",
    image: '/down_south.jpg',
  },
  {
    place: 'Wildlife – Sri Lanka',
    title: 'ELEPHANT',
    title2: 'KINGDOM',
    description:
      "Sri Lanka is home to one of Asia's largest wild elephant populations. Watch herds roam misty ridge-top forests at dawn — a raw, humbling encounter with nature that no safari on earth can rival. Every sighting is a once-in-a-lifetime moment.",
    image: '/elephants.jpg',
  },
];

const N          = data.length;
const CARD_W     = 200;
const CARD_H     = 300;
const GAP        = 40;
const NUM_SIZE   = 50;
const EASE       = 'sine.inOut';
const IND_DUR    = 2.5; // seconds per slide indicator

/* ─── Component ─────────────────────────────────────────── */
export default function HeroSlider() {
  /* Content state — only drives the text panel */
  const [activeIdx, setActiveIdx] = useState(0);

  /* All GSAP logic lives in one useEffect to avoid stale closures */
  useEffect(() => {
    let mounted  = true;
    const order  = [...Array(N).keys()];   // [0,1,2,3]
    let clicks   = 0;
    let oTop     = 0;
    let oLeft    = 0;

    /* ── helpers ── */
    const card  = (i) => `#hs-card-${i}`;
    const cc    = (i) => `#hs-cc-${i}`;   // card content label
    const num   = (i) => `#hs-num-${i}`;

    /* ── init ── */
    function init() {
      const [active, ...rest] = order;
      const W = window.innerWidth;
      const H = window.innerHeight;
      oTop  = H - 430;
      oLeft = W - 830;

      /* Pagination bar — start below + transparent */
      gsap.set('#hs-pagination', { top: oTop + 330, left: oLeft, y: 200, opacity: 0, zIndex: 60 });

      /* Active card fills viewport */
      gsap.set(card(active), { x: 0, y: 0, width: W, height: H, zIndex: 20, borderRadius: 0 });
      gsap.set(cc(active),   { opacity: 0 });

      /* Details panel hidden left */
      gsap.set('#hs-details', { opacity: 0, x: -200 });
      gsap.set('#hs-details .hs-text',    { y: 100 });
      gsap.set('#hs-details .hs-title-1', { y: 100 });
      gsap.set('#hs-details .hs-title-2', { y: 100 });
      gsap.set('#hs-details .hs-desc',    { y:  50 });
      gsap.set('#hs-details .hs-cta',     { y:  60 });

      /* Progress bar initial width */
      gsap.set('.hs-progress-fill', { width: 500 * (1 / N) * (active + 1) });

      /* Thumbnails — start at oLeft+400 (off right), slide to oLeft */
      rest.forEach((i, idx) => {
        gsap.set(card(i), {
          x: oLeft + 400 + idx * (CARD_W + GAP),
          y: oTop, width: CARD_W, height: CARD_H, zIndex: 30, borderRadius: 10,
        });
        gsap.set(cc(i), {
          x: oLeft + 400 + idx * (CARD_W + GAP),
          y: oTop + CARD_H - 100, zIndex: 40, opacity: 1,
        });
        gsap.set(num(i), { x: (idx + 1) * NUM_SIZE });
      });

      /* Indicator hidden left */
      gsap.set(document.querySelectorAll('.hs-indicator'), { x: -W });

      /* ── entrance animation ── */
      const delay = 0.6;

      /* Wipe the cover away */
      gsap.to('.hs-cover', {
        x: W + 400, delay: 0.5, duration: 0.9, ease: EASE,
        onComplete: () => {
          if (!mounted) return;
          setTimeout(() => { if (mounted) startLoop(); }, 400);
        },
      });

      /* Thumbnails slide in */
      rest.forEach((i, idx) => {
        gsap.to(card(i), { x: oLeft + idx * (CARD_W + GAP), ease: EASE, delay: delay + 0.05 * idx });
        gsap.to(cc(i),   { x: oLeft + idx * (CARD_W + GAP), ease: EASE, delay: delay + 0.05 * idx });
      });

      /* Pagination + Details slide in */
      gsap.to('#hs-pagination', { y: 0, opacity: 1, ease: EASE, delay });
      gsap.to('#hs-details',    { opacity: 1, x: 0, ease: EASE, delay: delay + 0.1 });
      gsap.to('#hs-details .hs-text',    { y: 0, ease: EASE, delay: delay + 0.1, duration: 0.7 });
      gsap.to('#hs-details .hs-title-1', { y: 0, ease: EASE, delay: delay + 0.15, duration: 0.7 });
      gsap.to('#hs-details .hs-title-2', { y: 0, ease: EASE, delay: delay + 0.2, duration: 0.7 });
      gsap.to('#hs-details .hs-desc',    { y: 0, ease: EASE, delay: delay + 0.3, duration: 0.5 });
      gsap.to('#hs-details .hs-cta',     { y: 0, ease: EASE, delay: delay + 0.35, duration: 0.5 });
    }

    /* ── one slide step ── */
    function step() {
      return new Promise((resolve) => {
        if (!mounted) return;

        /* Rotate order */
        order.push(order.shift());
        const [active, ...rest] = order;
        const prv = rest[rest.length - 1];

        /* Update text panel */
        setActiveIdx(active);

        /* Details — slide out then in */
        gsap.to('#hs-details', {
          opacity: 0, x: -60, duration: 0.3, ease: EASE,
          onComplete: () => {
            if (!mounted) return;
            gsap.set('#hs-details .hs-text',    { y: 100 });
            gsap.set('#hs-details .hs-title-1', { y: 100 });
            gsap.set('#hs-details .hs-title-2', { y: 100 });
            gsap.set('#hs-details .hs-desc',    { y:  50 });
            gsap.set('#hs-details .hs-cta',     { y:  60 });
            gsap.set('#hs-details',             { x:   0 });

            gsap.to('#hs-details',            { opacity: 1, delay: 0.05, duration: 0.5, ease: EASE });
            gsap.to('#hs-details .hs-text',    { y: 0, delay: 0.1,  duration: 0.6, ease: EASE });
            gsap.to('#hs-details .hs-title-1', { y: 0, delay: 0.15, duration: 0.6, ease: EASE });
            gsap.to('#hs-details .hs-title-2', { y: 0, delay: 0.2,  duration: 0.6, ease: EASE });
            gsap.to('#hs-details .hs-desc',    { y: 0, delay: 0.3,  duration: 0.4, ease: EASE });
            gsap.to('#hs-details .hs-cta',     { y: 0, delay: 0.35, duration: 0.4, ease: EASE });
          },
        });

        /* Numbers & progress */
        gsap.to(num(active), { x: 0, ease: EASE });
        gsap.to(num(prv),    { x: -NUM_SIZE, ease: EASE });
        gsap.to('.hs-progress-fill', { width: 500 * (1 / N) * (active + 1), ease: EASE });

        /* Previous (full-screen) card: push behind and scale up slightly */
        gsap.set(card(prv),    { zIndex: 10 });
        gsap.set(card(active), { zIndex: 20 });
        gsap.to(card(prv), { scale: 1.5, ease: EASE });

        /* Fade out active thumbnail label as it expands */
        gsap.to(cc(active), { y: oTop + CARD_H, opacity: 0, duration: 0.3, ease: EASE });

        /* MAIN MOVE — active card expands from thumbnail → full screen */
        gsap.to(card(active), {
          x: 0, y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          ease: EASE,
          onComplete: () => {
            if (!mounted) return;

            /* Snap prv card to its new thumbnail slot */
            const xNew = oLeft + (rest.length - 1) * (CARD_W + GAP);
            gsap.set(card(prv), {
              x: xNew, y: oTop, width: CARD_W, height: CARD_H,
              zIndex: 30, borderRadius: 10, scale: 1,
            });
            gsap.set(cc(prv),  { x: xNew, y: oTop + CARD_H - 100, opacity: 1, zIndex: 40 });
            gsap.set(num(prv), { x: rest.length * NUM_SIZE });

            clicks -= 1;
            if (clicks > 0 && mounted) {
              step().then(resolve);
            } else {
              resolve();
            }
          },
        });

        /* Slide all other thumbnails into their new positions */
        rest.forEach((i, idx) => {
          if (i === prv) return;
          const xNew = oLeft + idx * (CARD_W + GAP);
          gsap.set(card(i), { zIndex: 30 });
          gsap.to(card(i), {
            x: xNew, y: oTop, width: CARD_W, height: CARD_H,
            ease: EASE, delay: 0.1 * (idx + 1),
          });
          gsap.to(cc(i), {
            x: xNew, y: oTop + CARD_H - 100, opacity: 1, zIndex: 40,
            ease: EASE, delay: 0.1 * (idx + 1),
          });
          gsap.to(num(i), { x: (idx + 1) * NUM_SIZE, ease: EASE });
        });
      });
    }

    /* ── auto loop ── */
    async function startLoop() {
      if (!mounted) return;
      await new Promise((r) =>
        gsap.to(document.querySelectorAll('.hs-indicator'), { x: 0, duration: IND_DUR, ease: 'none', onComplete: r })
      );
      if (!mounted) return;
      await new Promise((r) =>
        gsap.to(document.querySelectorAll('.hs-indicator'), { x: window.innerWidth, duration: 0.7, delay: 0.3, ease: EASE, onComplete: r })
      );
      gsap.set(document.querySelectorAll('.hs-indicator'), { x: -window.innerWidth });
      if (!mounted) return;
      await step();
      if (mounted) startLoop();
    }

    /* ── nav buttons ── */
    const nextBtn = document.getElementById('hs-btn-next');
    const prevBtn = document.getElementById('hs-btn-prev');

    function handleNext() {
      clicks++;
      if (clicks === 1) step();
    }
    function handlePrev() {
      for (let i = 0; i < N - 1; i++) order.unshift(order.pop());
      clicks++;
      if (clicks === 1) step();
    }

    nextBtn?.addEventListener('click', handleNext);
    prevBtn?.addEventListener('click', handlePrev);

    /* ── resize ── */
    function onResize() {
      const W = window.innerWidth, H = window.innerHeight;
      oTop  = H - 430;
      oLeft = W - 830;
      const [active, ...rest] = order;
      gsap.set(card(active), { width: W, height: H });
      gsap.set('#hs-pagination', { top: oTop + 330, left: oLeft });
      rest.forEach((i, idx) => {
        gsap.set(card(i), { x: oLeft + idx * (CARD_W + GAP), y: oTop });
        gsap.set(cc(i),   { x: oLeft + idx * (CARD_W + GAP), y: oTop + CARD_H - 100 });
      });
    }
    window.addEventListener('resize', onResize);

    /* ── preload images then init ── */
    Promise.all(
      data.map(
        ({ image }) =>
          new Promise((res) => {
            const img = new Image();
            img.onload = img.onerror = res;
            img.src = image;
          })
      )
    ).then(() => {
      if (mounted) init();
    });

    return () => {
      mounted = false;
      nextBtn?.removeEventListener('click', handleNext);
      prevBtn?.removeEventListener('click', handlePrev);
      window.removeEventListener('resize', onResize);
      gsap.killTweensOf('*');
    };
  }, []); // runs once on mount

  const cur = data[activeIdx];

  return (
    <section className="hs-root">
      {/* Top slide-timing indicator */}
      <div className="hs-indicator" />

      {/* Cards — each is positioned/sized by GSAP */}
      {data.map((d, i) => (
        <div key={i}>
          <div
            id={`hs-card-${i}`}
            className="hs-card"
            style={{ backgroundImage: `url(${d.image})` }}
          />
          <div id={`hs-cc-${i}`} className="hs-card-content">
            <div className="hs-content-bar" />
            <div className="hs-content-place">{d.place}</div>
            <div className="hs-content-t1">{d.title}</div>
            <div className="hs-content-t2">{d.title2}</div>
          </div>
        </div>
      ))}

      {/* Details panel — React state drives content, GSAP drives visibility */}
      <div className="hs-details" id="hs-details">
        <div className="hs-place-box">
          <div className="hs-text">{cur.place}</div>
        </div>
        <div className="hs-title-box">
          <div className="hs-title-1">{cur.title}</div>
        </div>
        <div className="hs-title-box">
          <div className="hs-title-2">{cur.title2}</div>
        </div>
        <div className="hs-desc">{cur.description}</div>
        <div className="hs-cta">
          <button className="hs-btn-bookmark" aria-label="Save">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <Link to="/destinations" className="hs-btn-discover">
            Discover Location
          </Link>
        </div>
      </div>

      {/* Pagination row */}
      <div className="hs-pagination" id="hs-pagination">
        <button id="hs-btn-prev" className="hs-arrow" aria-label="Previous">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button id="hs-btn-next" className="hs-arrow" aria-label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div className="hs-progress-wrap">
          <div className="hs-progress-bg">
            <div className="hs-progress-fill" />
          </div>
        </div>
        <div className="hs-slide-numbers">
          {data.map((_, i) => (
            <div key={i} id={`hs-num-${i}`} className="hs-num-item">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Intro wipe cover */}
      <div className="hs-cover" />
    </section>
  );
}
