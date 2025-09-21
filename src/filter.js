
(() => {
  // Only run if a filter dropdown exists on this page
  const dd = document.querySelector("[data-filter-dropdown]");
  if (!dd) return;
  console.log("[filter] boot");

  const norm = (s) => (s || "")
    .normalize("NFKD").replace(/\u00A0/g," ").replace(/\s+/g," ").trim().toLowerCase();

  const toggle = dd.querySelector("[data-filter-toggle], .w-dropdown-toggle");
  const menu   = dd.querySelector("[data-filter-menu], .w-dropdown-list");
  if (!toggle || !menu) { console.warn("[filter] missing toggle/menu"); return; }

  // Update dropdown label; keep the chevron icon intact
  const labelEl = toggle.firstElementChild || toggle;
  const setLabel = (value, opt) => {
    const nice = norm(value) === "*" ? "All regions" : (opt?.textContent?.trim() || value);
    if (labelEl instanceof HTMLInputElement) labelEl.value = nice;
    else labelEl.textContent = nice;
  };

  // Find all job-card elements on the page (not inside the dropdown) and return their wrappers
  const getCards = () => {
    const notInDropdown = (el) => !el.closest("[data-filter-dropdown]");
    return [...document.querySelectorAll(".job-card")]
      .map((card) => card.closest("[data-card], [role='listitem']") || card)
      .filter(notInDropdown);
  };

  // Read location from data-location attribute, heading, or full card text
  const getLocation = (card) => {
    const el = card.querySelector("[data-location]") || card.querySelector(".job-card [data-location]");
    const byAttr = el?.getAttribute("data-location");
    if (byAttr) return norm(byAttr);
    const byHeading = card.querySelector(".job-card-pre-heading")?.textContent;
    if (byHeading && byHeading.trim()) return norm(byHeading);
    return norm(card.textContent || "");
  };

  const hide = (el) => el.style.setProperty("display","none","important");
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
    console.log("[filter] value:", reset ? "*" : value, "shown:", shown, "/", cards.length);
  };

  // Close the dropdown immediately and clean up Webflow classes
  const closeDropdown = () => {
    dd.classList.remove("w--open");
    menu.style.removeProperty("display");
    requestAnimationFrame(() => {
      toggle?.click?.();
      setTimeout(() => {
        dd.classList.remove("w--open");
        menu.style.removeProperty("display");
      }, 20);
    });
  };

  // Handle option clicks within this dropdown
  dd.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-filter]");
    if (!opt || !dd.contains(opt)) return;
    const value = (opt.getAttribute("data-filter") || "*").trim();
    dd.dataset.selected = value;
    setLabel(value, opt);
    applyFilter(value);
    closeDropdown();
  }, true);

  // Initialize once items appear (for CMS lists that load after DOMContentLoaded)
  let tries = 0;
  const init = () => {
    const cards = getCards();
    if (cards.length) {
      const initial = dd.dataset.selected || "*";
      dd.dataset.selected = initial;
      setLabel(initial);
      applyFilter(initial);
    } else if (tries++ < 30) {
      setTimeout(init, 100);
    }
  };
  init();

  // Re-apply if CMS adds/removes cards later
  new MutationObserver(() => {
    applyFilter(dd.dataset.selected || "*");
  }).observe(document.documentElement, {childList:true, subtree:true});
})();