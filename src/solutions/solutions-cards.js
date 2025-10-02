import { initSvgMode } from "./solutions-svg.js";
import { initScrollMode } from "./solutions-scroll.js";
import { initAutoplayMode } from "./solutions-autoplay.js";
import { playLottie } from "./solutions-core.js";

export function initSolutionCards() {
  console.log("[solutions] init cards bootstrap");

  const wrapper = document.querySelector("[data-solutions]");
  if (!wrapper) return console.log("[solutions] no wrapper");

  const mode = wrapper.getAttribute("data-solutions");
  const cards = [...wrapper.querySelectorAll("[data-solutions-card]")];
  if (!cards.length) return console.log("[solutions] no cards");

  function openCard(card) {
    cards.forEach(c => {
      const isActive = c === card;
      c.classList.toggle("is-active", isActive);

      // play/stop its Lottie
      playLottie(c, isActive);

      // handle card-text-clip
      const clip = c.querySelector(".card-text-clip");
      if (clip) {
        clip.style.overflow = "hidden";
        clip.style.transition = "max-height 400ms ease";
        clip.style.maxHeight = isActive
          ? (clip.firstElementChild?.scrollHeight || 0) + "px"
          : "0px";
      }
    });

    // 🔄 hub pulse only in svg mode
    if (mode === "svg") {
      const hub = wrapper.querySelector("[data-solutions-hub]");
      if (hub) {
        playLottie(hub, true, { forceOnce: true });
      }
    }
  }

  // dispatch modes
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
