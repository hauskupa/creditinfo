// src/filter.js
(function () {
  const dd = document.querySelector('[data-filter-dropdown]');
  if (!dd) return; // quietly bail on pages without the filter

  const toggle = dd.querySelector('.w-dropdown-toggle,[data-filter-toggle]');
  const menu   = dd.querySelector('[data-filter-menu]');

  function setDisplay(value, optionEl) {
    const nice = value === '*' ? 'All regions'
               : (optionEl?.textContent?.trim() || value);
    if (!toggle) return;
    if (toggle.tagName === 'INPUT') toggle.value = nice;
    else toggle.textContent = nice;
  }

  function applyFilter(value) {
    const reset = value === '*' || !value;
    document.querySelectorAll('[data-card]').forEach(card => {
      const locEl = card.querySelector('[data-location]');
      const loc = (locEl ? locEl.textContent : '').trim().toLowerCase();
      card.style.display = reset || loc === value.toLowerCase() ? '' : 'none';
    });
  }

  // Handle option clicks (delegated so CMS rebuilds don't break it)
  document.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-filter]');
    if (!opt || !dd.contains(opt)) return;

    const value = opt.getAttribute('data-filter').trim();
    dd.dataset.selected = value;
    setDisplay(value, opt);
    applyFilter(value);

    // Close Webflow dropdown safely
    window.requestAnimationFrame(() => {
      if (dd.classList.contains('w--open')) toggle?.click();
      setTimeout(() => {
        if (dd.classList.contains('w--open')) {
          dd.classList.remove('w--open');
          menu?.style?.removeProperty('display');
        }
      }, 20);
    });
  });

  // Init
  const initial = dd.dataset.selected || '*';
  dd.dataset.selected = initial;
  setDisplay(initial);
  applyFilter(initial);
})();
