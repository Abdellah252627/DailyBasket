const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minsEl = document.getElementById("mins");
const secondsEl = document.getElementById("seconds");

// Search functionality - now uses dynamic product database
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === "") {
        alert("Please enter a search term");
        return;
    }
    
    // Use the dynamic product database for search
    if (window.productDB) {
        const searchResults = window.productDB.searchProducts(searchTerm);
        displaySearchResults(searchResults, searchTerm);
    } else {
        alert("Product database not loaded yet. Please try again.");
    }
}

function displaySearchResults(results, searchTerm) {
    if (results.length === 0) {
        alert(`No products found for "${searchTerm}". Try different keywords.`);
        return;
    }
    
    let resultMessage = `Found ${results.length} product(s) for "${searchTerm}":\n\n`;
    results.forEach((product, index) => {
        resultMessage += `${index + 1}. ${product.name} (${product.category}) - $${product.price}\n`;
    });
    
    alert(resultMessage);
}

// Event listeners
if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
}

if (searchInput) {
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });
}

const newYears = "26 Jan 2026";

function countdown() {
    const newYearsDate = new Date(newYears);
    const currentDate = new Date();

    const totalSeconds = (newYearsDate - currentDate) / 1000;

    const days = Math.floor(totalSeconds / 3600 / 24);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const mins = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds) % 60;

    daysEl.innerHTML = days;
    hoursEl.innerHTML = formatTime(hours);
    minsEl.innerHTML = formatTime(mins);
    secondsEl.innerHTML = formatTime(seconds);
}

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// initial call
countdown();

setInterval(countdown, 1000);

// Initialize dynamic products when page loads
document.addEventListener('DOMContentLoaded', function() {
    // The ProductRenderer will automatically initialize and render products
    if (window.productRenderer) {
        console.log('Dynamic product system initialized');
    }
});