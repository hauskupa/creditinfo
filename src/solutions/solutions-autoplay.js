export function initAutoplayMode(cards, openCard) {
  console.log("[solutions] autoplay mode");

  let currentIndex = 0;

  (function next() {
    openCard(cards[currentIndex]);
    currentIndex = (currentIndex + 1) % cards.length;
    setTimeout(next, 5000);
  })();
}
