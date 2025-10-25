(() => {
  // World
  const world = document.getElementById('world');
  const playerEl = document.getElementById('player');
  const legend = document.getElementById('legend');
  const remapInEl = document.getElementById('remapIn');

  // Physics
  const g = -0.8;       // gravity (falls...?)
  const moveSpeed = 3.2;
  const jumpVy = 13.5; //jump velo
  const maxVx = 5;

  const worldRect = () => world.getBoundingClientRect();

  // Player state
  let p = { x: 24, y: 24, vx: 0, vy: 0, w: 28, h: 28, onGround: false };
  let keysDown = new Set();

  // Platforms
  const plats = Array.from(world.querySelectorAll('.pf__platform')).map(el => {
    const s = getComputedStyle(el);
    return {
      el,
      x: parseFloat(s.left),
      y: parseFloat(s.bottom),
      w: parseFloat(s.width),
      h: parseFloat(s.height)
    };
  });

  // Controls
  const ACTIONS = ['LEFT','RIGHT','JUMP','DOWN'];
  const KEYSET = ['W','A','S','D'];

  // Mapping
  let mapping = {};
  let remapEveryMs = 7000;
  let nextRemapAt = performance.now() + remapEveryMs;

  function randomMapping(){
    // random shuffle of bludz
    const shuffled = [...ACTIONS].sort(() => Math.random() - 0.5);
    mapping = { W:shuffled[0], A:shuffled[1], S:shuffled[2], D:shuffled[3] };
    renderLegend();
  }

  function renderLegend(){
    legend.innerHTML = '';
    for (const key of KEYSET){
      const div = document.createElement('div');
      div.className = 'keytag';
      div.innerHTML = `<span class="keycap">${key}</span> → ${mapping[key]}`;
      legend.appendChild(div);
    }
  }

  // handling
  window.addEventListener('keydown', (e) => {
    const k = e.key.toUpperCase();
    if (!['W','A','S','D'].includes(k)) return;
    e.preventDefault();
    keysDown.add(k);
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toUpperCase();
    if (!['W','A','S','D'].includes(k)) return;
    e.preventDefault();
    keysDown.delete(k);
  });

  function applyInput(){
    // reset
    let ax = 0;
    let wantJump = false;

    for (const k of keysDown){
      const act = mapping[k];
      if (act === 'LEFT')  ax -= moveSpeed;
      if (act === 'RIGHT') ax += moveSpeed;
      if (act === 'JUMP')  wantJump = true;
    
    }

    
    if (ax !== 0){
      p.vx += ax * 0.08;
    } else {
      // friction
      p.vx *= 0.88;
      if (Math.abs(p.vx) < 0.05) p.vx = 0;
    }
    p.vx = Math.max(-maxVx, Math.min(maxVx, p.vx));

    // jump
    if (wantJump && p.onGround){
      p.vy = jumpVy;
      p.onGround = false;
    }
  }

  function physicsStep(){
    // gravity (falls)
    p.vy += g;

    // integrate
    p.x += p.vx;
    p.y += p.vy;

    // world walls
    const wr = worldRect();
    const maxX = wr.width - p.w - 2;
    if (p.x < 2){ p.x = 2; p.vx *= -0.3; }
    if (p.x > maxX){ p.x = maxX; p.vx *= -0.3; }

    // collide with platforms
    let grounded = false;
    for (const t of plats){
      if (aabb(p.x,p.y,p.w,p.h, t.x,t.y,t.w,t.h)){
        
        if (p.vy <= 0 && (p.y + p.h) >= t.y && (p.y + p.h) <= t.y + 20){
          // landing on top
          p.y = t.y - p.h;
          p.vy = 0;
          grounded = true;
        } else if (p.vy > 0 && p.y <= t.y + t.h && p.y >= t.y - 20){
          // head bump
          p.y = t.y + t.h;
          p.vy = -2;
        } else {
          // side bump
          if (p.x + p.w/2 < t.x + t.w/2) p.x = t.x - p.w - 0.5;
          else p.x = t.x + t.w + 0.5;
          p.vx *= -0.2;
        }
      }
    }
    p.onGround = grounded;

    // death if falls (gravity falls..?) (i think bro saved the town)
    if (p.y < -120){
      world.classList.add('flash');
      setTimeout(()=>world.classList.remove('flash'), 260);
      respawn();
    }
  }

  function aabb(x1,y1,w1,h1, x2,y2,w2,h2){
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  function respawn(){
    p.x = 24; p.y = 24; p.vx = 0; p.vy = 0; p.onGround = false;
  }

  function render(){
    playerEl.style.left = `${p.x}px`;
    playerEl.style.bottom = `${p.y}px`;
  }

  function loop(){
    
    const remain = Math.max(0, Math.ceil((nextRemapAt - performance.now())/1000));
    remapInEl.textContent = remain;
    if (performance.now() >= nextRemapAt){
      randomMapping();
      nextRemapAt = performance.now() + remapEveryMs;
    }

    applyInput();
    physicsStep();
    render();
    requestAnimationFrame(loop);
  }

  
  randomMapping();
  nextRemapAt = performance.now() + remapEveryMs;
  requestAnimationFrame(loop);
})();

