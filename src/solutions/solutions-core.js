// solutions-core.js

// Helper to find a Lottie element inside a card
export function getLottieEl(card) {
  if (!card) return null;
  return card.querySelector("[data-animation-type='lottie']");
}

// Play or stop an existing Webflow Lottie animation
export function playLottie(el, shouldPlay) {
  if (!el) return;

  // Webflow stores its animation instance here
  const anim = el.__lottie;
  if (!anim) return;

  if (shouldPlay) {
    anim.play();
  } else {
    anim.stop();
  }
}

// Toggle active card state
export function openCard(cards, card) {
  cards.forEach(c => {
    const isActive = c === card;
    c.classList.toggle("is-active", isActive);

    const lottieEl = getLottieEl(c);
    if (lottieEl) {
      playLottie(lottieEl, isActive);
    }
  });
}
