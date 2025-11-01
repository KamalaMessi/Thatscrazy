(() => {
  const KEY = 'tc_achievements_v2';

  // --- Definitions --
  // Add more items late
  const defs = {
    calculator: {
      title: "Calculator",
      items: [
        {
  code: 'calc_div_zero_zero',
  name: 'Are you proud of yourself?',
  icon: '🚫',
  desc: 'Devide 0 by 0 on the calculator.'
}
      
      ]
    },
    timer: {
      title: "Timer",
      items: [
        {
  code: 'timer_21m37s_done',
  name: '21:37 of silence',
  icon: '⏳',
  desc: 'Finish a 21:37 timer from start to end to remember The Pope Jan Paweł II.'
}
      ]
    },
    clicker: {
      title: "Clicker",
      items: [
        {
          code: 'clicker_reset_200_green',
          name: 'I said dont touch me…',
          icon: '🟩',
          desc: 'Reset your score with the green button at 200+.'
        },
        {
          code: 'clicker_score_1000',
          name: 'Four Digits Club',
          icon: '🔥',
          desc: 'Reach 1000 score in the clicker.'
        },
        {
  code: 'clicker_score_1600',
  name: 'Zuckerbergs SAT score',
  icon: '📚',
  desc: 'Reach perfect SAT score in the clicker.'
},
{
  code: 'clicker_score_10000',
  name: 'Unemployment of doom and despair',
  icon: '💀',
  desc: 'Reach 10000 score - you used autoclicker, didnt you?'
}
      ]
    },
    platformer: {
  title: "Platformer",
  items: [
    {
      code: 'platformer_score_30',
      name: 'Well, did it shuffle?',
      icon: '🎯',
      desc: 'Reach 30 points in the platformer.'
    }
  ]
},

  };

  

  // --- Storage -
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  function has(code) { return load().some(a => a.code === code); }

  function grant(code) {
    if (has(code)) return false;
    const list = load();
    const def = findDef(code);
    list.push({ code, ts: Date.now() });
    save(list);
    toast(def ? `Achievement unlocked: ${def.name}` : `Achievement unlocked!`);
    // notify any page that listens
    window.dispatchEvent(new CustomEvent('achievements-changed'));
    return true;
  }

  function findDef(code) {
    for (const cat of Object.values(defs)) {
      const f = cat.items.find(i => i.code === code);
      if (f) return f;
    }
    return null;
  }

  function progress() {
    const total = Object.values(defs).reduce((n, c) => n + c.items.length, 0);
    const unlocked = load().length;
    return { unlocked, total };
  }

  // --- Toast (10s) -------
  function toast(msg) {
    let host = document.getElementById('toastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toastHost';
      host.style.position = 'fixed';
      host.style.right = '12px';
      host.style.bottom = '12px';
      host.style.display = 'grid';
      host.style.gap = '8px';
      host.style.zIndex = '9999';
      document.body.appendChild(host);
    }
    const card = document.createElement('div');
    card.textContent = msg;
    card.style.background = 'rgba(17,24,39,.95)';     
    card.style.color = '#e5e7eb';
    card.style.padding = '10px 12px';
    card.style.border = '1px solid rgba(255,255,255,.12)';
    card.style.borderRadius = '12px';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';
    card.style.fontSize = '.95rem';
    card.style.maxWidth = '280px';
    host.appendChild(card);
    setTimeout(() => card.remove(), 10000);
  }

  // --- Renderer for achievements.html --
  function render(container) {
    const root = (typeof container === 'string') ? document.querySelector(container) : container;
    if (!root) return;

    const listUnlocked = load();
    const unlockedSet = new Set(listUnlocked.map(a => a.code));

    const { unlocked, total } = progress();
    const head = root.querySelector('[data-ach-head]');
    if (head) head.textContent = `Achievements gained: ${unlocked}/${total}`;

    const grid = root.querySelector('[data-ach-grid]');
    if (!grid) return;
    grid.innerHTML = '';

    for (const [key, cat] of Object.entries(defs)) {
      const sec = document.createElement('section');
      sec.className = 'ach-cat';

      const h3 = document.createElement('h3');
      h3.className = 'ach-cat-title';
      h3.textContent = cat.title;
      sec.appendChild(h3);

      const ul = document.createElement('ul');
      ul.className = 'ach-grid';
      for (const item of cat.items) {
        const li = document.createElement('li');
        const unlockedNow = unlockedSet.has(item.code);
        li.className = 'ach-item' + (unlockedNow ? ' unlocked' : ' locked');

        li.innerHTML = `
          <div class="ach-icon">${item.icon || '🏆'}</div>
          <div class="ach-body">
            <div class="ach-name">${item.name}</div>
            <div class="ach-desc">${item.desc || ''}</div>
          </div>
        `;
        ul.appendChild(li);
      }
      sec.appendChild(ul);
      grid.appendChild(sec);
    }
  }

  // expose
  window.Ach = { defs, load, has, grant, progress, render };
})();

