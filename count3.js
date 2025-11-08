(() => {
  const panicBtn   = document.getElementById('panicBtn');
  const warningBox = document.getElementById('warning');
  const timerWrap  = document.getElementById('timerWrap');
  const bigTime    = document.getElementById('bigTime');
  const unitLabel  = document.getElementById('unitLabel');
  const statusLine = document.getElementById('statusLine');

  // phases: idle -> warning(4s) -> counting(10min)
  let phase = 'idle';
  let startTs = 0;              // performance.now() when counting starts
  const REAL_MS_TOTAL = 10 * 60 * 1000; // 10 minutes
  const DISPLAY_SECONDS_TOTAL = 3;      // we count 3 -> 0
  // exact mapping: 600s real -> 3s fake => multiplier 3/600 = 0.005
  const REAL_TO_DISPLAY = DISPLAY_SECONDS_TOTAL / (REAL_MS_TOTAL / 1000); // 0.005

  // status messages every ~2s
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

  // silly units mode: s / ms / ns — flips randomly
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
    // seconds can be fractional; show based on unitMode
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
    // default seconds with 3 decimals
    unitLabel.textContent = 'seconds';
    const s = Math.max(0, seconds);
    return s.toFixed(3);
  }

