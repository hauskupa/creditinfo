// slider.js
export function initSlider() {
  if (window.__creditinfo_slider_inited) return;
  window.__creditinfo_slider_inited = true;

  const root = document.querySelector('.slider-custom') || document.querySelector('.our-history_section');
  if (!root) return;

  const leftWrap  = root.querySelector('[data-history-left]');
  const rightWrap = root.querySelector('[data-history-right]');
  const imgWrap   = root.querySelector('[data-history-images]');
  const prevBtn   = root.querySelector('[data-history-prev]');
  const nextBtn   = root.querySelector('[data-history-next]');
  if (!leftWrap || !rightWrap || !imgWrap) return;

  let leftTrack  = leftWrap.querySelector('.slide-track')   || leftWrap.querySelector('.track');
  let rightTrack = rightWrap.querySelector('.slide-track2') || rightWrap.querySelector('.track');
  let imgTrack   = imgWrap.querySelector('.slide-track--images');

  if (!leftTrack) {
    leftTrack = document.createElement('div');
    leftTrack.className = 'slide-track';
    while (leftWrap.firstElementChild) leftTrack.appendChild(leftWrap.firstElementChild);
    leftWrap.appendChild(leftTrack);
  }
  if (!rightTrack) {
    rightTrack = document.createElement('div');
    rightTrack.className = 'slide-track2';
    while (rightWrap.firstElementChild) rightTrack.appendChild(rightWrap.firstElementChild);
    rightWrap.appendChild(rightTrack);
  }
  if (!imgTrack) {
    imgTrack = document.createElement('div');
    imgTrack.className = 'slide-track--images';
    while (imgWrap.firstElementChild) imgTrack.appendChild(imgWrap.firstElementChild);
    imgWrap.appendChild(imgTrack);
  }

  const leftSlides  = Array.from(leftTrack.children);
  const rightSlides = Array.from(rightTrack.children);
  const imgSlides   = Array.from(imgTrack.children);
  const count = Math.min(leftSlides.length, rightSlides.length, imgSlides.length);
  if (!count) return;

  const steps = Array.from(root.querySelectorAll('[data-timeline-step]'));
  const timelineEl = root.querySelector('[data-timeline]');

  let index = 0;

  function measureAndLock() {
    const leftH  = leftSlides[0]?.offsetHeight  || leftWrap.clientHeight  || 0;
    const rightH = rightSlides[0]?.offsetHeight || rightWrap.clientHeight || 0;

    if (leftH) {
      leftWrap.style.height = leftH + 'px';
      leftSlides.forEach(s => s.style.height = leftH + 'px');
    }
    if (rightH) {
      rightWrap.style.height = rightH + 'px';
      rightSlides.forEach(s => s.style.height = rightH + 'px');
    }

    const imgFrameW = imgWrap.clientWidth;
    const imgH = imgSlides[0]?.offsetHeight || imgWrap.clientHeight || 0;

    if (imgH) imgWrap.style.height = imgH + 'px';
    if (imgFrameW > 0) {
      imgSlides.forEach(s => {
        s.style.width = imgFrameW + 'px';
        s.style.flex  = `0 0 ${imgFrameW}px`;
        if (imgH) s.style.height = imgH + 'px';
      });
    }
  }

  function setTimeline(i) {
    steps.forEach(s => s.classList.remove('is-active'));
    steps[i]?.classList.add('is-active');
  }

  function ensureTimelineVisible(i){
    if (!timelineEl || !steps[i]) return;
    const step = steps[i];
    const target = step.offsetLeft - (timelineEl.clientWidth / 2) + (step.clientWidth / 2);
    timelineEl.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }

  function setButtons() {
    if (prevBtn) prevBtn.toggleAttribute('disabled', index <= 0);
    if (nextBtn) nextBtn.removeAttribute('disabled');
  }

  function translateTo(i) {
    const leftH  = parseFloat(leftWrap.style.height)  || leftSlides[0]?.offsetHeight  || 0;
    const rightH = parseFloat(rightWrap.style.height) || rightSlides[0]?.offsetHeight || 0;
    const imgW   = imgWrap.clientWidth;

    leftTrack.style.transform  = `translateY(-${i * leftH}px)`;
    rightTrack.style.transform = `translateY(-${i * rightH}px)`;
    imgTrack.style.transform   = `translateX(${i * imgW}px)`;
  }

  function goto(to) {
    let next;
    if (to > count - 1) next = 0;
    else next = Math.max(0, to);

    if (next === index) return;
    index = next;
    setTimeline(index);
    ensureTimelineVisible(index);
    translateTo(index);
    setButtons();
  }

  const nextStep = () => goto(index + 1);
  const prevStep = () => goto(index - 1);

  measureAndLock();
  setTimeline(0);
  ensureTimelineVisible(0);
  translateTo(0);
  setButtons();

  nextBtn && nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextStep(); });
  prevBtn && prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevStep(); });

  root.addEventListener('click', (e) => {
    const step = e.target.closest('[data-timeline-step]');
    if (!step || !root.contains(step)) return;
    const idx = steps.indexOf(step);
    if (idx > -1) goto(idx);
  });

  const reflow = () => { measureAndLock(); translateTo(index); ensureTimelineVisible(index); setButtons(); };
  window.addEventListener('resize', reflow);
  window.addEventListener('load', reflow);

  const mo = new MutationObserver(reflow);
  mo.observe(imgWrap, { childList: true, subtree: true, attributes: true });
}

// auto-init once if script included directly
if (!window.__creditinfo_slider_auto_init) {
  window.__creditinfo_slider_auto_init = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
  } else {
    initSlider();
  }
}

// small parallax helper (idempotent)
export function initParallax() {
  if (window.__creditinfo_parallax_inited) return;
  window.__creditinfo_parallax_inited = true;

  const onScroll = () => {
    const sections = document.querySelectorAll('[data-parallax]');
    const scrollY = window.scrollY || window.pageYOffset || 0;
    sections.forEach(sec => {
      const speed = parseFloat(sec.dataset.speed) || 0.3;
      const offset = scrollY * speed;
      sec.style.transform = `translateY(${offset}px)`;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // initial call
  onScroll();
}

// auto-init parallax if desired
if (!window.__creditinfo_parallax_auto_init) {
  window.__creditinfo_parallax_auto_init = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax);
  } else {
    initParallax();
  }
}
