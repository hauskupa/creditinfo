// solutions-core.js
import lottie from "lottie-web";

const lottieCache = new Map();

export function getLottiePlayer(container, { forceOnce = false } = {}) {
  if (lottieCache.has(container)) {
    return lottieCache.get(container);
  }

  const src = container.getAttribute("data-lottie");
  const anim = lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: forceOnce ? false : (container.dataset.loop === "true" || container.dataset.loop === "1"),
    autoplay: false,
    path: src
  });

  lottieCache.set(container, anim);
  return anim;
}

export function playLottie(el, play = true, { forceOnce = false } = {}) {
  // el can be card or hub wrapper
  const container = el.querySelector("[data-lottie]") || el;
  if (!container) return;

  const anim = getLottiePlayer(container, { forceOnce });
  if (!anim) return;

  if (play) {
    anim.stop();
    anim.play();
  } else {
    anim.stop();
  }
}
