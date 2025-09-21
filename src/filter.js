// src/filter.js
(() => {
  function attachScope(scope) {
    const dd = scope.querySelector("[data-filter-dropdown]");
    const toggle = dd?.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const menu = dd?.querySelector("[data-filter-menu]");
    if (!dd || !toggle || !menu) return;

    // your markup: <div class="w-dropdown-toggle"><div>All regions</div><div class="icon">...</div></div>
    const labelEl =
      toggle.querySelector(":scope > div:first-child") || toggle;

    const setDisplay = (value, optionEl) => {
      const nice =
        value === "*" ? "All regions" : (optionEl?.textContent?.trim() || value);
      if (labelEl.tagName === "INPUT") labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    const getCards = () => {
      // Prefer explicit hooks
      let cards = scope.querySelectorAll("[data-card]");
      if (cards.length) return cards;
      // Fallback to Webflow list items
      return scope.querySelectorAll('[role="listitem"]');
    };

    const getLocation = (card) => {
      // Prefer explicit hook
      const byAttr = card.querySelector("[data-location]")?.textContent;
      if (byAttr) return byAttr.trim().toLowerCase();
      // Fallback to your existing heading
      const byHeading = card.querySelector(".job-card-pre-heading")?.textContent;
      return (byHeading || "").trim().toLowerCase();
    };

    const applyFilter = (value) => {
      const reset = !value || value.toLowerCase() === "*";
      const cards = getCards();
      let shown = 0;
      cards.forEach((c) => {
        const loc = getLocation(c);
        const match = reset || loc === value.toLowerCase();
        c.style.display = match ? "" : "none";
        if (match) shown++;
      });
      // quick breadcrumb so you can see it’s running
      console.log("[filter] value:", value, "shown:", shown, "/", cards.length);
    };

    // Handle option clicks (delegated so CMS rebuilds are fine)
    document.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !scope.contains(opt)) return;

      const value = (opt.getAttribute("data-filter") || "*").trim();
      dd.dataset.selected = value;
      setDisplay(value, opt);
      applyFilter(value);

      // Close the Webflow dropdown politely
      requestAnimationFrame(() => {
        if (dd.classList.contains("w--open")) toggle?.click();
        setTimeout(() => {
          if (dd.classList.contains("w--open")) {
            dd.classList.remove("w--open");
            menu?.style?.removeProperty("display");
          }
        }, 20);
      });
    });

    // Initial state
    const initial = dd.dataset.selected || "*";
    dd.dataset.selected = initial;
    setDisplay(initial);
    applyFilter(initial);

    scope.dataset.filterAttached = "true";
  }

  function initAllScopes() {
    const scopes = document.querySelectorAll("[data-filter-scope]");
    if (scopes.length) {
      scopes.forEach((s) => {
        if (!s.dataset.filterAttached) attachScope(s);
      });
    } else {
      // fallback: attach to whole page if no wrapper present
      if (!document.body.dataset.filterAttached) attachScope(document.body);
    }
  }

  document.addEventListener("DOMContentLoaded", initAllScopes);
  new MutationObserver(initAllScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(initAllScopes, 50);
})();
