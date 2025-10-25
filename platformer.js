(() => {
  // World + DOM
  const world = document.getElementById('world');
  const playerEl = document.getElementById('player');
  const legend = document.getElementById('legend');
  const remapInEl = document.getElementById('remapIn');

  // Physics
  const g = -0.8;       // gravity (downwards, pixels/frame^2; negative because we use bottom)
  const moveSpeed = 3.2;
  const jumpVy = 13.5;  // initial jump velocity
  const maxVx = 5;

  const worldRect = () => world.getBoundingClientRect();

  // Player state (bottom/left coordinates in px, velocity in px/frame)
  let p = { x: 24, y: 24, vx: 0, vy: 0, w: 28, h: 28, onGround: false };
  let keysDown = new Set();

  // Platforms from DOM
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

  // Controls: actions we support
  const ACTIONS = ['LEFT','RIGHT','JUMP','DOWN'];
  const KEYSET = ['W','A','S','D'];

  // Mapping like { W:'JUMP', A:'LEFT', S:'DOWN', D:'RIGHT' }
  let mapping = {};
  let remapEveryMs = 7000;
  let nextRemapAt = performance.now() + remapEveryMs;

  function randomMapping(){
    // random permutation of KEYSET to ACTIONS
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

  // Input handling
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
    // reset horizontal acceleration each frame
    let ax = 0;
    let wantJump = false;

    for (const k of keysDown){
      const act = mapping[k];
      if (act === 'LEFT')  ax -= moveSpeed;
      if (act === 'RIGHT') ax += moveSpeed;
      if (act === 'JUMP')  wantJump = true;
      // DOWN is cosmetic here; you could add drop-through logic if you like
 
