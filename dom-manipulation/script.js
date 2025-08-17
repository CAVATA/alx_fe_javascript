// script.js

// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" },
  { text: "If life were predictable it would cease to be life.", category: "Life" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");

// Function: Display a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Apply category filter if not "all"
  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category.";
    return;
  }

  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  // Update DOM
  quoteDisplay.innerHTML = `"${randomQuote.text}" <br> 
    <span class="quote-category">— ${randomQuote.category}</span>`;
}

// Function: Update category dropdown dynamically
function updateCategoryFilter() {
  const categories = [...new Set(quotes.map(q => q.category))]; // unique categories

  // Clear old options
  categoryFilter.innerHTML = `<option value="all">All</option>`;

  // Add categories dynamically
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Function: Add new quote
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category!");
    return;
  }

  // Add to array
  quotes.push({ text: newText, category: newCategory });

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update category filter
  updateCategoryFilter();

  alert("New quote added successfully!");
}


// Initialize categories on page load
updateCategoryFilter();

 alert("New quote added successfully!");


 quoteDisplay.innerHTML = `"${newText}" <br> 
    <span class="quote-category">— ${newCategory}</span>`;

   // Export Quotes as JSON
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

// Import Quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategoryFilter();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch (err) {
      alert("Error reading JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// === Event Listeners ===
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile); 

// === Event Listeners ===
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);

// Initialize
updateCategoryFilter();
loadLastQuote(); // Load last viewed quote (sessionStorage)