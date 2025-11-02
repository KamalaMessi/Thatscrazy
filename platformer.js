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
      { x:0, y:H-40, w:W, h:40 },
      { x:120, y:380, w:160, h:16 },
      { x:360, y:320, w:160, h:16 },
      { x:620, y:360, w:160, h:16 },
      { x:520, y:260, w:130, h:16 },
    ];
  
  
// Dots
let score = 0;
const dots = [];

function spawnDotOnPlatform(preferX = null){
  // small idk how is that called in eng promien
  const r = 7;
  const edgeMargin = 12;

  
  const pickPlat = () => {
    if (preferX == null) return plats[Math.floor(Math.random()*plats.length)];
   
    let best = plats[0], bestDist = Math.abs(preferX - (plats[0].x + plats[0].w/2));
    for (const pl of plats){
      const cx = pl.x + pl.w/2;
      const d = Math.abs(preferX - cx);
      if (d < bestDist){ best = pl; bestDist = d; }
    }
    return best;
  };

  for (let tries = 0; tries < 50; tries++){
    const pl = pickPlat();
    const minX = pl.x + edgeMargin + r;
    const maxX = pl.x + pl.w - edgeMargin - r;
    if (maxX <= minX) continue; 

    const x = Math.random() * (maxX - minX) + minX;
    const y = pl.y - r - 2; // idk i copied it from the internet

    
    let ok = true;
    for (const d of dots){
      const dx = d.x - x, dy = d.y - y;
      if (dx*dx + dy*dy < (d.r + r + 4)**2) { ok = false; break; }
    }
    if (!ok) continue;

    dots.push({ x, y, r, hue: Math.floor(Math.random()*360), born: performance.now() });
    return;
  }
}

// start with 8 dots
for (let i=0;i<8;i++) spawnDotOnPlatform();

  
    // Controls
    const ACTIONS = ['JUMP','LEFT','DOWN','RIGHT'];
    const KEYS = ['w','a','s','d']; 
    let keyDown = { w:false, a:false, s:false, d:false, space:false };
    // keys
    let keymap = {};
    const REMAP_MS = 7000;
    let lastRemap = 0;
  
    function shuffleRemap(){
      // assign a random
      const acts = ACTIONS.slice().sort(()=>Math.random()-0.5);
      keymap = { w:acts[0], a:acts[1], s:acts[2], d:acts[3] };
      lastRemap = performance.now();
      renderMap();
      showCornerToast("Controls shuffle!");
    }
  
    function renderMap(){
      const nice = (k) => k.toUpperCase();
      mapEl.textContent = `${nice('w')} → ${keymap.w} • ${nice('a')} → ${keymap.a} • ${nice('s')} → ${keymap.s} • ${nice('d')} → ${keymap.d}`;
    }
  
    function showCornerToast(msg){
      
      const host = document.createElement('div');
      host.className = 'plat-toast';
      host.textContent = msg;
      
      const rect = canvas.getBoundingClientRect();
      host.style.left = `${rect.left + rect.width - 120}px`;
      host.style.top  = `${rect.top + 20}px`;
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
  
    // Helpers zeby sie nie rozwalilo
    function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
      return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
    }
    function collidesAny(x,y,w,h,list){ return list.some(pl => rectsOverlap(x,y,w,h, pl.x,pl.y,pl.w,pl.h)); }
  
    function resolveCollisions(){
      
      p.onGround = false;
      p.y += p.vy;
      for(const pl of plats){
        if (rectsOverlap(p.x,p.y,p.w,p.h, pl.x,pl.y,pl.w,pl.h)){
          if (p.vy > 0){ // falling
            p.y = pl.y - p.h; p.vy = 0; p.onGround = true;
          } else if (p.vy < 0){ // bonk!
            p.y = pl.y + pl.h; p.vy = 0;
          }
        }
      }
      
      p.x += p.vx;
      for(const pl of plats){
        if (rectsOverlap(p.x,p.y,p.w,p.h, pl.x,pl.y,pl.w,pl.h)){
          if (p.vx > 0){ p.x = pl.x - p.w; p.vx = 0; }
          else if (p.vx < 0){ p.x = pl.x + pl.w; p.vx = 0; }
        }
      }
      // borders
      if (p.x < 0){ p.x=0; p.vx=0; }
      if (p.x > W-p.w){ p.x=W-p.w; p.vx=0; }
      if (p.y > H-p.h){ p.y=H-p.h; p.vy=0; p.onGround=true; }
    }
  
    function applyControls(){
      
      const act = (name) => {
        const k = Object.keys(keymap).find(k=>keymap[k]===name);
        return k ? keyDown[k] : false;
      };
  
      // horizontal
      if (act('LEFT'))  p.vx -= MOVE;
      if (act('RIGHT')) p.vx += MOVE;
  
      // jump
      if (act('JUMP') && p.onGround){
        p.vy = -JUMP;
        p.onGround = false;
      }
  
      // down is fast fall
      if (act('DOWN') && !p.onGround){
        p.vy += 0.8;
      }
    }
  
    function update(){
      if (paused) return;
  
     
      if (performance.now() - lastRemap >= REMAP_MS) shuffleRemap();
  
      applyControls();
  
      // physics
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
          spawnDot();
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
  
      // platforms
      ctx.fillStyle = '#1f2937';
      plats.forEach(pl => ctx.fillRect(pl.x, pl.y, pl.w, pl.h));
  
      // dots
      dots.forEach(d => {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${d.hue} 90% 60%)`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
        ctx.fill();
      });
  
      // player
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
  
      // remap timer bar
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
  
