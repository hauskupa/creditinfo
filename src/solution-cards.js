// solution-cards.js
export function initSolutionCards() {
  console.log('[solutions] init');

  const wrapper = document.querySelector('[data-solutions]');
  if (!wrapper) return console.log('[solutions] no wrapper');

  const mode  = wrapper.getAttribute('data-solutions'); // "scroll" | "autoplay"
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
      const clip = c.querySelector('.card-text-clip');
      if (!clip) return;
      clip.style.maxHeight = on
        ? (clip.firstElementChild?.scrollHeight || 0) + 'px'
        : '0px';
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

  if (mode === 'scroll') {
    console.log('[solutions] scroll mode');
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
}