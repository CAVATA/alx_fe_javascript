// =============================
// Storage Keys
// =============================
const LS_QUOTES_KEY = "quotes";
const LS_SELECTED_CATEGORY_KEY = "selectedCategory";
const SS_LAST_QUOTE_KEY = "lastQuote";

// =============================
// Base Data
// =============================
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" },
  { text: "If life were predictable it would cease to be life.", category: "Life" }
];

// =============================
// DOM Elements
// =============================
const quoteDisplay   = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn    = document.getElementById("newQuote");
const addQuoteBtn    = document.getElementById("addQuote");
const quotesListEl   = document.getElementById("quotesList");
const exportBtn      = document.getElementById("exportJson");
const importInput    = document.getElementById("importFile");

// =============================
// Local/Session Storage Helpers
// =============================
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed;
    }
  } catch { /* ignore parse errors */ }
}

function saveSelectedCategory(value) {
  localStorage.setItem(LS_SELECTED_CATEGORY_KEY, value);
}

function loadSelectedCategory() {
  return localStorage.getItem(LS_SELECTED_CATEGORY_KEY) || "all";
}

function saveLastQuote(quote) {
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
}

function loadLastQuote() {
  const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// =============================
// UI Helpers
// =============================
function getUniqueCategories() {
  return [...new Set(quotes.map(q => q.category.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function populateCategories() {
  // Keep current selection so we can restore it after rebuilding options
  const current = categoryFilter.value || loadSelectedCategory();

  // Reset options
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  // Add unique categories
  for (const cat of getUniqueCategories()) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  }

  // Restore selected (fallback to "all" if not found)
  const toSelect = [...categoryFilter.options].some(o => o.value === current) ? current : "all";
  categoryFilter.value = toSelect;
  saveSelectedCategory(toSelect);
}

function renderQuotesList(filtered) {
  quotesListEl.innerHTML = "";
  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "No quotes in this category.";
    quotesListEl.appendChild(li);
    return;
  }

  for (const q of filtered) {
    const li = document.createElement("li");
    li.innerHTML = `"${q.text}" — <span class="quote-category">${q.category}</span>`;
    quotesListEl.appendChild(li);
  }
}

function currentFilteredQuotes() {
  const selected = categoryFilter.value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

// =============================
// Core Features
// =============================
function showRandomQuote() {
  const filtered = currentFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this selection.";
    return;
  }
  const rnd = Math.floor(Math.random() * filtered.length);
  const q = filtered[rnd];

  quoteDisplay.innerHTML = `"${q.text}" <br><span class="quote-category">— ${q.category}</span>`;
  saveLastQuote(q);
}

function filterQuotes() {
  // Called by inline onchange in HTML
  const selected = categoryFilter.value;
  saveSelectedCategory(selected);          // remember filter across sessions
  renderQuotesList(currentFilteredQuotes()); // update list immediately
  // Optional: also refresh the "current quote" to honor the filter context
  // If you prefer to keep the last shown quote, comment the next line.
  showRandomQuote();
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();                 // persist quotes

  // Clear inputs
  textEl.value = "";
  catEl.value = "";

  // Rebuild categories & keep current selection
  const prevSelected = categoryFilter.value;
  populateCategories();

  // If a brand-new category was added and user likely wants to see it,
  // you can auto-switch to it. Toggle this behavior as you like:
  // categoryFilter.value = category;

  // Persist (either the previous one or the new one if you switched)
  saveSelectedCategory(categoryFilter.value);

  // Re-render with current filter
  renderQuotesList(currentFilteredQuotes());
  quoteDisplay.innerHTML = `"${text}" <br><span class="quote-category">— ${category}</span>`;
  saveLastQuote({ text, category });
}

// =============================
// Import / Export (optional from previous step)
// =============================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      // Basic validation for each item
      for (const item of imported) {
        if (!item || typeof item.text !== "string" || typeof item.category !== "string") {
          throw new Error("Invalid quote object");
        }
      }
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      renderQuotesList(currentFilteredQuotes());
      alert("Quotes imported successfully.");
    } catch (err) {
      alert("Failed to import: " + err.message);
    } finally {
      // Reset input so the same file can be chosen again if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// =============================
// Event Wiring
// =============================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn?.addEventListener("click", exportToJsonFile);
importInput?.addEventListener("change", importFromJsonFile);

// =============================
// Initialize App
// =============================
loadQuotes();                 // load persisted quotes
populateCategories();         // build categories and restore selection
renderQuotesList(currentFilteredQuotes()); // show filtered list

// Prefer showing the last quote if available, else show a fresh one
const last = loadLastQuote();
if (last) {
  quoteDisplay.innerHTML = `"${last.text}" <br><span class="quote-category">— ${last.category}</span>`;
} else {
  showRandomQuote();
}
