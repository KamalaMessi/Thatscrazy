(() => {
 
  const panicBtn   = document.getElementById('panicBtn');
  const warningBox = document.getElementById('warning');
  const timerWrap  = document.getElementById('timerWrap');
  const bigTime    = document.getElementById('bigTime');
  const unitLabel  = document.getElementById('unitLabel');
  const statusLine = document.getElementById('statusLine');
  const expelContainer = document.getElementById('expelContainer');

  if (!panicBtn || !bigTime || !expelContainer) return;

  // state
  let phase = 'idle';
  let startTs = 0;
  const REAL_MS_TOTAL = 10 * 60 * 1000; // 10 min
  const DISPLAY_SECONDS_TOTAL = 3;      


  const messages = [
    "Its almost over!","loading...","unpacking files...","loading textures...",
    "installing dependencies...","reticulating splines...","compiling shaders...",
    "optimizing RAM (plz wait)...","loading your expulsion letter...",
    "checking Quantum License...","decrypting your excuses...","cleaning cache...",
   "what do we have here","Thats crazy!! 🤯","Loading your Harvard rejection letter...","rendering your seat...","rendering the principal's office",
   "defragmenting hopes and wishes...","measuring yo GPA...","checking principal's mood...","finding will to continue...","rebooting optimism...",
   "pretending everything is fine...","rendering suspense...","adding unnecessary loading text...","waiting for user to breathe...","enhancing dramatic tension...",
   "disabling unnecessary laws of physics...","rendering chinese scrolls...","loading Igor's calc damages...","teaching the CPU...","executing an SQL injection...","rendering 208 bus textures",
   "unpacking contamined locker...","THATS CRAZY BRO!!!","unloading a backpack with 278299 billions pounds of thiosulfate...","hide your phone","deleting your phone from existance...",
   "practicing the disappointed inhale...","polishing 'I’m not angry, just disappointed' tone...","rehearsing dramatic pause #1...","aligning eyebrows into Concern Mode...","measuring silence for maximum tension...",
   "compiling list of ‘students I need to talk to after this’...","frantof.","preloading uncomfortably long pause #2...","checking if students are pretending to listen...","uploading reminder that phones should be off...",
   "co ty kurwa robisz na tym ipadzie Max","deleting evil ipad from existance..."
  ];
  let msgTimer = 0;
  let unitMode = 's';
  let unitSwitchAt = 0;
  let chaosNextAt = 0;

  // expel buttons scheduling
  let nextExpelAt = 0;
  let expelIntervalMin = 4000;
  let expelIntervalMax = 7000;
  const activeExpel = new Set(); // track buttons active

  
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
      '🌀 chaos event','💾 saving logs','🧨 destrucion soon','🧯 not yet',
      '🤖 updating firmware','📡 buffering…','🧐 converting seconds','🧩 assembling parts',"⏳ loading...",
"📦 unpacking files",
"🖼️ loading textures",
"🛠️ installing dependencies",
"🌀 reticulating splines",
"🎛️ compiling shaders",
"🧠 optimizing RAM (plz wait)",
"📄 loading your expulsion letter",
"🪐 checking Quantum License",
"🔐 decrypting your excuses",
"🧹 cleaning cache",
"👀 what do we have here",
"🤯 Thats crazy!! 🤯",
"📬 Loading your Harvard rejection letter",
"🎟️ rendering your seat",
"🏫 rendering the principal's office",
"💔 defragmenting hopes and wishes",
"📊 measuring yo GPA",
"😐 checking principal's mood",
"🫥 finding will to continue",
"🔄 rebooting optimism...",
"😶‍🌫️ pretending everything is fine",
"🎭 rendering suspense",
"📝 adding unnecessary loading text",
"💨 waiting for user to breathe",
"⚡ enhancing dramatic tension",
"🚫 disabling unnecessary laws of physics",
"📜 rendering chinese scrolls",
"📉 loading Igor's calc damages",
"🧑‍🏫 teaching the CPU",
"💥 executing an SQL injection",
"🚌 rendering 208 bus textures",
"🧪 unpacking contamined locker",
"🤯 THATS CRAZY BRO!!!",
"🎒 unloading a backpack with 278299 billions pounds of thiosulfate",
"📵 hide your phone",
"🗑️ deleting your phone from existance",
"😤 practicing the disappointed inhale",
"🧼 polishing 'I’m not angry, just disappointed' tone",
"⏸️ rehearsing dramatic pause #1",
"🫨 aligning eyebrows into Concern Mode",
"🔕 measuring silence for maximum tension",
"📋 compiling list of ‘students I need to talk to after this’",
"🐸 frantof.",
"⏳ preloading uncomfortably long pause #2",
"🧐 checking if students are pretending to listen",
"📢 uploading reminder that phones should be off",
"🤨 co ty kurwa robisz na tym ipadzie Max",
"🔥 deleting evil ipad from existance"

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
    unitMode = pick(['s','ms','ms','ns','ms','ns']);
  }

  function maybeNewStatus(now){
    if (now - msgTimer >= 2000){
      msgTimer = now;
      statusLine.textContent = pick(messages);
    }
  }

  // Expulsion buttons logic
  const expelLabels = [
    "expulsion letter", "principal visit", "lost rollbook",
    "attendance check", "parent call", "detention letter"
  ];

  // create one button element
  function createExpelButton(){
    const host = document.querySelector('.c3');
    if (!host) return null;
    const id = 'expel_' + Math.floor(Math.random()*1e9);
    const el = document.createElement('button');
    el.className = 'expel-btn';
    el.dataset.expelId = id;
    el.style.zIndex = 120;

    // label + countdown
    const label = document.createElement('div');
    label.textContent = pick(expelLabels);
    label.style.fontSize = '0.98rem';
    label.style.textTransform = 'capitalize';
    label.style.letterSpacing = '.02em';
    el.appendChild(label);

    const count = document.createElement('div');
    count.className = 'expel-count';
    count.textContent = '3';
    el.appendChild(count);

    // random position but avoid center
    const rect = host.getBoundingClientRect();
    const pad = 10;
    const w = Math.min(220, rect.width * 0.5);
    const h = 80;
    const left = Math.random() * (rect.width - w - pad*2) + pad;
    const top  = Math.random() * (rect.height - h - pad*2) + pad;

    
    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;

    // small shake
    el.style.animation = 'expel-shake 900ms ease-in-out infinite';

   
    el.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      removeExpelButton(id, true);
    });

    expelContainer.appendChild(el);
    activeExpel.add(id);

    // start 3second countdown
    startExpelCountdown(id, el, count);

    return id;
  }

  function removeExpelButton(id, clicked = false){
    const el = expelContainer.querySelector(`button[data-expel-id="${id}"]`);
    if (!el) return;
    activeExpel.delete(id);
    el.remove();
    if (clicked){
      // small visual confirmation
      // spawn agreen tick
      const tick = document.createElement('div');
      tick.textContent = '✓ saved';
      tick.style.position = 'absolute';
      tick.style.left = el.style.left;
      tick.style.top = el.style.top;
      tick.style.background = 'rgba(6, 95, 70, 0.9)';
      tick.style.padding = '6px 8px';
      tick.style.borderRadius = '8px';
      tick.style.color = '#dfffe6';
      tick.style.zIndex = 140;
      expelContainer.appendChild(tick);
      setTimeout(()=>tick.remove(), 900);
    }
  }

  function startExpelCountdown(id, el, countEl){
    const START = 3000; // ms
    const start = performance.now();
    function step(now){
      if (!activeExpel.has(id)) return; // removed
      const dt = now - start;
      const left = Math.max(0, 3 - Math.floor(dt/1000));
      countEl.textContent = left.toString();
      if (dt >= START){
        // failed: player didn't click (skill issue)
        failByExpulsion(id);
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function failByExpulsion(id){
    // remove all expel buttons
    for (const btnId of Array.from(activeExpel)) removeExpelButton(btnId, false);
    // hide timer and show fail overlay
    const host = document.querySelector('.c3');
    const overlay = document.createElement('div');
    overlay.className = 'c3-fail-overlay';
    overlay.innerHTML = `<div>You got kicked out of school.</div><div style="margin-top:12px;font-size:16px;font-weight:700;">Refresh to try again.</div>`;
    host.appendChild(overlay);

    
    phase = 'failed';
    
    if (timerWrap) timerWrap.hidden = true;
  }

  // schedule
  function scheduleNextExpel(now){
    nextExpelAt = now + rand(expelIntervalMin, expelIntervalMax);
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
      scheduleNextExpel(startTs);
      requestAnimationFrame(tick);
    }
  }

  // tick /loop
  function tick(now){
    if (phase !== 'counting') return;
    now = now ?? performance.now();
    const elapsedMs = now - startTs;
    const f = clamp(elapsedMs / REAL_MS_TOTAL, 0, 1);
    const remainingDisplaySec = DISPLAY_SECONDS_TOTAL * (1 - f);

    maybeFlipUnits(now);
    maybeNewStatus(now);
    if (now >= chaosNextAt){ chaosNextAt = now + rand(1800, 4200); spawnChaos(); }

    // spawn expel button if time
    if (now >= nextExpelAt){
      createExpelButton();
      scheduleNextExpel(now);
    }

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


  panicBtn.addEventListener('click', () => {
    if (phase === 'idle') setPhase('warning');
  });

  bigTime.innerHTML = renderTimeHTML(3);
  setUnitLabel();
  statusLine.textContent = '…';
})();
