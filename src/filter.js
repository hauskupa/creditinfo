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

  // Read a card's location (attribute → heading → whole card text)
  const getLocation = (card) => {
    const el = card.querySelector("[data-location]") || card.querySelector(".job-card [data-location]");
    const byAttr = el?.getAttribute("data-location");
    if (byAttr) return norm(byAttr);

    const byHeading = card.querySelector(".job-card-pre-heading")?.textContent;
    if (byHeading && byHeading.trim()) return norm(byHeading);

    const node = card.matches(".job-card") ? card : (card.querySelector(".job-card") || card);
    return norm(node?.textContent || "");
  };

  // Cards within a scope; exclude anything inside the dropdown
  const getCards = (scope) => {
    const notInDropdown = (el) => !el.closest("[data-filter-dropdown]");

    let cards = Array.from(scope.querySelectorAll("[data-card]")).filter(notInDropdown);
    if (cards.length) return cards;

    cards = Array.from(scope.querySelectorAll(".job-card"))
      .map((c) => c.closest("[role='listitem'], [data-card]") || c)
      .filter(notInDropdown);
    if (cards.length) return cards;

    cards = Array.from(scope.querySelectorAll("[role='listitem']")).filter(notInDropdown);
    return cards;
  };

  // Apply filter inside a given scope
  const applyFilterInScope = (scope, value) => {
    const q = norm(value);
    const reset = !q || q === "*";
    const cards = getCards(scope);
    let shown = 0;

    cards.forEach((card) => {
      const loc = getLocation(card);
      const match = reset || loc === q || loc.includes(q);
      (match ? showEl : hideEl)(card);
      if (match) shown++;
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

  // Update dropdown label text (keep chevron/icon). Do nothing if no label.
  const setDropdownLabel = (dd, value, optionEl) => {
    const toggle = dd.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const labelEl = toggle?.firstElementChild || toggle || null;
    if (!labelEl) return; // don't touch the DOM if no proper label
    const nice =
      norm(value) === "*"
        ? "All regions"
        : optionEl?.textContent?.trim() || value;
    if (labelEl.tagName === "INPUT") labelEl.value = nice;
    else labelEl.textContent = nice;
  };

  // Firm close for Webflow dropdown
  const closeDropdown = (dd) => {
    const toggle = dd.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const menu = dd.querySelector("[data-filter-menu]");
    dd.classList.remove("w--open");
    menu?.style?.removeProperty("display");
    requestAnimationFrame(() => {
      toggle?.click?.();
      setTimeout(() => {
        dd.classList.remove("w--open");
        menu?.style?.removeProperty("display");
      }, 20);
    });
  };

  // Track attached dropdowns so we don’t bind twice
  const attached = new WeakSet();

  // Attach one dropdown + its scope
  const attachDropdown = (dd) => {
    if (attached.has(dd)) return;

    // scope = closest explicit wrapper, else the dropdown’s parent section
    const scope =
      dd.closest("[data-filter-scope]") ||
      dd.closest("section, main, .w-dyn-list, .w-dyn-items, .page-wrapper") ||
      dd.parentElement;

    // initialise selection
    const initial = dd.dataset.selected || "*";
    dd.dataset.selected = initial;
    setDropdownLabel(dd, initial);
    applyFilterInScope(scope, initial);

    attached.add(dd);
  };

  // Init: only attach if dropdowns exist; NEVER attach to <body>
  const init = () => {
    const dropdowns = document.querySelectorAll("[data-filter-dropdown]");
    dropdowns.forEach(attachDropdown);
  };

  // Global capturing listener: only react for real dropdown options
  document.addEventListener(
    "click",
    (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt) return;

      const dd =
        opt.closest("[data-filter-dropdown]") || opt.closest(".w-dropdown");
      if (!dd || !attached.has(dd)) return; // only if we actually attached this dropdown

      const scope =
        dd.closest("[data-filter-scope]") ||
        dd.closest("section, main, .w-dyn-list, .w-dyn-items, .page-wrapper") ||
        dd.parentElement;

      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;

      setDropdownLabel(dd, value, opt);
      applyFilterInScope(scope, value);
      closeDropdown(dd);
    },
    true
  );

  document.addEventListener("DOMContentLoaded", init);
  new MutationObserver(init).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(init, 50);
})();
