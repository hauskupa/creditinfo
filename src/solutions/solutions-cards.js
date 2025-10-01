// solutions-cards.js
import { initSvgMode } from "./solutions-svg.js";
import { initScrollMode } from "./solutions-scroll.js";
import { initAutoplayMode } from "./solutions-autoplay.js";

export function initSolutionCards() {
  console.log("[solutions] init");

  const wrapper = document.querySelector("[data-solutions]");
  if (!wrapper) return console.log("[solutions] no wrapper");

  const mode = wrapper.getAttribute("data-solutions"); 
  const cards = [...wrapper.querySelectorAll("[data-solutions-card]")];
  if (!cards.length) return console.log("[solutions] no cards");

  // Minimal openCard — replace with your full version if needed
  function openCard(card) {
    cards.forEach(c => {
      const on = c === card;
      c.classList.toggle("is-active", on);
    });
  }

  // Dispatch to mode-specific initializer
  if (mode === "svg") {
    initSvgMode(wrapper, cards, openCard);
  } else if (mode === "scroll") {
    initScrollMode(wrapper, cards, openCard);
  } else if (mode === "autoplay") {
    initAutoplayMode(cards, openCard);
  } else {
    console.log("[solutions] unknown mode:", mode);
  }
}
