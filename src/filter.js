// src/filter.js
(() => {
  console.log("[filter] boot");

  // ---------- helpers ----------
  const norm = (s) =>
    (s || "")
      .normalize("NFKD")            // strip diacritics
      .replace(/\u00A0/g, " ")      // NBSP → space
      .replace(/\s+/g, " ")         // collapse whitespace
      .trim()
      .toLowerCase();

  const hideEl = (el) => el.style.setProperty("display", "none", "important");
  const showEl = (el) => el.style.removeProperty("display");

  // ---------- attach to one scope ----------
  function attachScope(scope) {
    const dd     = scope.querySelector("[data-filter-dropdown]");
    const toggle = dd?.querySelector(".w-dropdown-toggle,[data-filter-toggle]");
    const menu   = dd?.querySelector("[data-filter-menu]");
    if (!dd || !toggle || !menu) return;

    // Use first child (text label) so we don't overwrite the chevron/icon div
    const labelEl = toggle.firstElementChild || toggle;

    const setDisplay = (value, optionEl) => {
      const nice = norm(value) === "*" ? "All regions" : (optionEl?.textContent?.trim() || value);
      if (labelEl.tagName === "INPUT") labelEl.value = nice;
      else labelEl.textContent = nice;
    };

    // Prefer cards within the scope; if none, fall back globally
    const getCards = () => {
      let cards = scope.querySelectorAll("[data-card]");
      if (cards.length) return cards;
      cards = scope.querySelectorAll("[role='listitem']");
      if (cards.length) return cards;
      return document.querySelectorAll("[data-card], [role='listitem']");
    };

    // Prefer the attribute value (CMS-safe), fall back to text/heading
    const getLocation = (card) => {
      const el = card.querySelector("[data-location]");
      const byAttr = el?.getAttribute("data-location");
      if (byAttr) return norm(byAttr);
      const byText = el?.textContent || card.querySelector(".job-card-pre-heading")?.textContent;
      return norm(byText);
    };

    const applyFilter = (value) => {
      const q = norm(value);
      const reset = !q || q === "*";
      const cards = getCards();
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

      // Optional empty-state element inside the same scope:
      // <div data-filter-empty style="display:none">No openings for this location.</div>
      const empty = scope.querySelector("[data-filter-empty]") || document.querySelector("[data-filter-empty]");
      if (empty) empty.style.display = shown === 0 ? "" : "none";

      if (!reset) {
        const sample = Array.from(cards).slice(0, 5).map((c) => ({ loc: getLocation(c) }));
        console.log("[filter] value:", value, "→", q, "shown:", shown, "/", cards.length, "sample:", sample);
      } else {
        console.log("[filter] value: * shown:", shown, "/", cards.length);
      }
    };

    // Clicks on options (delegated; works after CMS re-render)
    const onClick = (e) => {
      const opt = e.target.closest("[data-filter]");
      if (!opt || !document.contains(opt)) return;
      if (!dd.contains(opt)) return; // ensure it's this dropdown's option

      const value = (opt.getAttribute("data-filter") || "*").trim();
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

    scope.dataset.filterAttached = "true";
  }

  // ---------- init across the page ----------
  function initAllScopes() {
    const scopes = document.querySelectorAll("[data-filter-scope]");
    if (scopes.length) {
      scopes.forEach((s) => {
        if (!s.dataset.filterAttached) attachScope(s);
      });
    } else {
      if (!document.body.dataset.filterAttached) attachScope(document.body);
    }
  }

  document.addEventListener("DOMContentLoaded", initAllScopes);

  // re-run when CMS injects/changes nodes
  new MutationObserver(initAllScopes).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // one extra pass after a tick
  setTimeout(initAllScopes, 50);
})();
