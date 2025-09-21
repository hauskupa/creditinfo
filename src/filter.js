(() => {
  console.log("[filter] boot");
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
    const el = card.querySelector("[data-location]");
    if (!el) return "";
    return norm(el.getAttribute("data-location") || el.textContent || "");
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
      const nice =
        norm(value) === "*"
          ? "All"
          : opt?.textContent?.trim() || value;
      if (labelEl instanceof HTMLInputElement) labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    const closeDropdown = () => {
      if (!dd) return;
      dd.classList.remove("w--open");
      menu?.style?.removeProperty("display");
    };

    scope.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt) return;

      const value = (opt.getAttribute("data-filter") || "*").trim();
      scope.dataset.selected = value;

      applyFilter(scope, value);

      if (dd) {
        setLabel(value, opt);
        closeDropdown();
      } else {
        // highlight active button
        scope.querySelectorAll("[data-filter]").forEach((btn) =>
          btn.classList.toggle("is-active", btn === opt)
        );
      }
    });

    // Initial state
    const initial = scope.dataset.selected || "*";
    scope.dataset.selected = initial;
    applyFilter(scope, initial);
    if (dd) setLabel(initial);
  }

  function initAllScopes() {
    document.querySelectorAll("[data-filter-scope]").forEach(attachScope);
  }

  document.addEventListener("DOMContentLoaded", initAllScopes);
  new MutationObserver(initAllScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
