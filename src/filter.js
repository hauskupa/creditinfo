// filter.js
let observerStarted = false;

const norm = (s) =>
  (s || "")
    .normalize("NFKD")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const hide = (el) => el.style.setProperty("display", "none", "important");
const show = (el) => el.style.removeProperty("display");

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
  if (scope.dataset.filterAttached) return;
  scope.dataset.filterAttached = "true";

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
    dd.classList.remove("w--open");
    menu?.style?.removeProperty("display");
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
  attachScope(scopeEl);        // idempotent
  scopeEl.dataset.selected = value;
  // recompute using the same helpers
  const btn = scopeEl.querySelector(`[data-filter="${CSS.escape(value)}"]`);
  if (btn) btn.setAttribute("data-active", "true");
  applyFilter(scopeEl, value);
}
