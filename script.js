window.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen");
  const keys = document.querySelector(".keys");
  const historyList = document.getElementById("historyList");

  if (!keys || !screen) {
    console.error("Nie znaleziono .keys albo #screen");
    if (screen) screen.textContent = "Błąd: brak .keys / #screen";
    return;
  }

  // ---- STAN ----
  let curr = "0";          // wpisywana liczba
  let op = null;           // + - * /
  let prevStr = null;      // lewy operand hche mi sie spac (dla -,*,/)
  let justEvaluated = false;
  let addSeq = [];         // tutaj yyy sekwencja dla +

  const opSymbol = { "+": "+", "-": "−", "*": "×", "/": ":" };

  // losowe teksty bruuh
  const multLines = [
    "6… maybe 7… 67…",
    "If i had to guess… 67?",
    "Prolly 67 gang ❤️",
    "Going all in on 67 🤑🎰",
    "I bet 1$ on 67, so its 67",
    "Tbh prolly 67 idk",
    "Its 67 trust me gng ❤️",
    "Evil 67 👿",
    "Its 67 trust me broteinshake 🙏",
    "6…7? 67…",
    "Its NOT 67 👿",
    "Prolly 67 but im not sure",
    "I bet 67¥ on 67",
    "Imagine if it was 67"
  ];
  const divLines = [
    "Idk bro 💀🙏",
    "Count it urself 💀",
    "It CANT be that hard 💔",
    "Idk, use ChatGPT 🙏",
    "You think i know?",
    "Hold on ima check",
    "Prolly a MASSIVE number",
    "Thats enough for you 👿",
    "ChatGPT is free vro 🙏",
    "Prolly smth EVIL 👿",
    "Not a clue man"
  ];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // ---- WIDOK ----
  const show = t => screen.textContent = t;

  function rebuildDisplayWhileTyping(nextPart = "") {
    if (op === "+") {
      const base = addSeq.join(" + ");
      show(nextPart ? `${base} + ${nextPart}` : `${base} +`);
    } else if (op && prevStr != null) {
      const sym = opSymbol[op] ?? op;
      show(nextPart ? `${prevStr} ${sym} ${nextPart}` : `${prevStr} ${sym}`);
    } else {
      show(curr);
    }
  }

  // ---- HISTORIA CHCE MI SIE SPAC ----
  function addHistory(expr, res) {
    if (!historyList) return;
    const li = document.createElement("li");
    li.textContent = `${expr} = ${res}`;
    historyList.prepend(li);           // najnowsze na górze
    // max 10 wpisów
    while (historyList.children.length > 10) {
      historyList.lastElementChild.remove();
    }
  }

  // ---- LOGIKA ----
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
    // zmiana operatora bez wpisania drugiego operandu bo na to jestem za leniwa
    if (op && curr === "0" && !justEvaluated) {
      op = nextOp;
      rebuildDisplayWhileTyping();
      return;
    }

    if (nextOp === "+") {
      if (op !== "+") addSeq = [curr]; else addSeq.push(curr);
      curr = "0";
      op = "+";
      prevStr = null;
      rebuildDisplayWhileTyping();
      justEvaluated = false;
      return;
    }

    // koncz tutahj ewentualną sekwencję + jakbys nie wiedzia variacie
    if (op === "+") {
      prevStr = addSeq.join("");
      addSeq = [];
    } else {
      prevStr = curr;
    }
    curr = "0";
    op = nextOp;
    justEvaluated = false;
    rebuildDisplayWhileTyping();
  }

  function evaluate() {
    let result, expr;

    if (op === "+") {
      const parts = [...addSeq];
      if (!justEvaluated) parts.push(curr);
      expr = parts.join(" + ");
      result = parts.join("");    // sklejka w kolejnosci
      // reset
      addSeq = [];
      op = null; prevStr = null; curr = String(result); justEvaluated = true;
      show(curr);
      addHistory(expr, result);
      return;
    }

    if (!op || prevStr == null) {
      show(curr);
      return;
    }

    expr = `${prevStr} ${opSymbol[op] ?? op} ${curr}`;
    switch (op) {
      case "-":
        result = `${randInt(-100, 100)} i think`;
        break;
      case "*":
        result = pick(multLines);
        break;
      case "/":
        result = pick(divLines);
        break;
      default:
        result = curr;
    }

    op = null; addSeq = []; prevStr = null; curr = String(result); justEvaluated = true;
    show(curr);
    addHistory(expr, result);
  }

  function clearAll() {
    curr = "0"; op = null; prevStr = null; addSeq = []; justEvaluated = false;
    show(curr);
  }
  function backspace() {
    if (justEvaluated) { curr = "0"; justEvaluated = false; }
    curr = curr.length > 1 ? curr.slice(0, -1) : "0";
    rebuildDisplayWhileTyping(curr);
  }
  function percent() {
    const n = parseFloat(curr);
    if (!isNaN(n)) curr = String(n / 100);
    rebuildDisplayWhileTyping(curr);
  }

  // ---- ZDARZENIA ----
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

  show(curr);
});