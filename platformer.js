(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('pScore');
  const mapEl = document.getElementById('pMap');

  // World
  const W = canvas.width, H = canvas.height;
  const GRAV = 0.7, FRICTION = 0.85, MOVE = 0.8, JUMP = 12;
  let paused = false;

  // Player
  const p = { x: 100, y: 360, w: 28, h: 38, vx: 0, vy: 0, onGround: false, color: '#60a5fa' };

  // Platforms
  const plats = [
    { x:0,   y:H-40, w:W,   h:40 },
    { x:120, y:380,  w:160, h:16 },
    { x:360, y:320,  w:160, h:16 },
    { x:620, y:360,  w:160, h:16 },
    { x:520, y:260,  w:130, h:16 },
  ];

  // Dots + anti-cluster
  let score = 0;
  const dots = [];
  const recentSpawns = []; 
  function rememberSpawn(x,y){
    recentSpawns.push({x,y,ts: performance.now()});
    if (recentSpawns.length > 8) recentSpawns.shift();
  }

  function spawnDotOnPlatform(preferX = null, avoid = []){
    const r = 7;
    const EDGE = 14;
    const MIN_HOVER = 14;
    const MAX_HOVER = 70;
    const MIN_DOT_DIST = 28;
    const FAR_FROM_RECENT = 180;
    const FAR_FROM_AVOID  = 220;

    
    const platOrder = plats.slice().sort(() => Math.random() - 0.5);
    
    platOrder.sort((a,b) => {
      if (preferX == null) return 0;
      const da = Math.abs(preferX - (a.x + a.w/2));
      const db = Math.abs(preferX - (b.x + b.w/2));
      return db - da;
    });

    const farFromRecent = (x,y) => {
      for (const p of recentSpawns){
        const dx = p.x - x, dy = p.y - y;
        if (dx*dx + dy*dy < FAR_FROM_RECENT*FAR_FROM_RECENT) return false;
      }
      return true;
    };

    const farFromAvoid = (x,y) => {
      for (const a of avoid){
        const need = a.min || FAR_FROM_AVOID;
        const dx = (a.x ?? 0) - x, dy = (a.y ?? 0) - y;
        if (dx*dx + dy*dy < need*need) return false;
      }
      return true;
    };

    function spotFree(x,y){
      // no colision
      for (const d of dots){
        const dx = d.x - x, dy = d.y - y;
        if (dx*dx + dy*dy < MIN_DOT_DIST*MIN_DOT_DIST) return false;
      }
      // not in platforms
      for (const pl of plats){
        if (x+r > pl.x && x-r < pl.x+pl.w){
          if (y + r > pl.y - 3 && y - r < pl.y + pl.h + 3) return false;
        }
      }
      // in borders
      if (x - r < 0 || x + r > W || y - r < 0 || y + r > H) return false;

      
      if (!farFromRecent(x,y)) return false;
      if (!farFromAvoid(x,y))  return false;

      return true;
    }

    for (let tries = 0; tries < 120; tries++){
      const pl = platOrder[tries % platOrder.length];

      const minX = pl.x + EDGE + r;
      const maxX = pl.x + pl.w - EDGE - r;
      if (maxX <= minX) continue;

      const x = Math.random() * (maxX - minX) + minX;
      const hover = Math.random() * (MAX_HOVER - MIN_HOVER) + MIN_HOVER;
      const y = pl.y - hover;

      if (!spotFree(x,y)) continue;

      dots.push({ x, y, r, hue: Math.floor(Math.random()*360), born: performance.now() });
      rememberSpawn(x,y);
      return;
    }

    // Fallback
    const edgePlat = platOrder[0];
    const safeX = Math.min(Math.max((preferX ?? (edgePlat.x + edgePlat.w/2)), edgePlat.x + 20), edgePlat.x + edgePlat.w - 20);
    const y = edgePlat.y - 40;
    dots.push({ x: safeX, y, r, hue: Math.floor(Math.random()*360), born: performance.now() });
    rememberSpawn(safeX,y);
  }

  function isReachable(dot){
    const MAX_HOVER = 70;
    for (const pl of plats){
      if (dot.x >= pl.x && dot.x <= pl.x + pl.w){
        const hover = pl.y - dot.y;
        if (hover >= 14 && hover <= MAX_HOVER) return true;
      }
    }
    return false;
  }

  function respawnOldUnreachableDots(){
    const now = performance.now();
    for (let i = dots.length - 1; i >= 0; i--){
      const d = dots[i];
      if (now - d.born > 15000 && !isReachable(d)){
        dots.splice(i,1);
        spawnDotOnPlatform(p.x + p.w/2);
      }
    }
  }

  // start: 8
  for (let i=0;i<8;i++) spawnDotOnPlatform();

  // Controls
  const ACTIONS = ['JUMP','LEFT','DOWN','RIGHT'];
  let keyDown = { w:false, a:false, s:false, d:false, space:false };
  let keymap = {};
  const REMAP_MS = 7000;
  let lastRemap = 0;

  function shuffleRemap(){
    const acts = ACTIONS.slice().sort(()=>Math.random()-0.5);
    keymap = { w:acts[0], a:acts[1], s:acts[2], d:acts[3] };
    lastRemap = performance.now();
    renderMap();
    showCornerToast("Controls shuffle!");
  }

  function renderMap(){
    const nice = (k) => k.toUpperCase();
    mapEl.textContent =
      `${nice('w')} → ${keymap.w} • ${nice('a')} → ${keymap.a} • ${nice('s')} → ${keymap.s} • ${nice('d')} → ${keymap.d}`;
  }

  function showCornerToast(msg){
    const host = document.createElement('div');
    host.className = 'plat-toast';
    host.textContent = msg;
    const rect = canvas.getBoundingClientRect();
    host.style.position = 'fixed';
    host.style.left = `${rect.left + rect.width - 120}px`;
    host.style.top  = `${rect.top + 20}px`;
    host.style.zIndex = '999';
    document.body.appendChild(host);
    setTimeout(()=>host.remove(), 2000);
  }

  // Input
  window.addEventListener('keydown', (e)=>{
    const k = e.key.toLowerCase();
    if (k === ' ') { paused = !paused; return; }
    if (k in keyDown) keyDown[k] = true;
  });
  window.addEventListener('keyup', (e)=>{
    const k = e.key.toLowerCase();
    if (k in keyDown) keyDown[k] = false;
  });

  // Helpers
  function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
    return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
  }

  function resolveCollisions(){
    p.onGround = false;
    p.y += p.vy;
    for(const pl of plats){
      if (rectsOverlap(p.x,p.y,p.w,p.h, pl.x,pl.y,pl.w,pl.h)){
        if (p.vy > 0){ p.y = pl.y - p.h; p.vy = 0; p.onGround = true; }
        else if (p.vy < 0){ p.y = pl.y + pl.h; p.vy = 0; }
      }
    }

    p.x += p.vx;
    for(const pl of plats){
      if (rectsOverlap(p.x,p.y,p.w,p.h, pl.x,pl.y,pl.w,pl.h)){
        if (p.vx > 0){ p.x = pl.x - p.w; p.vx = 0; }
        else if (p.vx < 0){ p.x = pl.x + pl.w; p.vx = 0; }
      }
    }
    if (p.x < 0){ p.x=0; p.vx=0; }
    if (p.x > W-p.w){ p.x=W-p.w; p.vx=0; }
    if (p.y > H-p.h){ p.y=H-p.h; p.vy=0; p.onGround=true; }
  }

  function applyControls(){
    const act = (name) => {
      const k = Object.keys(keymap).find(k=>keymap[k]===name);
      return k ? keyDown[k] : false;
    };
    if (act('LEFT'))  p.vx -= MOVE;
    if (act('RIGHT')) p.vx += MOVE;
    if (act('JUMP') && p.onGround){ p.vy = -JUMP; p.onGround = false; }
    if (act('DOWN') && !p.onGround){ p.vy += 0.8; }
  }

  function update(){
    if (paused) return;

    respawnOldUnreachableDots();

    if (performance.now() - lastRemap >= REMAP_MS) shuffleRemap();

    applyControls();

    p.vx *= FRICTION;
    p.vy += GRAV;
    resolveCollisions();

    // collect dots
    for (let i=dots.length-1;i>=0;i--){
      const d = dots[i];
      const cx = p.x + p.w/2, cy = p.y + p.h/2;
      const dx = d.x - cx, dy = d.y - cy;
      if (dx*dx + dy*dy <= (d.r + Math.max(p.w,p.h)/2)**2){
        dots.splice(i,1);
        score++; scoreEl.textContent = score;

        // respawn daleko od poprzedniego miejsca i gracza
        spawnDotOnPlatform(
          null,
          [
            { x: d.x, y: d.y, min: 260 },
            { x: p.x + p.w/2, y: p.y, min: 220 }
          ]
        );

        if (window.Ach && score >= 30 && !Ach.has('platformer_score_30')) {
          Ach.grant('platformer_score_30');
        }
      }
    }
  } 

  function draw(){
    ctx.clearRect(0,0,W,H);

    ctx.fillStyle = '#0b1224'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0;x<W;x+=40){ ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=0;y<H;y+=40){ ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();

    ctx.fillStyle = '#1f2937';
    plats.forEach(pl => ctx.fillRect(pl.x, pl.y, pl.w, pl.h));

    dots.forEach(d => {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${d.hue} 90% 60%)`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    const t = Math.min(1, (performance.now() - lastRemap) / REMAP_MS);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(0, 0, W*(1-t), 4);
  }

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // init
  shuffleRemap();
  loop();
})();

