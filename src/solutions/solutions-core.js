// solutions-core.js
import lottie from "lottie-web";

const lottieCache = new Map();

export function getLottiePlayer(card) {
  const container = card.querySelector("[data-lottie]");
  if (!container) return null;

  if (lottieCache.has(container)) {
    return lottieCache.get(container);
  }

  const src = container.getAttribute("data-lottie");
  const anim = lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: src
  });

  lottieCache.set(container, anim);
  return anim;
}

export function playLottie(card, play = true) {
  const anim = getLottiePlayer(card);
  if (!anim) return;

  if (play) {
    anim.stop();        // always restart from beginning
    anim.play();
  } else {
    anim.stop();
  }
}
