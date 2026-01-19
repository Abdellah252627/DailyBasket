// Filter and Sort Functionality for Category Pages

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
});

function initializeFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const products = document.querySelectorAll('.product-box');
    const priceFilter = document.getElementById('priceFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    
    // Convert NodeList to Array for manipulation
    let productsArray = Array.from(products);
    
    // Apply price filter
    if (priceFilter !== 'all') {
        productsArray = productsArray.filter(product => {
            const price = parseInt(product.dataset.price);
            return filterByPrice(price, priceFilter);
        });
    }
    
    // Apply rating filter
    if (ratingFilter !== 'all') {
        productsArray = productsArray.filter(product => {
            const rating = parseFloat(product.dataset.rating);
            return rating >= parseInt(ratingFilter);
        });
    }
    
    // Apply sorting
    productsArray = sortProducts(productsArray, sortFilter);
    
    // Hide all products first
    products.forEach(product => {
        product.style.display = 'none';
    });
    
    // Show filtered and sorted products
    productsArray.forEach(product => {
        product.style.display = 'flex';
    });
    
    // Show no results message if needed
    showNoResultsMessage(productsArray.length === 0);
}

function filterByPrice(price, priceRange) {
    switch(priceRange) {
        case '0-100':
            return price <= 100;
        case '100-200':
            return price > 100 && price <= 200;
        case '200-300':
            return price > 200 && price <= 300;
        case '300+':
            return price > 300;
        default:
            return true;
    }
}

function sortProducts(products, sortType) {
    const sortedProducts = [...products];
    
    switch(sortType) {
        case 'price-low':
            return sortedProducts.sort((a, b) => 
                parseInt(a.dataset.price) - parseInt(b.dataset.price)
            );
        case 'price-high':
            return sortedProducts.sort((a, b) => 
                parseInt(b.dataset.price) - parseInt(a.dataset.price)
            );
        case 'name-asc':
            return sortedProducts.sort((a, b) => 
                a.dataset.name.localeCompare(b.dataset.name)
            );
        case 'name-desc':
            return sortedProducts.sort((a, b) => 
                b.dataset.name.localeCompare(a.dataset.name)
            );
        default:
            return sortedProducts;
    }
}

function clearFilters() {
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('sortFilter').value = 'default';
    document.getElementById('ratingFilter').value = 'all';
    
    // Show all products
    const products = document.querySelectorAll('.product-box');
    products.forEach(product => {
        product.style.display = 'flex';
    });
    
    // Hide no results message
    hideNoResultsMessage();
    
    // Show notification
    showNotification('Filters cleared!');
}

function showNoResultsMessage(show) {
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (show && !noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'no-results-message';
        noResultsMsg.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
        `;
        
        const container = document.querySelector('.product-container');
        if (container) {
            container.appendChild(noResultsMsg);
        }
    } else if (!show && noResultsMsg) {
        noResultsMsg.remove();
    }
}

function hideNoResultsMessage() {
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Add keyboard support for filters
document.addEventListener('keydown', function(event) {
    // Ctrl + F to focus on search (if search exists)
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to clear filters
    if (event.key === 'Escape') {
        clearFilters();
    }
});
