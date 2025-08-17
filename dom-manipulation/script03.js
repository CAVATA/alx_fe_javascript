// Local storage key
const QUOTES_KEY = "quotes";

// Mock server endpoint (JSONPlaceholder)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from local storage
function getLocalQuotes() {
  return JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
}

// Save quotes to local storage
function saveLocalQuotes(quotes) {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// Display quotes
function displayQuotes() {
  const quotes = getLocalQuotes();
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = quotes.map((q, i) => `<p>${i + 1}. ${q}</p>`).join("");
}

// Add new local quote
function addLocalQuote() {
  const quotes = getLocalQuotes();
  const newQuote = "Local quote " + (quotes.length + 1);
  quotes.push(newQuote);
  saveLocalQuotes(quotes);
  displayQuotes();
  syncWithServer(newQuote);
}

// Simulate server sync
async function syncWithServer(newQuote) {
  try {
    // Post new quote to server
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newQuote })
    });

    document.getElementById("status").innerText = "Synced with server ✅";
  } catch (error) {
    document.getElementById("status").innerText = "Sync failed ❌";
  }
}

// Fetch from server and resolve conflicts
async function fetchFromServer() {
  try {
    const res = await fetch(SERVER_URL + "?_limit=5");
    const serverData = await res.json();
    const serverQuotes = serverData.map(item => item.body);

    // Conflict resolution: server takes precedence
    saveLocalQuotes(serverQuotes);
    displayQuotes();
    document.getElementById("status").innerText = "Data refreshed from server 🔄";
  } catch (error) {
    document.getElementById("status").innerText = "Failed to fetch server data ❌";
  }
}

// Periodic sync every 15s
setInterval(fetchFromServer, 15000);

// Initialize
window.onload = () => {
  displayQuotes();
  fetchFromServer();
};
