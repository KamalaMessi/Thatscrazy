(() => {
  const panicBtn   = document.getElementById('panicBtn');
  const warningBox = document.getElementById('warning');
  const timerWrap  = document.getElementById('timerWrap');
  const bigTime    = document.getElementById('bigTime');
  const unitLabel  = document.getElementById('unitLabel');
  const statusLine = document.getElementById('statusLine');


  let phase = 'idle';
  let startTs = 0;             
  const REAL_MS_TOTAL = 10 * 60 * 1000; // 10 minutes
  const DISPLAY_SECONDS_TOTAL = 3;      

  const REAL_TO_DISPLAY = DISPLAY_SECONDS_TOTAL / (REAL_MS_TOTAL / 1000); // 0.005

  // status messages every 2s
  const messages = [
    "Its almost over!",
    "loading...",
    "unpacking files",
    "loading textures",
    "installing dependencies",
    "reticulating splines",
    "compiling shaders",
    "optimizing RAM (plz wait)",
    "loading your expulsion letter",
    "checking Quantum License",
    "decrypting your excuses",
    "cleaning cache…",
  ];
  let msgTimer = 0;

  // silly units mode, flips randomly
  let unitMode = 's';
  let unitSwitchAt = 0;

  // chaos spawner
  let chaosNextAt = 0;

  function setPhase(next) {
    phase = next;
    if (phase === 'warning') {
      panicBtn.hidden = true;
      warningBox.hidden = false;
      timerWrap.hidden  = true;
      setTimeout(() => setPhase('counting'), 4000);
    } else if (phase === 'counting') {
      warningBox.hidden = true;
      timerWrap.hidden  = false;
      startTs = performance.now();
      msgTimer = performance.now();
      unitSwitchAt = performance.now() + rand(1200, 4200);
      chaosNextAt  = performance.now() + rand(1200, 3000);
      requestAnimationFrame(tick);
    }
  }

  function rand(a,b){ return Math.random()*(b-a)+a; }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function formatDisplay(seconds){
 
    if (unitMode === 'ns'){
      const ns = Math.max(0, Math.round(seconds * 1e9));
      unitLabel.textContent = 'nanoseconds';
      return ns.toLocaleString();
    }
    if (unitMode === 'ms'){
      const ms = Math.max(0, Math.round(seconds * 1000));
      unitLabel.textContent = 'milliseconds';
      return `${ms.toLocaleString()}`;
    }
    // default seconds with 3 decimss
    unitLabel.textContent = 'seconds';
    const s = Math.max(0, seconds);
    return s.toFixed(3);
  }
  function setUnitLabel(){
  if (unitMode === 'ns') unitLabel.textContent = 'nanoseconds';
  else if (unitMode === 'ms') unitLabel.textContent = 'milliseconds';
  else unitLabel.textContent = 'seconds';
}


  function maybeFlipUnits(now){
    if (now < unitSwitchAt) return;
    unitSwitchAt = now + rand(1500, 6000);
    
    const pool = ['s','ms','ms','ns','ms','ns'];
    unitMode = pick(pool);
  }

  function maybeNewStatus(now){
    if (now - msgTimer >= 2000){
      msgTimer = now;
      statusLine.textContent = pick(messages);
    }
  }

  function spawnChaos(){
    const host = document.querySelector('.c3');
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    const el = document.createElement('div');
    el.className = 'c3-fly';
    el.textContent = pick([
      '🧪 compiling anger…',
      '⚠️ almost there',
      '📦 unpacking 3',
      '🧠 thinking really hard',
      '🌀 chaos event',
      '💾 saving logs',
      '🧨 boom soon',
      '🧯 not yet',
      '🤖 updating firmware',
      '📡 buffering…',
      '🧐 converting seconds',
      '🧩 assembling parts'
    ]);

    // random ahh path across the card
    const x0 = rand(-50, w*0.2), y0 = rand(0, h*0.9);
    const x1 = rand(w*0.6, w+60), y1 = rand(0, h*0.9);
    el.style.setProperty('--x0', `${x0}px`);
    el.style.setProperty('--y0', `${y0}px`);
    el.style.setProperty('--x1', `${x1}px`);
    el.style.setProperty('--y1', `${y1}px`);
    el.style.setProperty('--rot0', `${rand(-20,20)}deg`);
    el.style.setProperty('--rot1', `${rand(-20,20)}deg`);
    el.style.animationDuration = `${rand(2500, 5000)}ms`;

    host.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }

  function tick(now){
    if (phase !== 'counting') return;

    // progress irl
    const elapsedMs = now - startTs;
    const f = clamp(elapsedMs / REAL_MS_TOTAL, 0, 1);
    const remainingDisplaySec = DISPLAY_SECONDS_TOTAL * (1 - f); 

    // UI updates
    maybeFlipUnits(now);
    maybeNewStatus(now);
    if (now >= chaosNextAt){
      chaosNextAt = now + rand(1800, 4200);
      spawnChaos();
    }

    setUnitLabel();
bigTime.innerHTML = renderTimeHTML(remainingDisplaySec);


    if (f >= 1){
      // finished
      bigTime.textContent = (unitMode === 's') ? '0.000' : '0';
      statusLine.textContent = "…done. You made it to zero. Its over, lets see if principal is in school today.";
      return;
    }
    requestAnimationFrame(tick);
  }

  // entry
  panicBtn.addEventListener('click', () => {
    if (phase === 'idle') setPhase('warning');
  });

  // initial state
  bigTime.textContent = '3.000';
  unitLabel.textContent = 'seconds';
  statusLine.textContent = '…';
  bigTime.innerHTML = renderTimeHTML(3);  // 00:03.000
setUnitLabel();                         // secs for start

})();

function pad2(n){ return String(n).padStart(2,'0'); }
function pad3(n){ return String(n).padStart(3,'0'); }
function pad6(n){ return String(n).padStart(6,'0'); }

function splitTimeParts(seconds){

  const s = Math.max(0, seconds);
  const totalMs = Math.floor(s * 1000);
  const mins = Math.floor(totalMs / 60000);
  const sec  = Math.floor((totalMs % 60000) / 1000);
  const ms   = totalMs % 1000;

  // dolne 6 cyfr nanosekund
  const ns6  = Math.floor((s * 1e9)) % 1_000_000;
  return { mins, sec, ms, ns6 };
}

function renderTimeHTML(seconds){
  const { mins, sec, ms, ns6 } = splitTimeParts(seconds);
  // głowny zapis
  let html = `${pad2(mins)}:${pad2(sec)}.${pad3(ms)}`;

  // przy trybie ns
  if (unitMode === 'ns'){
    html += ` <span class="ns">${pad6(ns6)} ns</span>`;
  }
  return html;
}

