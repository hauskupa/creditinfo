// filter.js
let observerStarted = false;

const norm = (s) =>
  (s || "")
    .normalize("NFKD")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// animated hide/show helpers (smooth fade + height collapse)
const ANIM_MS = 260;

const hide = (el) => {
  // cancel any running animation
  if (el.__filterAnim) { clearTimeout(el.__filterAnim); el.__filterAnim = null; }
  // ensure element is visible before collapsing so scrollHeight is correct
  el.style.removeProperty("display");
  const startH = el.scrollHeight || 0;
  el.style.overflow = "hidden";
  el.style.maxHeight = startH + "px";
  el.style.opacity = "1";
  el.style.transition = `opacity ${ANIM_MS - 60}ms ease, max-height ${ANIM_MS}ms ease`;
  // trigger collapse on next frame
  requestAnimationFrame(() => {
    el.style.maxHeight = "0px";
    el.style.opacity = "0";
  });
  el.__filterAnim = setTimeout(() => {
    el.style.setProperty("display", "none", "important");
    el.style.removeProperty("max-height");
    el.style.removeProperty("opacity");
    el.style.removeProperty("overflow");
    el.style.removeProperty("transition");
    el.__filterAnim = null;
  }, ANIM_MS);
};

const show = (el) => {
  if (el.__filterAnim) { clearTimeout(el.__filterAnim); el.__filterAnim = null; }
  // remove display:none (including important) so element can measure
  el.style.removeProperty("display");
  // if computed display still none (rare), make block temporarily
  if (getComputedStyle(el).display === "none") el.style.display = "block";
  const targetH = el.scrollHeight || 0;
  el.style.overflow = "hidden";
  el.style.maxHeight = "0px";
  el.style.opacity = "0";
  el.style.transition = `opacity ${ANIM_MS - 60}ms ease, max-height ${ANIM_MS}ms ease`;
  // expand on next frame
  requestAnimationFrame(() => {
    el.style.maxHeight = targetH + "px";
    el.style.opacity = "1";
  });
  el.__filterAnim = setTimeout(() => {
    el.style.removeProperty("max-height");
    el.style.removeProperty("overflow");
    el.style.removeProperty("transition");
    el.__filterAnim = null;
  }, ANIM_MS);
};

function getCards(scope) {
  return [...scope.querySelectorAll("[data-card]")];
}

function getLocation(card) {
  // cache normalized location on first read
  if (!card.dataset.locCache) {
    const el = card.querySelector("[data-location]");
    const raw = el?.getAttribute("data-location") || el?.textContent || "";
    card.dataset.locCache = norm(raw);
  }
  return card.dataset.locCache;
}

function applyFilter(scope, value) {
  const q = norm(value);
  const reset = !q || q === "*";
  const cards = getCards(scope);
  let shown = 0;

  cards.forEach((c) => {
    const match = reset || getLocation(c) === q || getLocation(c).includes(q);
    (match ? show : hide)(c);
    if (match) shown++;
  });

  console.log("[filter]", q || "*", "shown:", shown, "/", cards.length);
}

