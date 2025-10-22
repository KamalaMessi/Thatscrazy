(() => {
  const $ = sel => document.querySelector(sel);
  const scoreEl = $('#score');
  const field = $('#playground');
  const btn = $('#freakBtn');
  const decoyMount = $('#decoyMount');

  let score = 0;
  let clicks = 0;
  let lastMischief = null;
  let centerPos = null; // to return after stunts
  let trueBlockedUntil = 0; // timestamp when real block ends

  const namePool = [
    "FREAK ME!",
    "freakster",
    "try harder gng",
    "skill issue",
    "blud CANT play ts",
    "click me and youre gay",
    "what is happening",
    "THATS CRAZY",
    "dawng ts crazy…"
  ];

  // mischiefs to roll every 3rd click
  const MISCHIEF = {
    TELEPORT: 'TELEPORT',
    TRUE_BLOCK: 'TRUE_BLOCK',
    RAINBOW: 'RAINBOW',
    HELI: 'HELI',
    NAME_SWAP: 'NAME_SWAP',
    FAKE_BLOCK: 'FAKE_BLOCK',
    DECOY_PAIR: 'DECOY_PAIR'
  };

  const pool = [
    MISCHIEF.TELEPORT,
    MISCHIEF.TRUE_BLOCK,
    MISCHIEF.RAINBOW,
    MISCHIEF.HELI,
    MISCHIEF.NAME_SWAP,
    MISCHIEF.FAKE_BLOCK,
    MISCHIEF.DECOY_PAIR
  ];

  function pickMischief(){
    // avoid repeating the exact same trick twice in a row
    let choices = pool.filter(m => m !== lastMischief);
    const pick = choices[Math.floor(Math.random()*choices.length)];
    lastMischief = pick;
    return pick;
  }

  function updateScore(){
    scoreEl.textContent = score;
  }

  function rememberCenter(){
    // center within field
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const left = (rect.width - br.width)/2;
    const top  = (rect.height - br.height)/2;
    centerPos = { left, top };
    btn.style.left = `${left}px`;
    btn.style.top  = `${top}px`;
  }

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

  // === Mischief implementations ===

  // 1) Teleport randomly for a few hops
  async function doTeleport(){
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    for(let i=0;i<4;i++){
      const maxL = rect.width - br.width;
      const maxT = rect.height - br.height;
      const left = clamp(rand(0, maxL), 0, maxL);
      const top  = clamp(rand(0, maxT), 0, maxT);
      btn.style.left = `${left}px`;
      btn.style.top  = `${top}px`;
      await sleep(350);
    }
    // return to center
    if (centerPos) {
      btn.style.left = `${centerPos.left}px`;
      btn.style.top  = `${centerPos.top}px`;
    }
  }

  // 2) True block for 3s (grey + not-allowed + no clicks)
  async function doTrueBlock(){
    trueBlockedUntil = performance.now() + 3000;
    btn.classList.add('btn-disabled');
    await sleep(3000);
    btn.classList.remove('btn-disabled');
  }

  // 3) Rainbow glow for 3s
  async function doRainbow(){
    btn.classList.add('btn-rainbow');
    await sleep(3000);
    btn.classList.remove('btn-rainbow');
  }

  // 4) Helicopter spin then back to center
  async function doHeli(){
    btn.classList.add('btn-spin');
    await sleep(1200);
    btn.classList.remove('btn-spin');
    if (centerPos) {
      btn.style.left = `${centerPos.left}px`;
      btn.style.top  = `${centerPos.top}px`;
    }
  }

  // 5) Change label to random funny name for a bit
  async function doNameSwap(){
    const curr = btn.textContent;
    let picked = namePool[Math.floor(Math.random()*namePool.length)];
    // avoid immediate duplicate
    if (picked === curr) picked = "what is happening";
    btn.textContent = picked;
    await sleep(3000);
    btn.textContent = "FREAK ME!";
  }

  // 6) Fake block: looks blocked (cursor), but still clickable
  async function doFakeBlock(){
    btn.classList.add('btn-fakeblocked');
    await sleep(3000);
    btn.classList.remove('btn-fakeblocked');
  }

  // 7) Spawn decoy pair (green resets score if clicked)
  async function doDecoyPair(){
    // mount container if not exists
    let wrap = decoyMount.querySelector('.decoys');
    if (!wrap){
      wrap = document.createElement('div');
      wrap.className = 'decoys';
      decoyMount.appendChild(wrap);
    }

    // green decoy
    const green = document.createElement('button');
    green.className = 'btn-decoy green';
    green.textContent = "Do NOT touch me";

    const red = document.createElement('button');
    red.className = 'btn-decoy red';
    red.textContent = "FREAK ME!";

    const removeAll = () => {
      green.remove();
      red.remove();
    };

    green.addEventListener('click', () => {
      // reset score on green click
      score = 0; updateScore();
      removeAll();
    });
    red.addEventListener('click', () => {
      // clicking red here also counts as a click
      doMainClick();
      removeAll();
    });

    wrap.appendChild(green);
    wrap.appendChild(red);

    // Auto remove in 5s if untouched
    setTimeout(removeAll, 5000);
  }

  // helper sleep
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  // main click handler
  function doMainClick(){
    // if truly blocked, ignore
    if (performance.now() < trueBlockedUntil) return;

    score++;
    clicks++;
    updateScore();

    // every 3rd click → mischief
    if (clicks % 3 === 0){
      const act = pickMischief();
      switch(act){
        case MISCHIEF.TELEPORT:   doTeleport();    break;
        case MISCHIEF.TRUE_BLOCK: doTrueBlock();   break;
        case MISCHIEF.RAINBOW:    doRainbow();     break;
        case MISCHIEF.HELI:       doHeli();        break;
        case MISCHIEF.NAME_SWAP:  doNameSwap();    break;
        case MISCHIEF.FAKE_BLOCK: doFakeBlock();   break;
        case MISCHIEF.DECOY_PAIR: doDecoyPair();   break;
      }
    }
  }

  // wire up
  btn.addEventListener('click', doMainClick);

  // initial center calc after layout
  window.addEventListener('load', rememberCenter);
  window.addEventListener('resize', rememberCenter);
})();
