(() => {
  var Webflow = Webflow || [];
  Webflow.push(function () {
    const wrapper = document.querySelector('[data-solutions]');
    if (!wrapper) return;

    const mode  = wrapper.getAttribute('data-solutions'); // "scroll" or "autoplay"
    const cards = [...wrapper.querySelectorAll('[data-solutions-card]')];

    // normalize clips so max-height animation works
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

    if (mode === 'scroll') {
      const sections = [...document.querySelectorAll('[data-solutions-content]')];
      if (!sections.length || !cards.length) return;

      const io = new IntersectionObserver(entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.getAttribute('data-solutions-content');
        const match = cards.find(c => c.getAttribute('data-solutions-card') === id);
        if (match) openCard(match);
      }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, .25, .5, .75, 1]
      });

      sections.forEach(s => io.observe(s));
      if (cards[0]) openCard(cards[0]);

    } else if (mode === 'autoplay') {
      if (!cards.length) return;
      let i = 0;
      (function next(){
        openCard(cards[i]);
        i = (i + 1) % cards.length;
        setTimeout(next, 4000); // 4s per card
      })();
    }
  });
})();
