// ====== Elements ======
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");

const typeEl = document.getElementById("type");
const categoryEl = document.getElementById("category");
const descEl = document.getElementById("desc");
const amountEl = document.getElementById("amount");

const addBtn = document.getElementById("addBtn");
const msgEl = document.getElementById("msg");

const tbody = document.getElementById("tbody");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const searchEl = document.getElementById("search");
const clearAllBtn = document.getElementById("clearAll");

// ====== Storage Key ======
const STORAGE_KEY = "expense_tracker_transactions";

// ====== State ======
let transactions = loadFromStorage();

// ====== Helpers ======
function formatMoney(num) {
  return `₹${Number(num).toLocaleString("en-IN")}`;
}

function today() {
  return new Date().toLocaleDateString();
}

function showMsg(text, isError = false) {
  msgEl.textContent = text;
  msgEl.style.color = isError ? "#ef4444" : "#22c55e";
  setTimeout(() => (msgEl.textContent = ""), 2000);
}

// ====== Local Storage ======
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// ====== Core Logic ======
function addTransaction() {
  const type = typeEl.value;
  const category = categoryEl.value;
  const desc = descEl.value.trim();
  const amount = Number(amountEl.value);

  if (!desc) return showMsg("Please enter description", true);
  if (!amount || amount <= 0) return showMsg("Enter valid amount", true);

  const tx = {
    id: Date.now(),
    date: today(),
    type,
    category,
    desc,
    amount
  };

  transactions.unshift(tx); // newest first
  saveToStorage();

  descEl.value = "";
  amountEl.value = "";

  render();
  showMsg("Transaction added ✅");
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToStorage();
  render();
  showMsg("Deleted ✅");
}

function clearAll() {
  if (!confirm("Clear all transactions?")) return;
  transactions = [];
  saveToStorage();
  render();
  showMsg("Cleared ✅");
}

// ====== Calculations ======
function updateSummary(list) {
  const income = list
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = list
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expense;

  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);
  balanceEl.textContent = formatMoney(balance);
}

// ====== Rendering ======
function renderTable(list) {
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">No transactions found</td></tr>`;
    return;
  }

  list.forEach(tx => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${tx.date}</td>
      <td class="${tx.type === "income" ? "badge-income" : "badge-expense"}">
        ${tx.type.toUpperCase()}
      </td>
      <td>${tx.category}</td>
      <td>${tx.desc}</td>
      <td>${formatMoney(tx.amount)}</td>
      <td>
        <button class="action-btn" data-id="${tx.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // attach delete listeners
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteTransaction(Number(btn.dataset.id)));
  });
}

function getFilteredList() {
  const t = filterType.value;
  const c = filterCategory.value;
  const q = searchEl.value.trim().toLowerCase();

  return transactions.filter(tx => {
    const typeOk = t === "all" || tx.type === t;
    const catOk = c === "all" || tx.category === c;
    const searchOk = !q || tx.desc.toLowerCase().includes(q);
    return typeOk && catOk && searchOk;
  });
}

function render() {
  const filtered = getFilteredList();
  updateSummary(filtered);
  renderTable(filtered);
}

// ====== Events ======
addBtn.addEventListener("click", addTransaction);
clearAllBtn.addEventListener("click", clearAll);

filterType.addEventListener("change", render);
filterCategory.addEventListener("change", render);
searchEl.addEventListener("input", render);

// ====== Initial Render ======
render();