function attachScope(scope) {
  // prefer an internal JS marker so exported HTML (CMS / exported files) won't block initialization
  if (scope.__filterAttached) return;
  scope.__filterAttached = true;
  // remove any accidental pre-set attribute left in markup to keep markup clean
  if (scope.hasAttribute && scope.hasAttribute('data-filter-attached')) {
    scope.removeAttribute('data-filter-attached');
  }

  const dd = scope.querySelector("[data-filter-dropdown]");
  const toggle = dd?.querySelector("[data-filter-toggle], .w-dropdown-toggle");
  const menu = dd?.querySelector("[data-filter-menu], .w-dropdown-list");

  const setLabel = (value, opt) => {
    if (!toggle) return;
    const labelEl = toggle.firstElementChild || toggle;
    const nice = norm(value) === "*" ? "All" : (opt?.textContent?.trim() || value);
    if (labelEl instanceof HTMLInputElement) labelEl.value = nice;
    else labelEl.textContent = nice;
  };

  const closeDropdown = () => {
    if (!dd) return;
    // remove open class and ensure menu is hidden
    dd.classList.remove("w--open");
    menu?.style?.removeProperty("display");

    // if there's a toggle, make sure its aria state and focus are cleared
    if (toggle) {
      try {
        toggle.setAttribute("aria-expanded", "false");
      } catch (e) { /* ignore if not an element with attributes */ }
      if (toggle instanceof HTMLElement) toggle.blur();

      // Some dropdown implementations (e.g. Webflow) keep internal state.
      // If the wrapper still reports open on next frame, trigger a toggle click to force-close.
      requestAnimationFrame(() => {
        if (dd.classList.contains("w--open")) {
          try { toggle.click(); } catch (e) { /* best-effort */ }
        }
      });
    }
  };

  const updateActive = (value) => {
    const normalized = (value || "*").trim();
    scope.querySelectorAll("[data-filter]").forEach((btn) => {
      const btnVal = (btn.getAttribute("data-filter") || "*").trim();
      const active = btnVal === normalized;
      if (active) btn.setAttribute("data-active", "true");
      else btn.removeAttribute("data-active");
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  // delegate clicks inside this scope
  scope.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-filter]");
    if (!opt || !scope.contains(opt)) return;

    const value = (opt.getAttribute("data-filter") || "*").trim();
    scope.dataset.selected = value;

    applyFilter(scope, value);
    updateActive(value);

    if (dd) {
      setLabel(value, opt);
      closeDropdown();
    }
  }, { passive: true });

  // --- new: also bind direct listeners to any [data-filter] items that belong to this dropdown/menu
  // This covers Webflow behavior that moves the menu out of the original wrapper.
  const bindMenuItems = () => {
    if (!dd) return;
    // collect candidates:
    const candidates = new Set([
      ...scope.querySelectorAll("[data-filter]"),
      ...(menu ? [...menu.querySelectorAll("[data-filter]")] : []),
      // and any data-filter whose closest dropdown wrapper is the same dd (even if moved)
      ...[...document.querySelectorAll("[data-filter]")].filter((el) => {
        const parent = el.closest("[data-filter-dropdown]");
        return parent && parent.isSameNode(dd);
      }),
    ]);

    candidates.forEach((el) => {
      if (el.__filterBound) return;
      el.__filterBound = true;
      // use capture so this runs before other handlers (Webflow might stop propagation)
      el.addEventListener("click", (ev) => {
        // prefer the element itself, but fallback to closest
        const target = ev.target.closest("[data-filter]") || el;
        if (!target) return;
        const value = (target.getAttribute("data-filter") || "*").trim();
        scope.dataset.selected = value;
        applyFilter(scope, value);
        updateActive(value);
        if (dd) {
          setLabel(value, target);
          // close reliably
          closeDropdown();
        }
      }, { capture: true, passive: true });
    });
  };

  // bind now and also try rebinding after a short delay (covers Webflow move)
  bindMenuItems();
  // some Webflow setups move elements after initial load — re-run once
  setTimeout(bindMenuItems, 300);
  // Initial state
  const initial = scope.dataset.selected || "*";
  scope.dataset.selected = initial;
  applyFilter(scope, initial);
  updateActive(initial);
  if (dd) setLabel(initial);
}

function initAllScopes() {
  document.querySelectorAll("[data-filter-scope]").forEach(attachScope);
}

/**
 * Initialize the filter system.
 * @param {{ observe?: boolean }} [opts]
 */
export function initFilter(opts = {}) {
  const { observe = true } = opts;
  console.log("[filter] init");
  initAllScopes();

  if (observe && !observerStarted) {
    observerStarted = true;
    new MutationObserver(initAllScopes).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}

// Optional: programmatic API if you ever need it elsewhere
export function setFilter(scopeEl, value) {
  if (!scopeEl) return;
  attachScope(scopeEl); // idempotent
  scopeEl.dataset.selected = value;
  // sync button active attributes
  scopeEl.querySelectorAll("[data-filter]").forEach((btn) => {
    const btnVal = (btn.getAttribute("data-filter") || "*").trim();
    const active = btnVal === value;
    if (active) btn.setAttribute("data-active", "true");
    else btn.removeAttribute("data-active");
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  applyFilter(scopeEl, value);
}
