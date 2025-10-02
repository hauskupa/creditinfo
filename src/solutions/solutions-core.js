// solutions-core.js
export function playLottie(card, play = true) {
  const lottieEl = card.querySelector("[data-animation-type='lottie']");
  if (!lottieEl) return;

  // Access Webflow's built-in Lottie engine
  const lottieEngine = Webflow.require("lottie");

  if (play) {
    lottieEngine.play(lottieEl);
  } else {
    lottieEngine.stop(lottieEl);
  }
}
