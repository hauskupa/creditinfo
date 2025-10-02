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

  // Dispatch based on mode
  if (mode === "svg") {
    initSvgMode(wrapper, cards);
  } else if (mode === "scroll") {
    initScrollMode(wrapper, cards);
  } else if (mode === "autoplay") {
    initAutoplayMode(cards);
  } else {
    console.log("[solutions] unknown mode:", mode);
  }
}
