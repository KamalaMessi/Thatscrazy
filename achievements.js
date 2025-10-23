/* Achievements (localStorage, per-browser) */
(() => {
  const STORAGE_KEY = "tc_achievements_v2";

  // --- definitions (add more later) ---
  const defs = [
    {
      id: "clicker_reset200",
      name: "Green Temptation",
      category: "clicker",
      icon: "btn-green", // rendered as a tiny green button
      desc: "Reset your score (200+) by pressing the green decoy."
    },
    {
      id: "clicker_1000",
      name: "Four Digits Club",
      category: "clicker",
      icon: "🔥",
      desc: "Reach a score of 1000 in the clicker."
    },
    // placeholders (locked until you add logic later)
    { id: "calc_placeholder",   name: "Calculator? Maybe.", category: "calculator", icon: "🧮", desc: "TBD." },
    { id: "timer_placeholder",  name: "Timer? Somehow.",    category: "timer",      icon: "⏱️", desc: "TBD." },
  ];

  // --- storage helpers ---
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const save = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  const unlockedSet = new Set(load().map(a => a.id));
  function isUnlocked(id){ return unlockedSet.has(id); }
  function unlock(id){
    if (unlockedSet.has(id)) return false;
    const def = defs.find(d => d.id === id);
    if (!def) return false;
    unlockedSet.add(id);
    const arr = load();
    arr.push({ id, ts: Date.now() });
    save(arr);
    toast(`Achievement unlocked: <strong>${def.name}</strong>`);
    window.dispatchEvent(new CustomEvent("ach:unlocked", { detail: { id, def } }));
    return true;
  }
  function all() { return defs.slice(); }
  function stats(){
    const total = defs.length;
    const have = unlockedSet.size;
    return { have, total };
  }

  // --- tiny toast UI ---
  let toastWrap = null;
  function ensureToaster(){
    if (toastWrap) return;
    toastWrap = document.createElement("div");
    toastWrap.id = "ach_toasts";
    toastWrap.style.cssText = `
      position:fixed; right:16px; bottom:16px; z-index:9999;
      display:flex; flex-direction:column; gap:10px;
    `;
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(toastWrap));
    if (document.body) document.body.appendChild(toastWrap);
  }
  function toast(html){
    ensureToaster();
    const d = document.createElement("div");
    d.className = "ach_toast";
    d.innerHTML = html;
    d.style.cssText = `
      background:#111827; color:#e5e7eb; border:1px solid rgba(255,255,255,.12);
      padding:10px 12px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.35);
      opacity:0; transform: translateY(8px); transition:.25s;
      max-width: 320px; font-size:.95rem;
    `;
    toastWrap.appendChild(d);
    requestAnimationFrame(() => { d.style.opacity = 1; d.style.transform = "translateY(0)"; });
    setTimeout(() => {
      d.style.opacity = 0; d.style.transform = "translateY(8px)";
      setTimeout(()=> d.remove(), 400);
    }, 10000); // 10s
  }

  // expose minimal API
  window.ACH = { all, isUnlocked, unlock, stats };
})();