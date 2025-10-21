const screen = document.getElementById("screen");
const keys = document.querySelector(".keys");

let prev = null;        // poprzednia liczba
let curr = "0";         // aktualny wpis
let op = null;          // aktualny operator: + - * /
let justEvaluated = false;

function updateScreen() {
  screen.textContent = curr;
}

function inputNumber(n) {
  if (justEvaluated) { curr = "0"; justEvaluated = false; }
  if (n === ".") {
    if (!curr.includes(".")) curr += ".";
    return updateScreen();
  }
  if (curr === "0") curr = n;
  else curr += n;
  updateScreen();
}

function setOperator(nextOp) {
  if (op && prev !== null && !justEvaluated) {
    // policz łańcuchowo: 2 + 3 + (wpis)...
    evaluate();
  } else {
    prev = parseFloat(curr);
  }
  op = nextOp;
  curr = "0";
  justEvaluated = false;
}

function evaluate() {
  if (op === null || prev === null) return;
  const a = prev;
  const b = parseFloat(curr);
  let result = 0;

  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/": result = b === 0 ? "NaN" : a / b; break;
  }

  curr = String(Number.isFinite(result) ? +parseFloat(result.toFixed(12)) : result);
  prev = null;
  op = null;
  justEvaluated = true;
  updateScreen();
}

function clearAll() {
  prev = null; curr = "0"; op = null; justEvaluated = false; updateScreen();
}

function backspace() {
  if (justEvaluated) { curr = "0"; justEvaluated = false; }
  curr = curr.length > 1 ? curr.slice(0, -1) : "0";
  updateScreen();
}

function percent() {
  curr = String(parseFloat(curr) / 100);
  updateScreen();
}

// Obsługa kliknięć
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
