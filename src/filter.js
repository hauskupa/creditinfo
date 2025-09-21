// src/filter.js
(() => {
  console.log("[filter] boot");

  // ---------- helpers ----------
  const norm = (s) =>
    (s || "")
      .normalize("NFKD")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const hideEl = (el) => el.style.setProperty("display", "none", "important");
  const showEl = (el) => el.style.removeProperty("display");

  // Read a card's location (prefer attribute)
const getLocation = (card) => {
  // 1) Prefer explicit hook
  const el = card.querySelector("[data-location]");
  const byAttr = el?.getAttribute("data-location");
  if (byAttr) return norm(byAttr);

  // 2) Fallback to heading element
  const byText =
    el?.textContent || card.querySelector(".job-card-pre-heading")?.textContent;
  if (byText && byText.trim()) return norm(byText);

  // 3) FINAL fallback: use the whole card text (covers markup variances)
  return norm(card.textContent || "");
};


  // Find cards within scope; fallback globally if needed
  const getCards = (scope) => {
    let cards = scope.querySelectorAll("[data-card]");
    if (cards.length) return cards;
    cards = scope.querySelectorAll("[role='listitem']");
    if (cards.length) return cards;
    return document.querySelectorAll("[data-card], [role='listitem']");
  };

  // Apply filter inside a given scope
  const applyFilterInScope = (scope, value) => {
    const q = norm(value);
    const reset = !q || q === "*";
    const cards = getCards(scope);
    let shown = 0;

    cards.forEach((c) => {
      const loc = getLocation(c);
      const match = reset || loc === q || loc.includes(q); // ← forgiving match
      if (match) {
        showEl(c);
        shown++;
      } else {
        hideEl(c);
      }
    });

    // Optional empty-state inside scope
    const empty =
      scope.querySelector("[data-filter-empty]") ||
      document.querySelector("[data-filter-empty]");
    if (empty) empty.style.display = shown === 0 ? "" : "none";

    // small debug: show first few normalized card locs
    const sample = Array.from(cards).slice(0, 5).map((c) => getLocation(c));
    console.log(
      "[filter] value:",
      reset ? "*" : value,
      "→",
      q,
      "shown:",
      shown,
      "/",
      cards.length,
      "sample:",
      sample
    );
  };

  // Update dropdown label text (keep chevron icon)
  const setDropdownLabel = (dd, value, optionEl) => {
    const toggle =
      dd.querySelector(".w-dropdown-toggle,[data-filter-toggle]") || dd;
    const labelEl = toggle.firstElementChild || toggle;
    const nice =
      norm(value) === "*"
        ? "All regions"
        : optionEl?.textContent?.trim() || value;
    if (labelEl.tagName === "INPUT") labelEl.value = nice;
    else labelEl.textContent = nice;
  };

  // Close Webflow dropdown politely
  const closeDropdown = (dd) => {
    const toggle =
      dd.querySelector(".w-dropdown-toggle,[data-filter-toggle]") || dd;
    const menu = dd.querySelector("[data-filter-menu]");
    requestAnimationFrame(() => {
      if (dd.classList.contains("w--open")) toggle?.click();
      setTimeout(() => {
        if (dd.classList.contains("w--open")) {
          dd.classList.remove("w--open");
          menu?.style?.removeProperty("display");
        }
      }, 20);
    });
  };

  // Init scopes so "*" shows all on load
  const initScopes = () => {
    const scopes = document.querySelectorAll("[data-filter-scope]");
    if (scopes.length) {
      scopes.forEach((scope) => {
        if (scope.dataset.filterAttached) return;
        const dd = scope.querySelector("[data-filter-dropdown]") || scope;
        dd.dataset.selected = dd.dataset.selected || "*";
        setDropdownLabel(dd, dd.dataset.selected);
        applyFilterInScope(scope, dd.dataset.selected);
        scope.dataset.filterAttached = "true";
      });
    } else {
      if (!document.body.dataset.filterAttached) {
        const dd =
          document.body.querySelector("[data-filter-dropdown]") ||
          document.body;
        dd.dataset.selected = dd.dataset.selected || "*";
        setDropdownLabel(dd, dd.dataset.selected);
        applyFilterInScope(document.body, dd.dataset.selected);
        document.body.dataset.filterAttached = "true";
      }
    }
  };

  // Global capturing listener so Webflow can't swallow the click
  document.addEventListener(
    "click",
    (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt) return;

      const dd =
        opt.closest("[data-filter-dropdown]") || opt.closest(".w-dropdown");
      if (!dd) return;

      const scope =
        dd.closest("[data-filter-scope]") ||
        opt.closest("[data-filter-scope]") ||
        document.body;

      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;

      setDropdownLabel(dd, value, opt);
      applyFilterInScope(scope, value);
      closeDropdown(dd);
    },
    true
  );

  document.addEventListener("DOMContentLoaded", initScopes);
  new MutationObserver(initScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(initScopes, 50);
})();
