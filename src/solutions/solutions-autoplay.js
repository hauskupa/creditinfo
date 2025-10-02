// src/solutions/solutions-autoplay.js
export function initAutoplayMode(cards, openCard) {
  console.log("[solutions] autoplay mode");

  let currentIndex = 0;
  let timer;

  function next() {
    // activate card
    openCard(cards[currentIndex]);

    // move to next
    currentIndex = (currentIndex + 1) % cards.length;

    // repeat after 5s
    timer = setTimeout(next, 5000);
  }

  if (cards.length) {
    next(); // kick off autoplay
  }

  // optional return — gives us a way to stop autoplay later if needed
  return () => clearTimeout(timer);
}
