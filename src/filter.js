// src/filter.js
(() => {
  /** Util: small logger so we can see what's wrong on any page */
  const log = (...a) => console.log("[filter]", ...a);
  const warn = (...a) => console.warn("[filter]", ...a);

  /** Attach filter to ONE scope container */
  function attachScope(scope) {
    const dd     = scope.querySelector("[data-filter-dropdown]");
    const toggle = dd?.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const menu   = dd?.querySelector("[data-filter-menu]");

    if (!dd || !toggle || !menu) {
      warn("missing dropdown pieces in scope", scope);
      return;
    }

    const setDisplay = (value, el) => {
      const nice = value === "*" ? "All regions" : (el?.textContent?.trim() || value);
      if (toggle.tagName === "INPUT") toggle.value = nice;
      else toggle.textContent = nice;
    };

    const applyFilter = (value) => {
      const reset = value === "*" || !value;
      const cards = scope.querySelectorAll("[data-card]");
      let shown = 0;
      cards.forEach(card => {
        const loc = (card.querySelector("[data-location]")?.textContent || "")
          .trim().toLowerCase();
        const match = reset || loc === value.toLowerCase();
        card.style.display = match ? "" : "none";
        if (match) shown++;
      });
      log("filter", value, "→ showing", shown, "of", cards.length);
    };

    // Handle option clicks (delegated to document so CMS rebuilds won't break)
    const onClick = (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !scope.contains(opt)) return;
      const value = opt.getAttribute("data-filter")?.trim() || "*";
      dd.dataset.selected = value;
      setDisplay(value, opt);
      applyFilter(value);

      // Close Webflow dropdown politely
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

    document.addEventListener("click", onClick);

    // Initial state
    const initial = dd.dataset.selected || "*";
    dd.dataset.selected = initial;
    setDisplay(initial);
    applyFilter(initial);

    // For debug visibility
    scope.dataset.filterAttached = "true";
  }

  /** Find scopes when DOM is ready, and also after CMS injects content */
  function initAllScopes() {
    document.querySelectorAll("[data-filter-scope]").forEach(scope => {
      if (!scope.dataset.filterAttached) attachScope(scope);
    });
  }

  // 1) On DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initAllScopes);

  // 2) After Webflow/CMS mutations (list rendering)
  const obs = new MutationObserver(() => initAllScopes());
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // 3) Fallback: run once more after a tick
  setTimeout(initAllScopes, 50);
})();
