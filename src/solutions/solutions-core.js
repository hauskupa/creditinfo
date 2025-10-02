// solutions-core.js
// Helpers for controlling solution cards & lottie elements

/**
 * Force-disable autoplay on all lottie elements inside wrapper.
 * Webflow tends to play them all once unless we override.
 */
export function disableAutoplay(wrapper) {
  wrapper.querySelectorAll("[data-animation-type='lottie']").forEach(el => {
    el.setAttribute("data-autoplay", "0");
  });
}

/**
 * Play or hide the Lottie inside a card.
 * Since Webflow doesn't expose bodymovin controls,
 * we just toggle visibility instead of using .play() / .stop().
 */
export function playLottie(card, play = true) {
  const lottieEl = card.querySelector("[data-animation-type='lottie']");
  if (!lottieEl) return;

  if (play) {
    // make visible → Webflow will render/loop as needed
    lottieEl.style.display = "block";
  } else {
    // hide it so only the active card is visible
    lottieEl.style.display = "none";
  }
}
