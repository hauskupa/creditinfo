// solutions-scroll.js
export function initScrollMode(wrapper, cards, openCard) {
  console.log("[solutions] scroll observer enabled");

  let sections = [...wrapper.querySelectorAll("[data-solutions-content]")];
  if (!sections.length) sections = [...document.querySelectorAll("[data-solutions-content]")];
  if (!sections.length) return console.log("[solutions] no sections found");

  const io = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = visible.target.getAttribute("data-solutions-content");
    const match = cards.find(c => c.getAttribute("data-solutions-card") === id);
    if (match) openCard(match);
  }, { rootMargin: "-30% 0px -60% 0px", threshold: [0, .25, .5, .75, 1] });

  sections.forEach(s => io.observe(s));
  if (cards[0]) openCard(cards[0]);
}
c