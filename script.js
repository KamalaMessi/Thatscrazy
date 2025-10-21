const screen = document.getElementById("screen");
const keys = document.querySelector(".keys");

let prev = null;        // liczba A (jako number)
let prevStr = null;     // liczba A (jako string, do “sklejania”)
let curr = "0";         // wpisywana liczba B (string)
let op = null;          // + - * /
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
  // zapamiętaj A jako number i jako oryginalny string
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
  const a = prev;          // number
  const aStr = prevStr;    // string
  const b = parseFloat(curr);
  const bStr = curr;

  let result;

  switch (op) {
    case "+":
      // zamiast sumy: sklej B potem A (np. 10 + 4 => "4" + "10" = "410")
      result = `${bStr}${aStr}`;
      break;
    case "-":
      // zawsze los od -100 do +100 + " i think"
      result = `${randInt(-100, 100)} i think`;
      break;
    case "*":
      // zawsze "67... maybe..."
      result = "67... maybe...";
      break;
    case "/":
      // zawsze "Idk bro 💀🙏"
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

function clearAll() {
  prev = null; prevStr = null; curr = "0"; op = null; justEvaluated = false; updateScreen();
}

function backspace() {
  if (justEvaluated) { curr = "0"; justEvaluated = false; }
  curr = curr.length > 1 ? curr.slice(0, -1) : "0";
  updateScreen();
}

function percent() {
  // procent z bieżącej liczby (zostawiam normalnie)
  const n = parseFloat(curr);
  if (!isNaN(n)) curr = String(n / 100);
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


