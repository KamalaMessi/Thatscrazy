window.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen");
  const keys = document.querySelector(".keys");

  // jeśli nie znajdzie kontenera z przyciskami — pokaż info
  if (!keys || !screen) {
    console.error("Nie znaleziono .keys albo #screen — sprawdź HTML.");
    if (screen) screen.textContent = "Błąd: brak .keys / #screen";
    return;
  }

  let prev = null;        // liczba A (number)
  let prevStr = null;     // liczba A (string)
  let curr = "0";         // bieżący wpis (string)
  let op = null;          // + - * /
  let justEvaluated = false;

  function updateScreen() { screen.textContent = curr; }

  function inputNumber(n) {
    if (justEvaluated) { curr = "0"; justEvaluated = false; }
    if (n === ".") {
      if (!curr.includes(".")) curr += ".";
      return updateScreen();
    }
    curr = (curr === "0") ? n : curr + n;
    updateScreen();
  }

  function setOperator(nextOp) {
    prev = parseFloat(curr);
    prevStr = curr;
    op = nextOp;
    curr = "0";
    justEvaluated = false;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function evaluate() {
    if (op === null || prev === null) return;
    const aStr = prevStr;
    const bStr = curr;

    let result;
    switch (op) {
      case "+":
        result = `${bStr}${aStr}`;            // sklejka B potem A
        break;
      case "-":
        result = `${randInt(-100, 100)} i think`;
        break;
      case "*":
        result = "67... maybe...";
        break;
      case "/":
        result = "Idk bro 💀🙏";
        break;
      default:
        result = curr;
    }

    curr = String(result);
    prev = null;
    prevStr = null;
    op = null;
    justEvaluated = true;
    updateScreen();
  }

  function clearAll() { prev = null; prevStr = null; curr = "0"; op = null; justEvaluated = false; updateScreen(); }
  function backspace() { if (justEvaluated) { curr = "0"; justEvaluated = false; } curr = curr.length > 1 ? curr.slice(0, -1) : "0"; updateScreen(); }
  function percent() { const n = parseFloat(curr); if (!isNaN(n)) curr = String(n / 100); updateScreen(); }

  // Obsługa klików (delegacja)
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

  // Klawiatura
  document.addEventListener("keydown", (e) => {
    if ("0123456789.".includes(e.key)) inputNumber(e.key);
    if ("+-*/".includes(e.key)) setOperator(e.key);
    if (e.key === "Enter" || e.key === "=") evaluate();
    if (e.key === "Backspace") backspace();
    if (e.key.toLowerCase() === "c") clearAll();
    if (e.key === "%") percent();
  });

  updateScreen();
});


