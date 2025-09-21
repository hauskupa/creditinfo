export default function initSubnav(){
  const menu = document.querySelector('[data-subnav]');
  const line = menu && menu.querySelector('[data-underline]');
  if (!menu || !line) return;

  const links = [...menu.querySelectorAll('[data-subnav-link][href^="#"]')];
  const items = links.map(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    return sec ? { a, id, sec } : null;
  }).filter(Boolean);
  if (!items.length) return;

  const px = v => (parseFloat(v) || 0);
  const cfgOffset = px(menu.getAttribute('data-scroll-offset'));
  const estHeader = (document.querySelector('.nav_component')?.offsetHeight || 0);
  const offset = cfgOffset || estHeader;

  let tops = [];
  const measure = () => {
    tops = items.map(it => it.sec.getBoundingClientRect().top + window.scrollY);
    activeFromScroll();
  };

  function setLineTo(a){
    const r = a.getBoundingClientRect();
    const w = menu.getBoundingClientRect();
    const width = (r.left - w.left) + (r.width * 0.5);
    line.style.left  = '0px';
    line.style.width = width + 'px';
  }

  function setActiveByIndex(i){
    items.forEach(x => x.a.removeAttribute('aria-current'));
    const a = items[i].a;
    a.setAttribute('aria-current', 'page');
    setLineTo(a);
  }

  function activeFromScroll(){
    const y = window.scrollY + offset + 1;
    let i = 0;
    for (let k = 0; k < tops.length; k++){
      if (tops[k] <= y) i = k; else break;
    }
    setActiveByIndex(i);
  }

  items.forEach((it, i) => {
    it.a.addEventListener('click', e => {
      e.preventDefault();
      const y = tops[i] - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', '#'+it.id);
      setActiveByIndex(i);
    });
    it.a.addEventListener('mouseenter', () => setLineTo(it.a));
    it.a.addEventListener('focus',      () => setLineTo(it.a));
  });
  menu.addEventListener('mouseleave', activeFromScroll);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { activeFromScroll(); ticking = false; });
  };

  window.addEventListener('load',   () => { measure(); activeFromScroll(); });
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', onScroll, { passive:true });
}
