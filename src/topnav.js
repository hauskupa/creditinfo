// Top nav active state using data-section prefix
export default function initTopnav(){
  console.debug('[topnav] initTopnav'); // debug marker — ensures file ran

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
  const toggles = [...document.querySelectorAll('[data-scroll-toggle], .nav_button, .w-dropdown-toggle')];
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
      console.debug('[topnav] lockScroll', lockCount);
    };

    const unlockScroll = () => {
      lockCount = Math.max(0, lockCount - 1);
      console.debug('[topnav] unlockScroll', lockCount);
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
      const expanded = (el && el.getAttribute && el.getAttribute('aria-expanded')) === 'true';
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
      try { mo.observe(el, { attributes: true }); } catch (e) { /* noop */ }

      // fallback: after a click, Webflow may update aria-expanded; check shortly after click
      el.addEventListener('click', () => {
        setTimeout(() => {
          // prefer aria-expanded if present; otherwise toggled data-scroll-open fallback
          if (el.hasAttribute('aria-expanded')) {
            handleState(el);
          } else {
            // fallback toggle behavior
            const isOpen = el.getAttribute('data-scroll-open') === 'true';
            el.setAttribute('data-scroll-open', isOpen ? 'false' : 'true');
            if (isOpen) unlockScroll(); else lockScroll();
          }
        }, 40); // delay allows Webflow handlers to run first
      }, { passive: true });

      // initial state check
      if (el.getAttribute('aria-expanded') === 'true') handleState(el);
      if (el.getAttribute('data-scroll-open') === 'true') lockScroll();
    });
  }
}
