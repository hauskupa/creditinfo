(() => {
  const norm = (s) =>
    (s || "")
      .normalize("NFKD")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  function attachFilter(dd) {
    if (dd.dataset.filterAttached) return;
    dd.dataset.filterAttached = "true";

    const toggle = dd.querySelector("[data-filter-toggle], .w-dropdown-toggle");
    const menu   = dd.querySelector("[data-filter-menu], .w-dropdown-list");
    if (!toggle || !menu) return;

    const labelEl = toggle.firstElementChild || toggle;
    const setLabel = (value, opt) => {
      const nice = norm(value) === "*" ? "All" : (opt?.textContent?.trim() || value);
      if (labelEl instanceof HTMLInputElement) labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    const getCards = () =>
      [...document.querySelectorAll("[data-card]")].filter(
        (el) => !el.closest("[data-filter-dropdown]")
      );

    const getLocation = (card) => {
      const el = card.querySelector("[data-location]");
      const byAttr = el?.getAttribute("data-location");
      if (byAttr) return norm(byAttr);
      return norm(el?.textContent || card.textContent || "");
    };

    const hide = (el) => el.style.setProperty("display", "none", "important");
    const show = (el) => el.style.removeProperty("display");

    const applyFilter = (value) => {
      const q = norm(value);
      const reset = !q || q === "*";
      const cards = getCards();
      let shown = 0;
      cards.forEach((c) => {
        const loc = getLocation(c);
        const match = reset || loc === q || loc.includes(q);
        (match ? show : hide)(c);
        if (match) shown++;
      });
      console.log("[filter]", value, "→", shown, "/", cards.length);
    };

    const closeDropdown = () => {
      dd.classList.remove("w--open");
      menu.style.removeProperty("display");
    };

    dd.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !dd.contains(opt)) return;
      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;
      setLabel(value, opt);
      applyFilter(value);
      closeDropdown();
    });

    const initial = dd.dataset.selected || "*";
    setLabel(initial);
    applyFilter(initial);

    new MutationObserver(() => {
      applyFilter(dd.dataset.selected || "*");
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-filter-dropdown]").forEach(attachFilter);
  });
})();
