(() => {
  // Normalize helper
  const norm = (s) =>
    (s || "")
      .normalize("NFKD")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // Attach filtering behavior to a single dropdown
  function attachFilter(dd) {
    if (dd.dataset.filterAttached) return;
    dd.dataset.filterAttached = "true";

    const toggle = dd.querySelector("[data-filter-toggle], .w-dropdown-toggle");
    const menu   = dd.querySelector("[data-filter-menu], .w-dropdown-list");
    if (!toggle || !menu) return;

    // Use first child <div> inside toggle as the label (like "All regions")
    const labelEl = toggle.firstElementChild || toggle;
    const setLabel = (value, opt) => {
      const nice = norm(value) === "*" ? "All" : (opt?.textContent?.trim() || value);
      if (labelEl instanceof HTMLInputElement) labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    // Cards: always use [data-card], but ignore ones inside dropdown
    const getCards = () =>
      [...document.querySelectorAll("[data-card]")].filter(
        (el) => !el.closest("[data-filter-dropdown]")
      );

    // Read the location/category of a card
    const getLocation = (card) => {
      const el = card.querySelector("[data-location]");
      const byAttr = el?.getAttribute("data-location");
      if (byAttr) return norm(byAttr);
      return norm(el?.textContent || card.textContent || "");
    };

    const hide = (el) => el.style.setProperty("display", "none", "important");
    const show = (el) => el.style.removeProperty("display");

    // Apply filter
    const applyFilter = (value) => {
      const q = norm(value);
      const reset = !q || q === "*";
      const cards = getCards();
      let shown = 0;
      cards.forEach((c) => {
        const loc = getLocation(c);
        const match = reset || loc === q;
        (match ? show : hide)(c);
        if (match) shown++;
      });
      console.log("[filter]", value, "→", shown, "/", cards.length);
    };

    // Close dropdown politely
    const closeDropdown = () => {
      dd.classList.remove("w--open");
      menu.style.removeProperty("display");
    };

    // Handle option clicks
    dd.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !dd.contains(opt)) return;
      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;
      setLabel(value, opt);
      applyFilter(value);
      closeDropdown();
    });

    // Initial filter
    const initial = dd.dataset.selected || "*";
    setLabel(initial);
    applyFilter(initial);

    // If CMS changes the list dynamically
    new MutationObserver(() => {
      applyFilter(dd.dataset.selected || "*");
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // Init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-filter-dropdown]").forEach(attachFilter);
  });
})();
