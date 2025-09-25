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

    // --- new: helper that inspects all toggles and ensures lockCount matches open state
    const syncLocksFromToggles = () => {
      const openCount = toggles.reduce((acc, el) => {
        const aria = el.getAttribute && el.getAttribute('aria-expanded');
        const fallback = el.getAttribute && el.getAttribute('data-scroll-open');
        return acc + ((aria === 'true' || fallback === 'true') ? 1 : 0);
      }, 0);

      // if there are more open toggles than locks, lock more
      while (lockCount < openCount) lockScroll();
      // if there are fewer open toggles than locks, unlock until balanced
      while (lockCount > openCount) unlockScroll();
    };

    const handleState = (el) => {
      const expanded = (el && el.getAttribute && el.getAttribute('aria-expanded')) === 'true';
      if (expanded) lockScroll(); else unlockScroll();
    };

    const mo = new MutationObserver((mutations) => {
      // run a simple sync after mutations (fast)
      syncLocksFromToggles();
    });

    toggles.forEach((el) => {
      try { mo.observe(el, { attributes: true }); } catch (e) { /* noop */ }

      el.addEventListener('click', () => {
        // short delay so Webflow or other handlers can update aria-expanded first
        setTimeout(syncLocksFromToggles, 40);
      }, { passive: true });
    });

    // fallback: if something else closes overlays (click outside etc.), ensure we sync
    document.addEventListener('click', () => setTimeout(syncLocksFromToggles, 60), { passive: true });

    // ESC should close overlays and clear locks
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggles.forEach((el) => {
          if (el.hasAttribute && el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', 'false');
          if (el.hasAttribute && el.hasAttribute('data-scroll-open')) el.setAttribute('data-scroll-open', 'false');
        });
        // clear all locks immediately
        while (lockCount > 0) unlockScroll();
      }
    });
    // initial sync
    syncLocksFromToggles();
  }
}
