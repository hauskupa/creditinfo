// solutions-core.js

// Find possible lottie element
export function getLottiePlayer(card) {
  if (!card) return null;
  return card.querySelector(
    "lottie-player, [data-lottie-player], [data-lottie], .lottie, [data-animation-type='lottie'], [data-src], [data-w-id]"
  );
}

// Play or stop lottie, restart from frame 0 when playing
export function playLottie(card, shouldPlay = true) {
  const playerEl = getLottiePlayer(card);
  if (!playerEl) return false;

  // cached instance check
  let inst = playerEl.__lottieInstance || playerEl.anim || playerEl.__wf_lottie;

  // if no instance, try to load one
  if (!inst) {
    const bodymovin = window.bodymovin || window.lottie;
    const path = playerEl.dataset.src || playerEl.getAttribute("data-src");
    if (bodymovin && path) {
      try {
        inst = bodymovin.loadAnimation({
          container: playerEl,
          renderer: playerEl.dataset.renderer || "svg",
          loop: playerEl.dataset.loop === "true" || playerEl.dataset.loop === "1",
          autoplay: false,
          path
        });
        playerEl.__lottieInstance = inst;
      } catch (err) {
        console.warn("[solutions] lottie load failed", err);
        return false;
      }
    }
  }

  if (!inst) return false;

  try {
    if (shouldPlay) {
      // always restart from 0
      if (typeof inst.goToAndPlay === "function") {
        inst.goToAndPlay(0, true);
      } else if (typeof inst.stop === "function" && typeof inst.play === "function") {
        inst.stop();
        inst.play();
      } else if (typeof inst.play === "function") {
        inst.play();
      }
    } else {
      if (typeof inst.stop === "function") inst.stop();
      else if (typeof inst.pause === "function") inst.pause();
    }
    return true;
  } catch (e) {
    console.warn("[solutions] lottie control error", e);
    return false;
  }
}
