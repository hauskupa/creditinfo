// solution-cards.js
export function initSolutionCards() {
  console.log('[solutions] init');

  const wrapper = document.querySelector('[data-solutions]');
  if (!wrapper) return console.log('[solutions] no wrapper');

  const mode  = wrapper.getAttribute('data-solutions'); // "scroll" | "autoplay" | "svg"
  const cards = [...wrapper.querySelectorAll('[data-solutions-card]')];
  if (!cards.length) return console.log('[solutions] no cards');

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
      c.classList.toggle('is-active', on);
      c.style.opacity = on ? '1' : '0.5';
      // scale the whole card (parent of svg)
      c.style.transform = on ? 'scale(1.04)' : 'scale(1)';
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
      if (svgMode || perCardSvg) {
        if (c === card) {
          // set svg fill to brand color for active card
          setSvgFill(c, 'var(--brand-red)');
        } else {
          setSvgFill(c, null); // restore original
        }
      } else {
        // ensure any previous inline changes are restored
        setSvgFill(c, null);
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
    // ensure smooth card scaling
    c.style.transition = c.style.transition ? c.style.transition + ', transform 260ms ease' : 'transform 260ms ease';
    c.style.transformOrigin = '50% 50%';
    c.style.willChange = 'transform';

    c.addEventListener('click', () => {
      openCard(c);
      if (mode === 'scroll') {
        const id = c.getAttribute('data-solutions-card');
        const section = wrapper.querySelector(`[data-solutions-content="${id}"]`) || document.querySelector(`[data-solutions-content="${id}"]`);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (mode === 'autoplay') pauseAutoplay();
    }, { passive: true });

    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        c.click();
      }
    });
  });

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
    let i = 0;
    (function next(){
      if (!userPaused) {
        openCard(cards[i]);
        i = (i + 1) % cards.length;
      }
      // keep ticking; when userPaused is true we still poll until it clears
      setTimeout(next, 5000);
    })();
  } else {
    console.log('[solutions] unknown mode:', mode);
  }

  // --- SVG helpers -------------------------------------------------------
  // detect inline svg in card
  const isSvgCard = (card) => !!card.querySelector('svg');

  // Cache original fills for elements inside an svg (first time only)
  const cacheOriginalFills = (svg) => {
    if (!svg || svg.__fillsCached) return;
    const elems = svg.querySelectorAll('path, circle, rect, polygon, g, ellipse, polyline');
    elems.forEach(el => {
      // store current explicit fill or computed fill so we can restore later
      if (el.hasAttribute('fill')) {
        el.dataset.__origFill = el.getAttribute('fill') || '';
      } else {
        try {
          const comp = getComputedStyle(el).fill || '';
          el.dataset.__origFill = comp || '';
        } catch (e) {
          el.dataset.__origFill = '';
        }
      }
    });
    svg.__fillsCached = true;
  };

  // set fill to a CSS value (like 'var(--brand-red)') or null to restore original
  const setSvgFill = (card, cssFillOrNull) => {
    const svg = card.querySelector('svg');
    if (!svg) return;
    cacheOriginalFills(svg);
    // smooth fill transition on the svg root so fills change nicely
    svg.style.transition = 'fill 260ms ease, color 260ms ease';
    const elems = svg.querySelectorAll('path, circle, rect, polygon, g, ellipse, polyline');
    elems.forEach(el => {
      if (cssFillOrNull) {
        // apply CSS variable fill; use style so it overrides attributes
        el.style.fill = cssFillOrNull;
      } else {
        // restore original explicit fill if existed, otherwise remove style
        const orig = el.dataset.__origFill;
        if (orig != null && orig !== '') {
          el.style.fill = orig;
        } else {
          el.style.removeProperty('fill');
        }
      }
    });
  };

  // small scale pulse animation for svg (uses WAAPI if available)
  const animateSvgScale = (card) => {
    const svg = card.querySelector('svg');
    if (!svg) return;
    try {
      if (svg.animate) {
        svg.animate([
          { transform: 'scale(1)', offset: 0 },
          { transform: 'scale(1.5)', offset: 0.5 },
          { transform: 'scale(1)', offset: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)' });
        return;
      }
    } catch (e) { /* ignore */ }
    // fallback quick css transform
    svg.style.transition = 'transform 220ms ease';
    svg.style.transform = 'scale(1.08)';
    setTimeout(() => { svg.style.transform = 'scale(1)'; }, 220);
  };
  // -----------------------------------------------------------------------

  // If wrapper is in svg mode, ensure an initial card is activated now that helpers exist
  if (mode === 'svg') {
    console.log('[solutions] svg mode');
    openCard(cards[0]);
  }
}