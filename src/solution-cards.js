// solution-cards.js
export function initSolutionCards() {
  console.log('[solutions] init');

  const wrapper = document.querySelector('[data-solutions]');
  if (!wrapper) return console.log('[solutions] no wrapper');

  const mode  = wrapper.getAttribute('data-solutions'); // "scroll" | "autoplay" | "svg"
  const cards = [...wrapper.querySelectorAll('[data-solutions-card]')];
  if (!cards.length) return console.log('[solutions] no cards');

  // keep track of which card is currently active
  let currentIndex = 0;

  // --- SVG helpers (moved up so openCard can call them safely) ----------
  // Cache original fills for elements inside an svg (first time only)
  const cacheOriginalFills = (svg) => {
    if (!svg || svg.__fillsCached) return;
    const elems = svg.querySelectorAll('path, circle, rect, polygon, g, ellipse, polyline');
    elems.forEach(el => {
      if (el.hasAttribute('fill')) {
        el.dataset.__origFill = el.getAttribute('fill') || '';
      } else {
        try {
          el.dataset.__origFill = getComputedStyle(el).fill || '';
        } catch (e) {
          el.dataset.__origFill = '';
        }
      }
    });
    svg.__fillsCached = true;
  };

  // set fill to a CSS value (like 'var(--brand-red)') or null to restore original
  // Lottie & SVG handling helper: prefer Lottie if present, otherwise adjust inline SVG fill
  const getLottiePlayer = (card) => {
    if (!card) return null;
    // include Webflow's lottie wrappers (data-animation-type="lottie" / data-src) and common selectors
    const el = card.querySelector(
      'lottie-player, [data-lottie-player], [data-lottie], .lottie, [data-animation-type="lottie"], [data-src], [data-w-id]'
    );
    return el || null;
  };

  const playLottie = (card, shouldPlay = true) => {
    const playerEl = getLottiePlayer(card);
    if (!playerEl) return false;

    // try common stored instance locations
    let inst = playerEl.__lottieInstance || playerEl.__lottie || playerEl.lottieInstance || playerEl._lottie || playerEl.anim || playerEl.__wf_lottie;

    // if no instance, try to (re)create one via bodymovin/window.lottie if path is available
    if (!inst) {
      const bodymovin = window.bodymovin || window.lottie || window.lottieJS;
      const path = playerEl.dataset.src || playerEl.getAttribute('data-src') || playerEl.getAttribute('data-animation');
      if (bodymovin && path && typeof bodymovin.loadAnimation === 'function') {
        try {
          inst = bodymovin.loadAnimation({
            container: playerEl,
            renderer: playerEl.dataset.renderer || 'svg',
            loop: (playerEl.dataset.loop === '1' || playerEl.dataset.loop === 'true'),
            autoplay: false, // create paused — we'll control playback
            path
          });
          // cache on element to avoid re-creating
          playerEl.__lottieInstance = inst;
        } catch (err) {
          // ignore and fall back
          return false;
        }
      }
    }

    if (!inst) {
      // last-ditch: maybe the element itself is a webcomponent with play/stop
      try {
        if (shouldPlay && typeof playerEl.play === 'function') { playerEl.play(); return true; }
        if (!shouldPlay && typeof playerEl.pause === 'function') { playerEl.pause(); return true; }
      } catch (e) { return false; }
      return false;
    }

    // control known instance APIs
    try {
      if (shouldPlay) {
        // prefer goToAndPlay(0) to restart reliably, fallback to play()
        if (typeof inst.goToAndPlay === 'function') inst.goToAndPlay(0, true);
        else if (typeof inst.stop === 'function') { inst.stop(); if (typeof inst.play === 'function') inst.play(); }
        else if (typeof inst.play === 'function') inst.play();
      } else {
        if (typeof inst.stop === 'function') inst.stop();
        else if (typeof inst.pause === 'function') inst.pause();
      }
      return true;
    } catch (e) {
      return false;
    }
  };
  // ensure any lotties that autoplayed on load are paused so they only play on activation
  // run on next frame so any webflow init that created instances has run
  requestAnimationFrame(() => {
    cards.forEach(c => { try { playLottie(c, false); } catch (e) { /* ignore */ } });
  });
 // ---------------------------------------------------------------------

  // normalize clips
  cards.forEach(c => {
    const clip = c.querySelector('.card-text-clip');
    if (!clip) return;
    clip.style.removeProperty('height');
    clip.style.overflow = 'hidden';
    if (!clip.style.transition) clip.style.transition = 'max-height 400ms ease';
    clip.style.maxHeight = '0px';
  });

  function openCard(card) {
    cards.forEach(c => {
      const on = c === card;
      // toggle class only — visual styles handled by CSS
      c.classList.toggle('is-active', on);

      // keep currentIndex in sync
      if (on) currentIndex = cards.indexOf(card);

      const clip = c.querySelector('.card-text-clip');
      if (!clip) return;
      clip.style.maxHeight = on
        ? (clip.firstElementChild?.scrollHeight || 0) + 'px'
        : '0px';
    });

    // SVG handling: only run when wrapper mode is "svg" OR when individual card has data-solutions-svg
    const svgMode = mode === 'svg';
    cards.forEach(c => {
      const perCardSvg = c.hasAttribute('data-solutions-svg');
      const hasLottie = !!getLottiePlayer(c);

      if (svgMode || perCardSvg) {
        if (hasLottie) {
          // prefer controlling Lottie player if present
          if (c === card) playLottie(c, true);
          else playLottie(c, false);
        } else {
          // fallback to SVG fill behavior
          if (c === card) setSvgFill(c, 'var(--brand-red)');
          else setSvgFill(c, null);
        }
      } else {
        // not in svg mode: ensure any Lottie is stopped and SVGs restored
        if (hasLottie) playLottie(c, false);
        else setSvgFill(c, null);
      }
    });
  }

  // make cards clickable / keyboard accessible and (for autoplay) pause on user interaction
  let userPaused = false;
  let pauseTimer = null;
  const pauseAutoplay = (ms = 8000) => {
    userPaused = true;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => { userPaused = false; }, ms);
  };

  cards.forEach(c => {
    if (c.__solutionsClickable) return;
    c.__solutionsClickable = true;
    if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
    if (!c.hasAttribute('role')) c.setAttribute('role', 'button');
    c.style.cursor = 'pointer';
    // visual transitions handled by CSS (keep JS minimal)

    c.addEventListener('click', () => {
      // activate card and also ensure the right content is shown (scroll into view if content exists)
      openCard(c);
      const id = c.getAttribute('data-solutions-card');
      const section = wrapper.querySelector(`[data-solutions-content="${id}"]`) || document.querySelector(`[data-solutions-content="${id}"]`);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (mode === 'autoplay') pauseAutoplay();
    }, { passive: true });

    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        c.click();
      }
    });
  });

  // hub control: clicking the hub toggles a forward-only "play" mode
  // optional: set wrapper data-hub-interval="<ms>" to change step interval (default 3500)
  const hub = wrapper.querySelector('[data-solutions-hub]') || wrapper.querySelector('.solution-cards-circle-center');
  if (hub) {
    let hubPlaying = false;
    let hubTimer = null;
    const hubInterval = parseInt(wrapper.dataset.hubInterval, 10) || 3500;

    const hubStep = () => {
      const next = (currentIndex + 1) % cards.length;
      openCard(cards[next]);
      animateSvgScale(cards[next]);
    };

    const startHub = () => {
      if (hubPlaying) return;
      hubPlaying = true;
      hub.classList.add('is-playing');
      // immediate first step then schedule repeating forward steps
      hubStep();
      hubTimer = setInterval(hubStep, hubInterval);
    };

    const stopHub = () => {
      hubPlaying = false;
      hub.classList.remove('is-playing');
      if (hubTimer) {
        clearInterval(hubTimer);
        hubTimer = null;
      }
    };

    hub.addEventListener('click', (e) => {
      e.preventDefault();
      // toggle play/stop
      if (hubPlaying) stopHub(); else startHub();
      if (mode === 'autoplay') pauseAutoplay();
    }, { passive: true });

    hub.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hub.click();
      }
    });

    // stop hub playback if user interacts directly with any card
    cards.forEach(c => {
      c.addEventListener('click', () => { if (hubPlaying) stopHub(); }, { passive: true });
    });
  }

  if (mode === 'scroll' || mode === 'svg') {
    console.log('[solutions] scroll observer enabled for mode:', mode);
    let sections = [...wrapper.querySelectorAll('[data-solutions-content]')];
    console.debug('[solutions] local sections found:', sections.length);
    // fallback to global search if markup was moved by Webflow or placed elsewhere
    if (!sections.length) {
      console.debug('[solutions] falling back to document-level selector');
      sections = [...document.querySelectorAll('[data-solutions-content]')];
    }
    if (!sections.length) return console.log('[solutions] no sections found');

    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
                             .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.getAttribute('data-solutions-content');
      const match = cards.find(c => c.getAttribute('data-solutions-card') === id);
      if (match) openCard(match);
    }, { rootMargin: '-30% 0px -60% 0px', threshold: [0,.25,.5,.75,1] });

    sections.forEach(s => io.observe(s));
    openCard(cards[0]);

  } else if (mode === 'autoplay') {
    console.log('[solutions] autoplay mode');
    // use currentIndex so clicks/hub stay in sync
    (function next(){
      if (!userPaused) {
        openCard(cards[currentIndex]);
        currentIndex = (currentIndex + 1) % cards.length;
      }
      setTimeout(next, 5000);
    })();
  } else {
    console.log('[solutions] unknown mode:', mode);
  }

  // If wrapper is in svg mode, ensure an initial card is activated now that helpers exist
  if (mode === 'svg') {
    console.log('[solutions] svg mode');
    openCard(cards[0]);
  }
}