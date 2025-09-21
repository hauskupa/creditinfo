// Top nav active state using data-section prefix
export default function initTopnav(){
  const norm = s => String(s||"").toLowerCase().replace(/\/+$/,"");
  const path = norm(location.pathname);

  document.querySelectorAll('[data-mainnav-link]').forEach(a => {
    const href = a.getAttribute('href') || "";
    const section = a.getAttribute('data-section') || href;
    const prefix = norm(section);
    if (!prefix) return;

    const active = prefix === "" || prefix === "/"
      ? (path === "" || path === "/")
      : path.startsWith(prefix);

    if (active) a.setAttribute('data-active','true');
    else a.removeAttribute('data-active');
  });
}
