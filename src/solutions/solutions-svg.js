import { playLottie } from "./solutions-core.js";

export function initSvgMode(wrapper, cards, openCard) {
  console.log("[solutions] svg mode");
  openCard(cards[0]);

  requestAnimationFrame(() => {
    cards.forEach(c => playLottie(c, false));
  });
}
