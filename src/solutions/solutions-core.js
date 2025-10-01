// solutions-core.js

// Always (re)create a bodymovin instance from data-src
function ensureInstance(el) {
  const path = el.dataset.src || el.getAttribute("data-src");
  if (!path) return null;

  // cache so we don't reload every scroll
  if (el.__lottieInstance) return el.__lottieInstance;

  const bodymovin = window.bodymovin || window.lottie;
  if (!bodymovin || typeof bodymovin.loadAnimation !== "function") {
    console.warn("[solutions] bodymovin not available");
    return null;
  }

  try {
    const inst = bodymovin.loadAnimation({
      container: el,
      renderer: el.dataset.renderer || "svg",
      loop: el.dataset.loop === "true" || el.dataset.loop === "1",
      autoplay: false,
      path
    });
    el.__lottieInstance = inst;
    return inst;
  } catch (err) {
    console.warn("[solutions] lottie load failed", err);
    return null;
  }
}

// play/stop a card’s lottie, always from frame 0
export function playLottie(card, shouldPlay = true) {
  const playerEl = card.querySelector("[data-animation-type='lottie']");
  if (!playerEl) return false;

  const inst = ensureInstance(playerEl);
  if (!inst) return false;

  try {
    if (shouldPlay) {
      if (typeof inst.goToAndPlay === "function") {
        inst.goToAndPlay(0, true); // restart from beginning
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
