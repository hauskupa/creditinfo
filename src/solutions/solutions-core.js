// solutions-core.js
export function cacheOriginalFills(svg) {
  if (!svg || svg.__fillsCached) return;
  const elems = svg.querySelectorAll('path, circle, rect, polygon, g, ellipse, polyline');
  elems.forEach(el => {
    if (el.hasAttribute('fill')) {
      el.dataset.__origFill = el.getAttribute('fill') || '';
    } else {
      try { el.dataset.__origFill = getComputedStyle(el).fill || ''; }
      catch { el.dataset.__origFill = ''; }
    }
  });
  svg.__fillsCached = true;
}

export function getLottiePlayer(card) {
  if (!card) return null;
  return card.querySelector(
    'lottie-player, [data-lottie-player], [data-lottie], .lottie, [data-animation-type="lottie"], [data-src], [data-w-id]'
  );
}

export function playLottie(card, shouldPlay = true) {
  const playerEl = getLottiePlayer(card);
  if (!playerEl) return false;
  let inst = playerEl.__lottieInstance || playerEl.__lottie || playerEl.lottieInstance ||
             playerEl._lottie || playerEl.anim || playerEl.__wf_lottie;

  if (!inst) {
    const bodymovin = window.bodymovin || window.lottie;
    const path = playerEl.dataset.src || playerEl.getAttribute('data-src');
    if (bodymovin && path) {
      inst = bodymovin.loadAnimation({
        container: playerEl,
        renderer: 'svg',
        loop: playerEl.dataset.loop === 'true' || playerEl.dataset.loop === '1',
        autoplay: false,
        path
      });
      playerEl.__lottieInstance = inst;
    }
  }

  try {
    if (shouldPlay) {
      if (typeof inst.goToAndPlay === 'function') inst.goToAndPlay(0, true);
      else if (typeof inst.play === 'function') inst.play();
    } else {
      if (typeof inst.stop === 'function') inst.stop();
      else if (typeof inst.pause === 'function') inst.pause();
    }
  } catch {}
  return true;
}
