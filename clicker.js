  (() => {
  const $ = sel => document.querySelector(sel);
  const scoreEl = $('#score');
  const field = $('#playground');
  const btn = $('#freakBtn');
  const decoyMount = $('#decoyMount');

  let score = 0;
  let clicks = 0;
  let lastMischief = null;
  let centerPos = null;
  let trueBlockedUntil = 0;

  const namePool = [
    "FREAK ME!","freakster","try harder gng","skill issue",
    "blud CANT play ts","click me and youre gay","what is happening",
    "THATS CRAZY","dawng ts crazy…", "FREACARIOUS", "Thats crazy man", "SKILL ISSUE"
  ];

  /*** MISCHIEFS ***/
  const M = {
    TELEPORT:'TELEPORT',
    TRUE_BLOCK:'TRUE_BLOCK',
    RAINBOW:'RAINBOW',
    HELI:'HELI',
    NAME_SWAP:'NAME_SWAP',
    FAKE_BLOCK:'FAKE_BLOCK',
    DECOY_PAIR:'DECOY_PAIR',
    JITTER:'JITTER',          // drobne drgania 2s
    DODGE:'DODGE',            // ucieka od kursora 5s
    BOUNCE:'BOUNCE',          // odbijanie po arenie 3s
    SIZE_WARP:'SIZE_WARP',    // rośnie/maleje przez chwilę
    GHOST_CLONE:'GHOST_CLONE',// szary przycisk-duch (kradnie klik)
    CONFETTI_SPAM:'CONFETTI'  // spawner latających emoji
  };

  const pool = [
    M.TELEPORT, M.TRUE_BLOCK, M.RAINBOW, M.HELI, M.NAME_SWAP, M.FAKE_BLOCK, M.DECOY_PAIR,
    M.JITTER, M.DODGE, M.BOUNCE, M.SIZE_WARP, M.GHOST_CLONE, M.CONFETTI_SPAM
  ];

  function pickMischief(){
    const choices = pool.filter(x => x !== lastMischief);
    const pick = choices[Math.floor(Math.random()*choices.length)];
    lastMischief = pick;
    return pick;
  }

  function updateScore(){ scoreEl.textContent = score; }

  function rememberCenter(){
    const r = field.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const left = (r.width - b.width)/2;
    const top  = (r.height - b.height)/2;
    centerPos = { left, top };
    setPos(btn, left, top);
  }

  function rand(a,b){ return Math.random()*(b-a)+a; }
  function rint(a,b){ return Math.floor(rand(a,b+1)); }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

  function setPos(el, left, top){
    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;
  }

  /** helpers **/
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function shake(){ field.classList.add('shake'); setTimeout(()=>field.classList.remove('shake'), 350); }
  function spawnFloat(x,y,txt){
    const s = document.createElement('div');
    s.className = 'fly';
    s.textContent = txt;
    s.style.left = `${x}px`;
    s.style.top  = `${y}px`;
    field.appendChild(s);
    setTimeout(()=>s.remove(), 3600);
  }

  /*** EFFECTS IMPLEMENTATION ***/

  async function doTeleport(){
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    for(let i=0;i<5;i++){
      const maxL = rect.width - br.width;
      const maxT = rect.height - br.height;
      const left = clamp(rand(0,maxL),0,maxL);
      const top  = clamp(rand(0,maxT),0,maxT);
      setPos(btn, left, top);
      await sleep(260);
    }
    if (centerPos) setPos(btn, centerPos.left, centerPos.top);
  }

  async function doTrueBlock(){
    trueBlockedUntil = performance.now() + 3000;
    btn.classList.add('btn-disabled');
    await sleep(3000);
    btn.classList.remove('btn-disabled');
  }

  async function doRainbow(){ btn.classList.add('btn-rainbow'); await sleep(3000); btn.classList.remove('btn-rainbow'); }
  async function doHeli(){ btn.classList.add('btn-spin'); await sleep(1200); btn.classList.remove('btn-spin'); if (centerPos) setPos(btn, centerPos.left, centerPos.top); }
  async function doNameSwap(){ const base=btn.textContent; let pick=namePool[Math.floor(Math.random()*namePool.length)]; if(pick===base) pick="what is happening"; btn.textContent=pick; await sleep(3000); btn.textContent="FREAK ME!"; }
  async function doFakeBlock(){ btn.classList.add('btn-fakeblocked'); await sleep(3000); btn.classList.remove('btn-fakeblocked'); }

  // two decoys (green resets)
  async function doDecoyPair(){
    let wrap = decoyMount.querySelector('.decoys');
    if (!wrap){ wrap = document.createElement('div'); wrap.className='decoys'; decoyMount.appendChild(wrap); }
    const green = document.createElement('button'); green.className='btn-decoy green'; green.textContent="Do NOT touch me";
    const red   = document.createElement('button'); red.className='btn-decoy red';   red.textContent="FREAK ME!";
    const remove = ()=>{ green.remove(); red.remove(); };
green.onclick = () => {
  // reset score on green click
  if (score >= 200 && window.Ach) Ach.grant('clicker_reset_200_green');
  score = 0; updateScore();
  shake();
  remove();
};

  

    red.onclick   = ()=>{ doMainClick(); remove(); };
    wrap.append(green, red);
    setTimeout(remove, 6000);
  }

  // tiny run for 2s cuttie
  async function doJitter(){
    btn.classList.add('btn-trail');
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const maxL = rect.width - br.width, maxT = rect.height - br.height;
    const tEnd = performance.now() + 2000;
    while (performance.now() < tEnd){
      const curL = parseFloat(btn.style.left||"0");
      const curT = parseFloat(btn.style.top ||"0");
      const left = clamp(curL + rand(-20,20), 0, maxL);
      const top  = clamp(curT + rand(-20,20), 0, maxT);
      setPos(btn,left,top);
      await sleep(60);
    }
    btn.classList.remove('btn-trail');
    if (centerPos) setPos(btn, centerPos.left, centerPos.top);
  }

  // run from cursor for 5s lolz
  async function doDodge(){
    let active = true;
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const maxL = rect.width - br.width, maxT = rect.height - br.height;

    function onMove(e){
      // cursor position relative to field
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const bx = parseFloat(btn.style.left||"0") + br.width/2;
      const by = parseFloat(btn.style.top ||"0") + br.height/2;
      const dx = bx - cx, dy = by - cy;
      const dist = Math.hypot(dx,dy) || 1;
      if (dist < 140){ // repel when near
        const nx = dx/dist, ny = dy/dist;
        const left = clamp(parseFloat(btn.style.left||"0") + nx*14, 0, maxL);
        const top  = clamp(parseFloat(btn.style.top ||"0") + ny*14, 0, maxT);
        setPos(btn,left,top);
      }
    }
    field.addEventListener('mousemove', onMove);
    await sleep(5000);
    field.removeEventListener('mousemove', onMove);
    if (centerPos) setPos(btn, centerPos.left, centerPos.top);
  }

  // bounce around for 3s cuz bouncy freakcarious
  async function doBounce(){
    btn.classList.add('btn-bounce');
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    let vx = rand(-3,3) || 2.2, vy = rand(-3,3) || -2.0;
    let left = parseFloat(btn.style.left||"0");
    let top  = parseFloat(btn.style.top ||"0");
    const maxL = rect.width - br.width, maxT = rect.height - br.height;
    const end = performance.now() + 3000;
    while (performance.now() < end){
      left += vx*4; top += vy*4;
      if (left<=0 || left>=maxL){ vx*=-1; left = clamp(left,0,maxL); shake(); }
      if (top <=0 || top >=maxT){ vy*=-1; top  = clamp(top,0,maxT); shake(); }
      setPos(btn,left,top);
      await sleep(16);
    }
    btn.classList.remove('btn-bounce');
    if (centerPos) setPos(btn, centerPos.left, centerPos.top);
  }

  // size up/down for 3s
  async function doSizeWarp(){
    const orig = btn.style.transform || '';
    btn.style.transform = 'scale(1.35)';
    await sleep(900);
    btn.style.transform = 'scale(0.75)';
    await sleep(900);
    btn.style.transform = orig;
  }

  // grey ghost button that steals a click (no score)
  async function doGhostClone(){
    const ghost = document.createElement('button');
    ghost.className = 'btn-ghostfake';
    ghost.textContent = "FREAK ME?";
    const rect = field.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const maxL = rect.width - br.width;
    const maxT = rect.height - br.height;
    setPos(ghost, clamp(rand(0,maxL),0,maxL), clamp(rand(0,maxT),0,maxT));
    ghost.onclick = () => {
      // steal click → minus 1 (nie schodź poniżej 0)
      score = Math.max(0, score - 1);
      updateScore();
      spawnFloat(parseFloat(ghost.style.left||"0"), parseFloat(ghost.style.top||"0"), "−1");
      ghost.remove();
      shake();
    };
    field.appendChild(ghost);
    setTimeout(()=>ghost.remove(), 4500);
  }

  // spam distractors for 6s
  async function doConfetti(){
    const emo = ["🔥","💀","🤡","👿","💔","🥀","⚠️","😛","🍆","🤑","💵","🚑","💞","🎺"];
    const end = performance.now() + 6000;
    while (performance.now() < end){
      const x = rint(16, field.clientWidth-32);
      const y = rint(60, field.clientHeight-32);
      spawnFloat(x,y, emo[rint(0,emo.length-1)]);
      await sleep(rint(120,240));
    }
  }

  /** MAIN CLICK **/
  function doMainClick(){
    if (performance.now() < trueBlockedUntil) return;
     
    score++; clicks++; updateScore();
    if (score >= 1000 && window.Ach && !Ach.has('clicker_score_1000')) {
  Ach.grant('clicker_score_1000');
      
if (window.Ach) {
  if (score >= 1600 && !Ach.has('clicker_score_1600'))   Ach.grant('clicker_score_1600');
  if (score >= 10000 && !Ach.has('clicker_score_10000')) Ach.grant('clicker_score_10000');
}

}


    // +1 and tiny floating +1
    score++; clicks++; updateScore();
    const br = btn.getBoundingClientRect();
    spawnFloat(br.left - field.getBoundingClientRect().left + br.width/2,
               br.top  - field.getBoundingClientRect().top  - 8, "+1");

    // every 9th click shake arena
    if (clicks % 9 === 0) shake();

    // every 3rd → chaos
    if (clicks % 3 === 0){
      const act = pickMischief();
      switch (act){
        case M.TELEPORT:       doTeleport();      break;
        case M.TRUE_BLOCK:     doTrueBlock();     break;
        case M.RAINBOW:        doRainbow();       break;
        case M.HELI:           doHeli();          break;
        case M.NAME_SWAP:      doNameSwap();      break;
        case M.FAKE_BLOCK:     doFakeBlock();     break;
        case M.DECOY_PAIR:     doDecoyPair();     break;
        case M.JITTER:         doJitter();        break;
        case M.DODGE:          doDodge();         break;
        case M.BOUNCE:         doBounce();        break;
        case M.SIZE_WARP:      doSizeWarp();      break;
        case M.GHOST_CLONE:    doGhostClone();    break;
        case M.CONFETTI_SPAM:  doConfetti();      break;
      }
    }
  }

  // wire up (ahhh... a wire...)
  btn.addEventListener('click', doMainClick);
  window.addEventListener('load', rememberCenter);
  window.addEventListener('resize', rememberCenter);
})();

