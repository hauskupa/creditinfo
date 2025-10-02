// solutions-core.js

export function disableAutoplay(wrapper) {
  wrapper.querySelectorAll("[data-animation-type='lottie']").forEach(el => {
    el.setAttribute("data-autoplay", "0");
  });
}

export function playLottie(card, play = true) {
  const lottieEl = card.querySelector("[data-animation-type='lottie']");
  if (!lottieEl) return;

  if (play) {
    // show the element
    lottieEl.style.display = "block";

    // restart the Lottie by "resetting" Webflow IX2
    try {
      lottieEl.dispatchEvent(new CustomEvent("IX2_PAGE_UPDATE"));
    } catch (e) {
      console.log("[solutions] could not restart lottie", e);
    }
  } else {
    // hide when not active
    lottieEl.style.display = "none";
  }
}
