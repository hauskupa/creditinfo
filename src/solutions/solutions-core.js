// solutions-core.js

// Find possible lottie element
export function getLottiePlayer(card) {
  if (!card) return null;
  return card.querySelector(
    "lottie-player, [data-lottie-player], [data-lottie], .lottie, [data-animation-type='lottie'], [data-src], [data-w-id]"
  );
}

export function playLottie(card, shouldPlay = true) {
  const playerEl = card.querySelector("[data-animation-type='lottie']");
  if (!playerEl) return false;

  // Webflow usually attaches the instance here
  let inst = playerEl.__wf_lottie || playerEl.__lottieInstance || playerEl.anim;

  if (!inst) {
    const bodymovin = window.bodymovin || window.lottie;
    const path = playerEl.dataset.src || playerEl.getAttribute("data-src");
    if (bodymovin && path) {
      inst = bodymovin.loadAnimation({
        container: playerEl,
        renderer: "svg",
        loop: playerEl.dataset.loop === "true" || playerEl.dataset.loop === "1",
        autoplay: false,
        path
      });
      playerEl.__lottieInstance = inst;
    }
  }

  if (!inst) return false;

  try {
    if (shouldPlay) {
      if (typeof inst.goToAndPlay === "function") {
        inst.goToAndPlay(0, true); // restart from 0
      } else if (typeof inst.play === "function") {
        inst.stop?.();
        inst.play();
      }
    } else {
      inst.stop?.();
      inst.pause?.();
    }
    return true;
  } catch (e) {
    console.warn("[solutions] lottie control error", e);
    return false;
  }
}
