// src/filter.js
(() => {
  console.log("[filter] boot");

  function attachScope(scope) {
    const dd = scope.querySelector("[data-filter-dropdown]");
    const toggle = dd?.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const menu = dd?.querySelector("[data-filter-menu]");
    if (!dd || !toggle || !menu) return;

    // Your markup: <div class="w-dropdown-toggle"><div>label</div><div class="icon">…</div></div>
    // Prefer the first child (text label) so we don't nuke the icon.
    const labelEl = toggle.firstElementChild || toggle;

    const setDisplay = (value, optionEl) => {
      const nice = value === "*" ? "All regions" : (optionEl?.textContent?.trim() || value);
      if (labelEl.tagName === "INPUT") labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    // Cards lookup (handles both data-* hooks and plain Webflow lists).
    // If the list isn't inside the same scope, fall back to the whole page.
    const getCards = () => {
      let cards = scope.querySelectorAll("[data-card]");
      if (cards.length) return cards;

      cards = scope.querySelectorAll("[role='listitem']");
      if (cards.length) return cards;

      // Final fallback: global search so it still works if markup is split
      return document.querySelectorAll("[data-card], [role='listitem']");
    };

    // Read location, preferring the attribute value (CMS-safe)
    const getLocation = (card) => {
      const el = card.querySelector("[data-location]");
      const byAttr = el?.getAttribute("data-location");
      if (byAttr) return byAttr.trim().toLowerCase();
      const byText = el?.textContent || card.querySelector(".job-card-pre-heading")?.textContent;
      return (byText || "").trim().toLowerCase();
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

      console.log("[filter] value:", value, "shown:", shown, "/", cards.length);
    };

    // Option clicks (delegated so CMS re-renders don't break it)
    const onClick = (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !document.contains(opt)) return;
      // Only react if this option belongs to THIS scope’s dropdown
      if (!dd.contains(opt)) return;

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
    };

    document.addEventListener("click", onClick);

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
      // Fallback: attach once to the whole page if no wrapper is present
      if (!document.body.dataset.filterAttached) attachScope(document.body);
    }
  }

  document.addEventListener("DOMContentLoaded", initAllScopes);

  // Re-init after CMS/DOM mutations
  new MutationObserver(initAllScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // One more pass after a tick (covers late inserts)
  setTimeout(initAllScopes, 50);
})();
