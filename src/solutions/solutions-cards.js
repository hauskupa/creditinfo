import { initSvgMode } from "./solutions-svg.js";
import { initScrollMode } from "./solutions-scroll.js";
import { initAutoplayMode } from "./solutions-autoplay.js";
import { playLottie } from "./solutions-core.js";

export function initSolutionCards() {
  console.log("[solutions] init cards bootstrap");

  const wrapper = document.querySelector("[data-solutions]");
  if (!wrapper) return console.log("[solutions] no wrapper");

  const mode = wrapper.getAttribute("data-solutions");
  const cards = [...wrapper.querySelectorAll("[data-solutions-card]")]
    .sort((a, b) => {
      const av = parseInt(a.getAttribute("data-solutions-card"), 10);
      const bv = parseInt(b.getAttribute("data-solutions-card"), 10);
      return av - bv;
    });

  if (!cards.length) return console.log("[solutions] no cards");

  function openCard(card) {
    cards.forEach(c => {
      const isActive = c === card;
      c.classList.toggle("is-active", isActive);

      // play/stop its Lottie
      playLottie(c, isActive);

      // handle card-text-clip with hybrid CSS transition
      const clip = c.querySelector(".card-text-clip");
      if (clip) {
        if (isActive) {
          const h = clip.firstElementChild?.scrollHeight || 0;
          clip.style.maxHeight = h + "px";
          clip.classList.add("is-open");
        } else {
          clip.style.maxHeight = "0px";
          clip.classList.remove("is-open");
        }
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
