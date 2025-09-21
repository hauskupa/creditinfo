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

  // Read a card's location (prefer attribute, fall back to heading/text)
  const getLocation = (card) => {
    const el = card.querySelector("[data-location]");
    const byAttr = el?.getAttribute("data-location");
    if (byAttr) return norm(byAttr);
    const byText =
      el?.textContent ||
      card.querySelector(".job-card-pre-heading")?.textContent;
    // FINAL fallback: whole card text (covers odd markups)
    return norm(byText || card.textContent || "");
  };

  // Find cards within scope; exclude anything inside the dropdown/menu
  const getCards = (scope) => {
    const notInDropdown = (el) => !el.closest("[data-filter-dropdown]");
    let cards = Array.from(scope.querySelectorAll("[data-card]")).filter(
      notInDropdown
    );
    if (cards.length) return cards;

    cards = Array.from(scope.querySelectorAll("[role='listitem']")).filter(
      notInDropdown
    );
    if (cards.length) return cards;

    // Global fallback (still exclude dropdown)
    return Array.from(
      document.querySelectorAll("[data-card], [role='listitem']")
    ).filter(notInDropdown);
  };

  // Apply filter inside a given scope
  const applyFilterInScope = (scope, value) => {
    const q = norm(value);
    const reset = !q || q === "*";
    const cards = getCards(scope);
    let shown = 0;

    cards.forEach((c) => {
      const loc = getLocation(c);
      const match = reset || loc === q || loc.includes(q); // forgiving match
      if (match) {
        showEl(c);
        shown++;
      } else {
        hideEl(c);
      }
    });

    const empty =
      scope.querySelector("[data-filter-empty]") ||
      document.querySelector("[data-filter-empty]");
    if (empty) empty.style.display = shown === 0 ? "" : "none";

    const sample = cards.slice(0, 5).map((c) => getLocation(c));
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

  // Update dropdown label text (keep chevron/icon)
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

  // **Firm** close for Webflow dropdown
  const closeDropdown = (dd) => {
    const toggle =
      dd.querySelector(".w-dropdown-toggle,[data-filter-toggle]") || dd;
    const menu = dd.querySelector("[data-filter-menu]");

    // Force close immediately
    dd.classList.remove("w--open");
    menu?.style?.removeProperty("display");

    // Nudge Webflow’s internal state (ARIA etc.)
    // Do it next tick so we don't fight their handlers.
    requestAnimationFrame(() => {
      toggle?.click?.();
      setTimeout(() => {
        // If some style/class stuck around, clear it again
        dd.classList.remove("w--open");
        menu?.style?.removeProperty("display");
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

      // Find the dropdown owning this option
      const dd =
        opt.closest("[data-filter-dropdown]") || opt.closest(".w-dropdown");
      if (!dd) return;

      // Nearest scope; fallback to body
      const scope =
        dd.closest("[data-filter-scope]") ||
        opt.closest("[data-filter-scope]") ||
        document.body;

      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;

      setDropdownLabel(dd, value, opt);
      applyFilterInScope(scope, value);
      closeDropdown(dd); // <- firm close
    },
    true // capture phase
  );

  document.addEventListener("DOMContentLoaded", initScopes);
  new MutationObserver(initScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(initScopes, 50);
})();
