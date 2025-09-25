// Top nav active state using data-section prefix
export default function initTopnav(){
  const norm = s => String(s||"").toLowerCase().replace(/\/+$/,"");
  const path = norm(location.pathname);

  document.querySelectorAll('[data-mainnav-link]').forEach(a => {
    const href = a.getAttribute('href') || "";
    const section = a.getAttribute('data-section') || href;
    const prefix = norm(section);
    if (!prefix) return;

    const active = prefix === "" || prefix === "/"
      ? (path === "" || path === "/")
      : path.startsWith(prefix);

    if (active) a.setAttribute('data-active','true');
    else a.removeAttribute('data-active');
  });

  // --- added: scroll lock when any [data-scroll-toggle] is opened
  const body = document.body;
  const toggles = [...document.querySelectorAll('[data-scroll-toggle]')];
  if (toggles.length) {
    let lockCount = 0;
    let savedScrollY = 0;

    const lockScroll = () => {
      if (lockCount === 0) {
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        body.setAttribute('data-scroll', 'false');
        body.style.position = 'fixed';
        body.style.left = '0';
        body.style.right = '0';
        body.style.top = `-${savedScrollY}px`;
      }
      lockCount++;
    };

    const unlockScroll = () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        body.setAttribute('data-scroll', 'true');
        body.style.removeProperty('position');
        body.style.removeProperty('left');
        body.style.removeProperty('right');
        body.style.removeProperty('top');
        window.scrollTo(0, savedScrollY);
        savedScrollY = 0;
      }
    };

    const handleState = (el) => {
      const expanded = el.getAttribute('aria-expanded') === 'true';
      if (expanded) lockScroll(); else unlockScroll();
    };

    // Observe aria-expanded on each toggle (works if Webflow or other code toggles it)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'aria-expanded' && m.target) {
          handleState(m.target);
        }
      }
    });

    toggles.forEach((el) => {
      // attach observer
      mo.observe(el, { attributes: true });
      // ensure click toggles aria-expanded if the element itself doesn't manage it
      el.addEventListener('click', (e) => {
        // if aria-expanded is present, let the observed change drive lock/unlock
        if (el.hasAttribute('aria-expanded')) return;
        // toggle attribute manually
        const is = el.getAttribute('data-scroll-open') === 'true';
        el.setAttribute('data-scroll-open', is ? 'false' : 'true');
        if (is) unlockScroll(); else lockScroll();
      }, { passive: true });
      // initial state check
      if (el.getAttribute('aria-expanded') === 'true') handleState(el);
      if (el.getAttribute('data-scroll-open') === 'true') lockScroll();
    });
  }
}
