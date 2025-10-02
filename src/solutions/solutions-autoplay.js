function openCard(card) {
  cards.forEach(c => {
    const isActive = c === card;
    c.classList.toggle("is-active", isActive);

    // play/stop its Lottie
    playLottie(c, isActive);

    // handle card-text-clip
    const clip = c.querySelector(".card-text-clip");
    if (clip) {
      clip.style.overflow = "hidden";
      clip.style.transition = "max-height 400ms ease";

      if (isActive) {
        // expand to content height
        clip.style.maxHeight = (clip.firstElementChild?.scrollHeight || 0) + "px";
      } else {
        // collapse
        clip.style.maxHeight = "0px";
      }
    }
  });
}
