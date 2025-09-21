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

  // Read location from a card
  const getLocation = (card) => {
    const el = card.querySelector("[data-location]");
    const byAttr = el?.getAttribute("data-location");
    if (byAttr) return norm(byAttr);
    const byText =
      el?.textContent ||
      card.querySelector(".job-card-pre-heading")?.textContent;
    return norm(byText);
  };

  // Find cards for a given scope; if none inside, fall back globally
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
      const match = reset || loc === q;
      if (match) {
        showEl(c);
        shown++;
      } else {
        hideEl(c);
      }
    });

    // Optional empty-state
    const empty =
      scope.querySelector("[data-filter-empty]") ||
      document.querySelector("[data-filter-empty]");
    if (empty) empty.style.display = shown === 0 ? "" : "none";

    console.log(
      "[filter] value:",
      reset ? "*" : value,
      "shown:",
      shown,
      "/",
      cards.length
    );
  };

  // Update visible label in the dropdown (keeps icon)
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

  // Initial attach for existing scopes (to run default "*")
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
      // No explicit scope: treat body as scope
      if (!document.body.dataset.filterAttached) {
        const dd =
          document.body.querySelector("[data-filter-dropdown]") || document.body;
        dd.dataset.selected = dd.dataset.selected || "*";
        setDropdownLabel(dd, dd.dataset.selected);
        applyFilterInScope(document.body, dd.dataset.selected);
        document.body.dataset.filterAttached = "true";
      }
    }
  };

  // GLOBAL, CAPTURING listener — catches clicks even if Webflow stops bubbling
  document.addEventListener(
    "click",
    (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt) return;

      // Find the dropdown that owns this option
      const dd =
        opt.closest("[data-filter-dropdown]") || opt.closest(".w-dropdown");
      if (!dd) return;

      // Find the scope to filter (nearest wrapper; else body)
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
    true // <-- capture phase
  );

  // Run once on load, and again after CMS mutations
  document.addEventListener("DOMContentLoaded", initScopes);
  new MutationObserver(initScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(initScopes, 50);
})();
