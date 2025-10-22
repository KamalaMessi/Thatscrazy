// Timer z chaosem: co 10 s zmienia "fikus" (tryb wyświetlania)
// - logika czasu bazuje na realnym upływie (elapsed), ale prezentacja bywa oszukana
(() => {
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

  // --- stan zegara (prawda) ---
  let total = 30;               // sekundy docelowe
  let startTs = 0;              // performance.now() przy starcie
  let pausedAt = 0;             // ms od startu do pauzy
  let running = false;

  // --- stan efektów ---
  const modes = ["ACCEL","SLOW","JUMP","REVERSE","UNITS"];
  let mode = "ACCEL";
  let modeSince = 0;            // ms odkąd wybrano tryb
  let jumpOffset = 0;           // sekundy (±) dla JUMP
  let nextJumpAt = 0;           // ms od początku trybu do kolejnego skoku
  let unit = { name: "sekundy", scale: 1 }; // dla UNITS

  // losowe pomocnicze
  const rand = (a,b) => Math.random()*(b-a)+a;
  const rint = (a,b) => Math.floor(rand(a,b+1));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function setTotalFromInputs(){
    const h = parseInt(hInp.value||"0",10);
    const m = parseInt(mInp.value||"0",10);
    const s = parseInt(sInp.value||"0",10);
    total = clamp(h,0,99)*3600 + clamp(m,0,59)*60 + clamp(s,0,59);
    if (total <= 0) total = 1;
    writeDisplay(total, total); // startowo 100%
  }

  function start(){
    setTotalFromInputs();
    startTs = performance.now();
    pausedAt = 0;
    running = true;
    pickMode(true);
    rafLoop();
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
    rafLoop();
  }

  // wybór / rotacja trybu co 10 s
  function pickMode(initial=false){
    const prev = mode;
    const pool = modes.filter(m => m !== prev); // bez powtórki z rzędu
    mode = pool[rint(0, pool.length-1)];
    modeSince = performance.now();
    jumpOffset = 0;
    nextJumpAt = rand(1500, 3500);
    if (mode === "UNITS"){
      // śmieszne jednostki + skala
      const choices = [
        {name:"nanosekundy", scale: 1e9},
        {name:"faux-seconds", scale: 0.73},
        {name:"lata świetlne", scale: 1/ (60*60*24*365 * 3.154e7) }, // totalnie bez sensu
        {name:"mega-sekundy", scale: 1e-6},
        {name:"chwileczki", scale: 2.71828},
        {name:"kawusie", scale: 1/1800},
      ];
      unit = choices[rint(0, choices.length-1)];
    } else {
      unit = { name: "sekundy", scale: 1 };
    }
    if (!initial) {
      // nie zdradzamy szczegółów, ale lekka podpowiedź ;)
      hint.textContent = ["hmm…","dziwnie szybko…","co tu się…","okej?","no to lecimy"][rint(0,4)];
    }
  }

  // mapping: trueRemaining -> displayedRemaining (w sekundach)
  function mapByMode(trueRem){
    const elapsed = getElapsedMs();            // ms od startu (z pauzami)
    const tMode = performance.now() - modeSince;
    const f = 1 - trueRem/total;               // realny ułamek postępu [0..1]

    switch(mode){
      case "ACCEL": {
        // coraz szybciej: mnożnik rośnie kwadratowo
        const factor = 1 + 3 * Math.pow(tMode/10000, 2); // ~1..4+
        const f2 = clamp(f * factor, 0, 1);
        return total * (1 - f2);
      }
      case "SLOW": {
        // zwalnia: potęgowanie utrudnia dojście do 1
        const f2 = Math.pow(f, 1.8);
        return total * (1 - f2);
      }
      case "JUMP": {
        // co parę sekund skok ± (1..10%) total
        if (tMode >= nextJumpAt){
          const delta = (Math.random() < 0.5 ? -1 : 1) * total * rand(0.01, 0.10);
          jumpOffset = clamp(jumpOffset + delta, -total*0.3, total*0.3);
          nextJumpAt += rand(1500, 3500);
        }
        const rem = clamp(trueRem + jumpOffset, 0, total);
        return rem;
      }
      case "REVERSE": {
        // udaje odliczanie, ale "oszukuje" krzywą – znika wolniej, potem szybciej
        const f2 = clamp( 1 - Math.pow(1 - f, 0.4), 0, 1); // ease-in-out
        return total * (1 - f2);
      }
      case "UNITS": {
        // wyświetl w absurdalnych jednostkach (tylko prezentacja)
        return trueRem; // sama wartość zostaje, jednostki zmieniamy niżej
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
    // pasek (zawsze względem PRAWDY, żeby nie wystrzelił poza)
    const realFrac = 1 - trueRem/total;
    bar.style.width = `${clamp(realFrac,0,1)*100}%`;

    // jednostki (dla UNITS skalujemy wartość i nazwę)
    let shown = displayRem;
    let unitName = "sekundy";
    if (mode === "UNITS"){
      shown = displayRem * unit.scale;
      unitName = unit.name;
    }
    timeOut.textContent = formatHMS(shown);
    unitsOut.textContent = unitName;
  }

  // rysowanie
  function rafLoop(){
    if (!running) return;

    const elapsedMs = getElapsedMs();
    const trueRem = clamp(total - elapsedMs/1000, 0, total);

    // zmiana trybu co 10 s
    if (performance.now() - modeSince >= 10000) pickMode();

    const displayRem = clamp(mapByMode(trueRem), 0, total);
    writeDisplay(trueRem, displayRem);

    if (trueRem <= 0){
      running = false;
      hint.textContent = "KONIEC ✨";
      return;
    }
    requestAnimationFrame(rafLoop);
  }

  // zdarzenia
  startBtn.addEventListener("click", () => { start(); });
  pauseBtn.addEventListener("click", () => { pause(); });
  resetBtn.addEventListener("click", () => { reset(); });
  // klik na timeOut wznawia (mały easter egg)
  timeOut.addEventListener("click", () => resume());

  // inicjalizacja
  setTotalFromInputs();
})();
