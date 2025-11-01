(() => {
  let plannedAtStart = 0; // seconds snapshot when start() is pressded

  const el = (id) => document.getElementById(id);

  const hInp = el("h");
  const mInp = el("m");
  const sInp = el("s");
  const startBtn = el("startBtn");
  const pauseBtn = el("pauseBtn");
  const resetBtn = el("resetBtn");
  const timeOut = el("timeOut");
  const unitsOut = el("unitsOut");
  const bar = el("bar");
  const hint = el("hint");

  
  let total = 30;          
  let startTs = 0;        
  let pausedAt = 0;        
  let running = false;

  
  const MODE_INTERVAL_MS = 4000;   
  let mode = "ACCEL";
  let modeSince = 0;
  let jumpOffset = 0;
  let nextJumpAt = 0;
  let unit = { name: "seconds", scale: 1 };

  const rand = (a,b) => Math.random()*(b-a)+a;
  const rint = (a,b) => Math.floor(rand(a,b+1));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function setTotalFromInputs(){
    const h = parseInt(hInp.value||"0",10) || 0;
    const m = parseInt(mInp.value||"0",10) || 0;
    const s = parseInt(sInp.value||"0",10) || 0;
    total = clamp(h,0,99)*3600 + clamp(m,0,59)*60 + clamp(s,0,59);
    if (total <= 0) total = 1;
    writeDisplay(total, total); 
  }

  function start(){
    setTotalFromInputs();
    plannedAtStart = total;
    startTs = performance.now();
    pausedAt = 0;
    running = true;
    pickMode(true);
    requestAnimationFrame(rafLoop);
  }

  function pause(){
    if (!running) return;
    running = false;
    pausedAt = performance.now() - startTs;
  }

  function reset(){
    running = false;
    pausedAt = 0;
    writeDisplay(total, total);
    hint.textContent = "…";
  }

  function resume(){
    if (running) return;
    startTs = performance.now() - (pausedAt||0);
    running = true;
    requestAnimationFrame(rafLoop);
  }

  function pickMode(initial = false){
    const prev = mode;
    
    let pool = ["UNITS","UNITS","ACCEL","SLOW","JUMP","REVERSE"].filter(m => m !== prev);
    mode = pool[Math.floor(Math.random()*pool.length)];

    modeSince = performance.now();
    jumpOffset = 0;
    nextJumpAt = rand(1500, 3500);

    if (mode === "UNITS"){
      const choices = [
        {name:"nanoseconds", scale: 1e9},
        {name:"faux-seconds", scale: 0.73},
        {name:"light years (Thats crazy! 🤯)", scale: 1/(60*60*24*365 * 3.154e7)},
        {name:"hyperquantum-seconds", scale: 1e-6},
        {name:"hold on lol idk whats ts", scale: 2.71828},
        {name:"polskie 🇵🇱 sekundy, thats crazy...", scale: 1/1800},
      ];
      unit = choices[Math.floor(Math.random()*choices.length)];
    } else {
      unit = { name: "seconds", scale: 1 };
    }

    if (!initial) {
      const msgs = [
        "Idk how to fix ts, sorry gang 🙏",
        "how is it going so far?",
        "Congratufuckinglations: You deleted quantum time! Thats Crazy!",
        "Calculate the square quantinum of the current second on my EVIL calc 🙏",
        "We left the Omniverse now, can we stop?",
        "what do we have here ahh",
        "Thats CRAZY 🤯",
        "what is happening",
        "alr hold on ima fix ts",
        "Harvard look at my timer, can yall accept me now?",
        "you just left time's archiverse, what now lol",
        "hold on i think i know whats wrong",
        "nah i made it worse 💔",
        "i think we can stop studying now...? 🙏"
      ];
      hint.textContent = msgs[rint(0, msgs.length-1)];
    }
  }

  
  function mapByMode(trueRem){
    const tMode = performance.now() - modeSince;
    const f = 1 - trueRem/total; 

    switch(mode){
      case "ACCEL": {
        const factor = 1 + 3 * Math.pow(tMode/10000, 2);
        const f2 = clamp(f * factor, 0, 1);
        return total * (1 - f2);
      }
      case "SLOW": {
        const f2 = Math.pow(f, 1.8);
        return total * (1 - f2);
      }
      case "JUMP": {
        if (tMode >= nextJumpAt){
          const delta = (Math.random() < 0.5 ? -1 : 1) * total * rand(0.01, 0.10);
          jumpOffset = clamp(jumpOffset + delta, -total*0.3, total*0.3);
          nextJumpAt += rand(1500, 3500);
        }
        return clamp(trueRem + jumpOffset, 0, total);
      }
      case "REVERSE": {
        const f2 = clamp( 1 - Math.pow(1 - f, 0.4), 0, 1);
        return total * (1 - f2);
      }
      case "UNITS": {
        return trueRem;
      }
    }
    return trueRem;
  }

  function getElapsedMs(){
    if (!running) return (pausedAt||0);
    return performance.now() - startTs;
  }

  function formatHMS(sec){
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n) => n.toString().padStart(2,"0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function writeDisplay(trueRem, displayRem){
    const realFrac = 1 - trueRem/total;
    bar.style.width = `${clamp(realFrac,0,1)*100}%`;

    let shown = displayRem;
    let unitName = "seconds";
    if (mode === "UNITS"){
      shown = displayRem * unit.scale;
      unitName = unit.name;
    }
    timeOut.textContent = formatHMS(shown);
    unitsOut.textContent = unitName;
  }

  function rafLoop(){
    if (!running) return;

    const elapsedMs = getElapsedMs();
    const trueRem = clamp(total - elapsedMs/1000, 0, total);

    // (UNITS lasts 2× bcz i want)
    const interval = (mode === "UNITS") ? MODE_INTERVAL_MS * 2 : MODE_INTERVAL_MS;
    if (performance.now() - modeSince >= interval) pickMode();

    const displayRem = clamp(mapByMode(trueRem), 0, total);
    writeDisplay(trueRem, displayRem);

    if (trueRem <= 0){
      running = false;
      hint.textContent = "THE END (you survived gng)";
      if (plannedAtStart === (21*60 + 37) && window.Ach && !Ach.has('timer_21m37s_done')) {
        Ach.grant('timer_21m37s_done');
      }
      return;
    }

    requestAnimationFrame(rafLoop);
  }

  // events
  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);
  timeOut.addEventListener("click", resume);

  // init
  setTotalFromInputs();
})();

