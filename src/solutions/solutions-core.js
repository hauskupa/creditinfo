// solutions-core.js
export function playLottie(card, play = true) {
  const lottieEl = card.querySelector("[data-animation-type='lottie']");
  if (!lottieEl) return;

  // Webflow’s built-in Lottie engine
  const lottieEngine = Webflow.require("lottie");

  if (play) {
    console.log("▶ playing", card.getAttribute("data-solutions-card") || card, lottieEl);
    lottieEngine.play(lottieEl);
  } else {
    console.log("⏹ stopping", card.getAttribute("data-solutions-card") || card, lottieEl);
    lottieEngine.stop(lottieEl);
  }
}
