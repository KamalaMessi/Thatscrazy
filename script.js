window.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen");
  const keys = document.querySelector(".keys");

  if (!keys || !screen) {
    console.error("Nie znaleziono .keys albo #screen — sprawdź HTML.");
    if (screen) screen.textContent = "Błąd: brak .keys / #screen";
    return;
  }

  // --- STAN ---
  let curr = "0";          // aktualnie wpisywana liczba (string)
  let op = null;           // bieżący operator: + - * /
  let prevStr = null;      // poprzedni operand jako string (dla -,*,/)
  let justEvaluated = false;

  // specjalna kolejka tylko dla +
  let addSeq = [];         // ["4","5","6"] => wynik "456"

  // mapowanie symboli do wyświetlania na pasku
  const opSymbol = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": " : "
  };

  // --- WIDOK ---
  function show(text) { screen.textContent = text; }
  function showCurr() { show(curr); }

  function rebuildDisplayWhileTyping(nextPart = "") {
    // Buduje pasek działania podczas pisania drugiego (i dalszych) operandów
    if (op === "+") {
      const base = addSeq.join(" + ");
      if (nextPart) show(`${base} + ${nextPart}`);
      else show(`${base} +`);
    } else if (op && prevStr != null) {
      const sym = opSymbol[op] ?? op;
      if (nextPart) show(`${prevStr}${sym}${nextPart}`);
      else show(`${prevStr}${sym}`);
    } else {
      showCurr();
    }
  }

  // --- LOGIKA ---
  function inputNumber(n) {
    if (justEvaluated) { curr = "0"; justEvaluated = false; }

    if (n === ".") {
      if (!curr.includes(".")) curr += ".";
      return rebuildDisplayWhileTyping(curr);
    }
    curr = (curr === "0") ? n : curr + n;
    rebuildDisplayWhileTyping(curr);
  }

  function setOperator(nextOp) {
    // Jeśli już mieliśmy operator i nic nie wpisano po nim, tylko podmień operator
    if (op && curr === "0" && !justEvaluated) {
      op = nextOp;
      rebuildDisplayWhileTyping(); // zaktualizuj symbol
      return;
    }

    if (nextOp === "+") {
      // Inicjalizacja/rozszerzanie kolejki dodawania
      if (op !== "+") {
        // start sekwencji +
        addSeq = [curr];
      } else {
        // kontynuacja sekwencji +
        addSeq.push(curr);
      }
      curr = "0";
      op = "+";
      prevStr = null; // nieużywane dla +
      rebuildDisplayWhileTyping(); // pokaż "a +"
      justEvaluated = false;
      return;
    }

    // Dla -,*,/ zakończ ewentualną sekwencję +
    if (op === "+") {
      // przechodzimy z + na inny operator: 'sklejamy' wyświetlanie bazowe
      // ale nie wyliczamy nic — tylko zamykamy sekwencję wejściem w zwykły tryb
      // Traktujemy dotychczasowe części jako jeden lewy operand do nowego operatora
      prevStr = addSeq.join("");
      addSeq = [];
    } else {
      prevStr = curr;
    }

    curr = "0";
    op = nextOp;
    justEvaluated = false;
    rebuildDisplayWhileTyping(); // pokaż "A op"
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function evaluate() {
    let result;

    if (op === "+") {
      // dołóż ostatni wpisany operand i sklej w kolejności
      const parts = [...addSeq];
      if (!justEvaluated) parts.push(curr);
      result = parts.join("");
      // czyścimy stan
      addSeq = [];
      op = null;
      curr = String(result);
      prevStr = null;
      justEvaluated = true;
      show(curr); // pokaż wynik
      return;
    }

    if (!op || (prevStr == null)) {
      // brak działania do policzenia – po prostu pokaż bieżący wpis
      showCurr();
      return;
    }

    // Specjalne wyniki dla -,*,/
    switch (op) {
      case "-":
        result = `${randInt(-100, 100)} i think`;
        break;
      case "*":
        result = "6... maybe 7... 67...";
        break;
      case "/":
        result = "Idk bro 💀🙏";
        break;
      default:
        result = curr;
    }

    // reset stanu i pokaż wynik
    op = null;
    addSeq = [];
    curr = String(result);
    prevStr = null;
    justEvaluated = true;
    show(curr);
  }

  function clearAll() {
    curr = "0"; op = null; prevStr = null; addSeq = []; justEvaluated = false;
    showCurr();
  }

  function backspace() {
    if (justEvaluated) { curr = "0"; justEvaluated = false; }
    curr = curr.length > 1 ? curr.slice(0, -1) : "0";
    rebuildDisplayWhileTyping(curr);
  }

  function percent() {
    // zachowujemy normalne % na bieżącej liczbie
    const n = parseFloat(curr);
    if (!isNaN(n)) curr = String(n / 100);
    rebuildDisplayWhileTyping(curr);
  }

  // --- ZDARZENIA ---
  keys.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.num) return inputNumber(btn.dataset.num);
    if (btn.dataset.op) return setOperator(btn.dataset.op);

    const action = btn.dataset.action;
    if (action === "equals") return evaluate();
    if (action === "clear") return clearAll();
    if (action === "backspace") return backspace();
    if (action === "percent") return percent();
  });

  document.addEventListener("keydown", (e) => {
    if ("0123456789.".includes(e.key)) inputNumber(e.key);
    if ("+-*/".includes(e.key)) setOperator(e.key);
    if (e.key === "Enter" || e.key === "=") evaluate();
    if (e.key === "Backspace") backspace();
    if (e.key.toLowerCase() === "c") clearAll();
    if (e.key === "%") percent();
  });

  // start
  showCurr();
});

