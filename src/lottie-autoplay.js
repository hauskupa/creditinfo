// src/lottie-autoplay.js
import { playLottie } from "./solutions/solutions-core.js";

export function initStandaloneLottieAutoplay() {
  const els = document.querySelectorAll('[data-lottie][data-lottie-autoplay]');
  if (!els.length) return;

  const visibleQueue = [];

  els.forEach(el => {
    const trigger = el.getAttribute("data-lottie-trigger") || "immediate";
    if (trigger === "visible") {
      visibleQueue.push(el);
    } else {
      // Play immediately
      playLottie(el, true);
    }
  });

  if (visibleQueue.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Play once on first visibility
          playLottie(entry.target, true, { forceOnce: true });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    visibleQueue.forEach(el => io.observe(el));
  }
}

