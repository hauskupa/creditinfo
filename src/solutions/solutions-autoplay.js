// solutions-autoplay.js
import { openCard } from "./solutions-core.js";

export function initAutoplayMode(cards) {
  console.log("[solutions] autoplay mode");

  let currentIndex = 0;
  let userPaused = false;

  (function next() {
    if (!userPaused && cards.length) {
      openCard(cards, cards[currentIndex]);
      currentIndex = (currentIndex + 1) % cards.length;
    }
    setTimeout(next, 5000); // 5s per card
  })();
}
