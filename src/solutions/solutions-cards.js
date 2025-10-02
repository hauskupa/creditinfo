import { initSvgMode } from "./solutions-svg.js";
import { initScrollMode } from "./solutions-scroll.js";
import { initAutoplayMode } from "./solutions-autoplay.js";
import { playLottie, disableAutoplay } from "./solutions-core.js";

export function initSolutionCards() {
  console.log("[solutions] init cards bootstrap");

  const wrapper = document.querySelector("[data-solutions]");
  if (!wrapper) return console.log("[solutions] no wrapper");

  // Kill autoplay on all Lotties
  disableAutoplay(wrapper);

  const mode = wrapper.getAttribute("data-solutions");
  const cards = [...wrapper.querySelectorAll("[data-solutions-card]")];
  if (!cards.length) return console.log("[solutions] no cards");

  console.log("[solutions] mode:", mode, "cards found:", cards.length);

  function openCard(card) {
    cards.forEach(c => {
      const isActive = c === card;
      c.classList.toggle("is-active", isActive);
      playLottie(c, isActive);
    });
  }

  if (mode === "svg") {
    initSvgMode(wrapper, cards, openCard);
  } else if (mode === "scroll") {
    initScrollMode(wrapper, cards, openCard);
  } else if (mode === "autoplay") {
    initAutoplayMode(cards, openCard);
  } else {
    console.log("[solutions] unknown mode:", mode);
  }

  // ensure first card is active at boot
  if (cards[0]) openCard(cards[0]);
}
