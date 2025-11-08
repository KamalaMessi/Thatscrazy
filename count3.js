(() => {
 
  const panicBtn   = document.getElementById('panicBtn');
  const warningBox = document.getElementById('warning');
  const timerWrap  = document.getElementById('timerWrap');
  const bigTime    = document.getElementById('bigTime');
  const unitLabel  = document.getElementById('unitLabel');
  const statusLine = document.getElementById('statusLine');

  if (!panicBtn || !bigTime) return; 

  //state
  let phase = 'idle';
  let startTs = 0;
  const REAL_MS_TOTAL = 10 * 60 * 1000; // 10 min real
  const DISPLAY_SECONDS_TOTAL = 3;      

  // messages / chaos / units
  const messages = [
    "Its almost over!","loading...","unpacking files","loading textures",
    "installing dependencies","reticulating splines","compiling shaders",
    "optimizing RAM (pls wait)","loading your expulsion letter",
    "checking Quantum License","decrypting your excuses","cleaning cache… forever"
  ];
  let msgTimer = 0;
  let unitMode = 's';
  let unitSwitchAt = 0;
  let chaosNextAt = 0;

  
  const rand  = (a,b)=>Math.random()*(b-a)+a;
  const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
  const pick  = arr => arr[Math.floor(Math.random()*arr.length)];
  const pad2 = n => String(n).padStart(2,'0');
  const pad3 = n => String(n).padStart(3,'0');
  const pad6 = n => String(n).padStart(6,'0');

  function splitTimeParts(seconds){
    const s = Math.max(0, seconds);
    const totalMs = Math.floor(s * 1000);
    const mins = Math.floor(totalMs / 60000);
    const sec  = Math.floor((totalMs % 60000) / 1000);
    const ms   = totalMs % 1000;
    const ns6  = Math.floor(s * 1e9) % 1_000_000; 
    return { mins, sec, ms, ns6 };
  }

  function renderTimeHTML(seconds){
    const { mins, sec, ms, ns6 } = splitTimeParts(seconds);
    let html = `${pad2(mins)}:${pad2(sec)}.${pad3(ms)}`;
    if (unitMode === 'ns'){
      html += ` <span class="ns">${pad6(ns6)} ns</span>`;
    }
    return html;
  }

  function setUnitLabel(){
    unitLabel.textContent = (unitMode === 'ns') ? 'nanoseconds'
                         : (unitMode === 'ms') ? 'milliseconds'
                         : 'seconds';
  }

  function spawnChaos(){
    const host = document.querySelector('.c3');
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    const el = document.createElement('div');
    el.className = 'c3-fly';
    el.textContent = pick([
      '🧪 compiling anger…','⚠️ almost there','📦 unpacking 3','🧠 thinking really hard',
      '🌀 chaos event','💾 saving logs','🧨 dectrucion soon','🧯 not yet',
      '🤖 updating firmware','📡 buffering…','🧐 converting seconds','🧩 assembling parts','📎 Clippy is watching'
    ]);

    const x0 = rand(-50, w*0.2), y0 = rand(0, h*0.9);
    const x1 = rand(w*0.6, w+60), y1 = rand(0, h*0.9);
    el.style.setProperty('--x0', `${x0}px`);
    el.style.setProperty('--y0', `${y0}px`);
    el.style.setProperty('--x1', `${x1}px`);
    el.style.setProperty('--y1', `${y1}px`);
    el.style.setProperty('--rot0', `${rand(-20,20)}deg`);
    el.style.setProperty('--rot1', `${rand(-20,20)}deg`);
    el.style.animationDuration = `${rand(2500, 5000)}ms`;
    el.style.position = 'absolute';

    host.appendChild(el);
    setTimeout(()=>el.remove(), 6000);
  }

  function maybeFlipUnits(now){
    if (now < unitSwitchAt) return;
    unitSwitchAt = now + rand(1500, 6000);
    unitMode = pick(['s','ms','ms','ns','ms','ns']); // częściej ms/ns
  }

  function maybeNewStatus(now){
    if (now - msgTimer >= 2000){
      msgTimer = now;
      statusLine.textContent = pick(messages);
    }
  }

  //phases
  function setPhase(next){
    phase = next;
    if (phase === 'warning'){
      panicBtn.hidden = true;
      warningBox.hidden = false;
      timerWrap.hidden  = true;
      setTimeout(()=>setPhase('counting'), 4000);
    } else if (phase === 'counting'){
      warningBox.hidden = true;
      timerWrap.hidden  = false;
      startTs = performance.now();
      msgTimer = startTs;
      unitSwitchAt = startTs + rand(1200, 4200);
      chaosNextAt  = startTs + rand(1200, 3000);
      requestAnimationFrame(tick);
    }
  }

  // loop
  function tick(now){
    if (phase !== 'counting') return;

    now = now ?? performance.now(); // bezpiecznik
    const elapsedMs = now - startTs;
    const f = clamp(elapsedMs / REAL_MS_TOTAL, 0, 1);
    const remainingDisplaySec = DISPLAY_SECONDS_TOTAL * (1 - f); 

    maybeFlipUnits(now);
    maybeNewStatus(now);
    if (now >= chaosNextAt){ chaosNextAt = now + rand(1800, 4200); spawnChaos(); }

    setUnitLabel();
    bigTime.innerHTML = renderTimeHTML(remainingDisplaySec);

    if (f >= 1){
      unitMode = 's';
      setUnitLabel();
      bigTime.innerHTML = renderTimeHTML(0);
      statusLine.textContent = "…done. You made it to zero.";
      return;
    }
    requestAnimationFrame(tick);
  }

  // events (fortnite event)
  panicBtn.addEventListener('click', () => {
    if (phase === 'idle') setPhase('warning');
  });

  // stan poczatkowy
  bigTime.innerHTML = renderTimeHTML(3);  // 00:03.000
  setUnitLabel();
  statusLine.textContent = '…';
})();

