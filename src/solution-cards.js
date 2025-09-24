(() => {
  var Webflow = Webflow || [];
  Webflow.push(function () {
    const wrapper = document.querySelector('[data-solutions]');
    if (!wrapper) return;

    const mode = wrapper.getAttribute('data-solutions');
    const cards = [...wrapper.querySelectorAll('[data-solutions-card]')];

    function openCard(card) {
      cards.forEach(c => {
        const isMatch = c === card;
        c.classList.toggle('is-active', isMatch);
        c.style.opacity = isMatch ? '1' : '0.5';

        const clip = c.querySelector('.card-text-clip');
        if (!clip) return;
        if (isMatch) {
          const h = clip.firstElementChild ? clip.firstElementChild.scrollHeight : 0;
          clip.style.maxHeight = h + 'px';
        } else {
          clip.style.maxHeight = '0px';
        }
      });
    }

    if (mode === 'scroll') {
      const sections = [...document.querySelectorAll('[data-solutions-content]')];

      const io = new IntersectionObserver((entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.getAttribute('data-solutions-content');
        const match = cards.find(c => c.getAttribute('data-solutions-card') === id);
        if (match) openCard(match);
      }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      });

      sections.forEach(s => io.observe(s));
      if (sections[0]) openCard(cards[0]);

    } else if (mode === 'autoplay') {
      let i = 0;
      function next() {
        openCard(cards[i]);
        i = (i + 1) % cards.length;
        setTimeout(next, 4000); // 3s per card
      }
      next();
    }
  });
})();
