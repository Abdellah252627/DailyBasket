// نظام عرض المنتجات الديناميكي
class ProductRenderer {
    constructor() {
        this.productDB = window.productDB;
        this.container = null;
        this.currentProducts = [];
        this.filters = {};
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.init();
    }

    init() {
        this.setupContainers();
        this.setupFilters();
        this.setupSorting();
        this.setupPagination();
        this.renderProducts();
    }

    // إعداد الحاويات
    setupContainers() {
        this.container = document.querySelector('.product-container');
        if (!this.container) {
            console.warn('Product container not found');
            return;
        }

        // إضافة عناصر التحكم
        this.addControlElements();
    }

    // إضافة عناصر التحكم
    addControlElements() {
        const controlsHTML = `
            <div class="product-controls">
                <div class="filter-section">
                    <select id="categoryFilter" class="filter-select">
                        <option value="">All Categories</option>
                    </select>
                    <select id="priceFilter" class="filter-select">
                        <option value="">All Prices</option>
                        <option value="0-5">Under $5</option>
                        <option value="5-10">$5 - $10</option>
                        <option value="10-20">$10 - $20</option>
                        <option value="20+">Over $20</option>
                    </select>
                    <select id="ratingFilter" class="filter-select">
                        <option value="">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                    </select>
                    <label class="checkbox-label">
                        <input type="checkbox" id="offerFilter">
                        <span>On Sale Only</span>
                    </label>
                </div>
                <div class="sort-section">
                    <select id="sortSelect" class="sort-select">
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="rating-desc">Rating (High to Low)</option>
                        <option value="rating-asc">Rating (Low to High)</option>
                    </select>
                    <div class="view-toggle">
                        <button class="view-btn active" data-view="grid">⊞</button>
                        <button class="view-btn" data-view="list">☰</button>
                    </div>
                </div>
            </div>
            <div class="product-stats">
                <span class="product-count">Loading...</span>
                <span class="results-info"></span>
            </div>
        `;

        // إضافة عناصر التحكم قبل الحاوية
        this.container.insertAdjacentHTML('beforebegin', controlsHTML);
        
        // إضافة CSS
        this.addControlStyles();
    }

    // إضافة أنماط CSS
    addControlStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .product-controls {
                background: #f8f9fa;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .filter-section, .sort-section {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .filter-select, .sort-select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                font-size: 14px;
                min-width: 150px;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .checkbox-label input[type="checkbox"] {
                margin: 0;
            }
            
            .view-toggle {
                display: flex;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .view-btn {
                background: white;
                border: none;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .view-btn.active {
                background: #40aa54;
                color: white;
            }
            
            .product-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                font-size: 14px;
                color: #666;
            }
            
            .product-count {
                font-weight: bold;
                color: #333;
            }
            
            .product-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .product-container.list-view {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .product-box {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            .product-box:hover {
                transform: translateY(-5px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            .product-box img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .product-info {
                padding: 15px;
            }
            
            .product-name {
                font-size: 16px;
                font-weight: bold;
                margin: 0 0 5px 0;
                color: #333;
            }
            
            .product-description {
                font-size: 12px;
                color: #666;
                margin: 0 0 10px 0;
                line-height: 1.4;
            }
            
            .product-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .product-price {
                font-size: 18px;
                font-weight: bold;
                color: #40aa54;
            }
            
            .product-rating {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                color: #666;
            }
            
            .stars {
                color: #ffc107;
            }
            
            .product-stock {
                font-size: 12px;
                color: ${this.getStockColor(0)};
                margin-bottom: 10px;
            }
            
            .product-actions {
                display: flex;
                gap: 10px;
            }
            
            .cart-btn, .like-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-align: center;
                font-size: 14px;
                transition: background 0.3s;
            }
            
            .cart-btn {
                background: #40aa54;
                color: white;
            }
            
            .cart-btn:hover {
                background: #359848;
            }
            
            .like-btn {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #ddd;
            }
            
            .like-btn:hover {
                background: #e9ecef;
            }
            
            .like-btn.liked {
                background: #ff6c57;
                color: white;
                border-color: #ff6c57;
            }
            
            .product-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #ff6c57;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
            }
            
            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .no-products {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }
            
            .no-products i {
                font-size: 48px;
                margin-bottom: 20px;
                color: #ccc;
            }
            
            @media (max-width: 768px) {
                .product-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .filter-section, .sort-section {
                    justify-content: center;
                }
                
                .product-container {
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // إعداد الفلاتر
    setupFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        const offerFilter = document.getElementById('offerFilter');

        // ملء قائمة الفئات
        if (categoryFilter && this.productDB) {
            this.productDB.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = `${category.icon} ${category.name}`;
                categoryFilter.appendChild(option);
            });
        }

        // إضافة مستمعي الأحداث
        [categoryFilter, priceFilter, ratingFilter, offerFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    // إعداد الترتيب
    setupSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const [sortBy, sortOrder] = sortSelect.value.split('-');
                this.sortBy = sortBy;
                this.sortOrder = sortOrder;
                this.applyFilters();
            });
        }
    }

    // إعداد التصفح
    setupPagination() {
        // يمكن إضافة التصفح لاحقاً
    }

    // تطبيق الفلاتر
    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        const priceFilter = document.getElementById('priceFilter')?.value;
        const ratingFilter = document.getElementById('ratingFilter')?.value;
        const offerFilter = document.getElementById('offerFilter')?.checked;

        this.filters = {};

        if (categoryFilter) {
            this.filters.category = categoryFilter;
        }

        if (priceFilter) {
            if (priceFilter === '0-5') {
                this.filters.maxPrice = 5;
            } else if (priceFilter === '5-10') {
                this.filters.minPrice = 5;
                this.filters.maxPrice = 10;
            } else if (priceFilter === '10-20') {
                this.filters.minPrice = 10;
                this.filters.maxPrice = 20;
            } else if (priceFilter === '20+') {
                this.filters.minPrice = 20;
            }
        }

        if (ratingFilter) {
            this.filters.minRating = parseFloat(ratingFilter);
        }

        if (offerFilter) {
            this.filters.offerOnly = true;
        }

        this.renderProducts();
    }

    // عرض المنتجات
    renderProducts() {
        if (!this.container) return;

        // الحصول على المنتجات المفلترة
        let products = this.productDB.searchProducts('', this.filters);

        // ترتيب المنتجات
        products = this.sortProducts(products);

        this.currentProducts = products;

        // تحديث الإحصائيات
        this.updateStats(products);

        // عرض المنتجات
        if (products.length === 0) {
            this.showNoProducts();
        } else {
            this.renderProductList(products);
        }
    }

    // ترتيب المنتجات
    sortProducts(products) {
        return products.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];

            // التعامل مع الحالات الخاصة
            if (this.sortBy === 'rating') {
                aValue = aValue || 0;
                bValue = bValue || 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    // تحديث الإحصائيات
    updateStats(products) {
        const countElement = document.querySelector('.product-count');
        const infoElement = document.querySelector('.results-info');

        if (countElement) {
            countElement.textContent = `${products.length} Products`;
        }

        if (infoElement) {
            const totalProducts = this.productDB.getAllProducts().length;
            if (products.length < totalProducts) {
                infoElement.textContent = `of ${totalProducts} total`;
            } else {
                infoElement.textContent = '';
            }
        }
    }

    // عرض عدم وجود منتجات
    showNoProducts() {
        this.container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onclick="productRenderer.clearFilters()" class="btn btn-primary">
                    Clear Filters
                </button>
            </div>
        `;
    }

    // عرض قائمة المنتجات
    renderProductList(products) {
        this.container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    // إنشاء بطاقة المنتج
    createProductCard(product) {
        const isInWishlist = this.isInWishlist(product.id);
        const stockColor = this.getStockColor(product.stock);
        const stockText = this.getStockText(product.stock);

        return `
            <div class="product-box" data-product-id="${product.id}">
                <div style="position: relative;">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'">
                    ${product.offer ? `<div class="product-badge">-${product.offer}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">$${product.price}</span>
                        <div class="product-rating">
                            <span class="stars">${this.getStars(product.rating)}</span>
                            <span>(${product.reviews || 0})</span>
                        </div>
                    </div>
                    <p class="product-stock" style="color: ${stockColor}">${stockText}</p>
                    <div class="product-actions">
                        <button class="cart-btn" onclick="productRenderer.addToCart('${product.id}')">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                        <button class="like-btn ${isInWishlist ? 'liked' : ''}" onclick="productRenderer.toggleWishlist('${product.id}')">
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // الحصول على النجوم
    getStars(rating) {
        if (!rating) return '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    }

    // الحصول على لون المخزون
    getStockColor(stock) {
        if (stock === 0) return '#ff6c57';
        if (stock < 10) return '#ff9800';
        return '#4caf50';
    }

    // الحصول على نص المخزون
    getStockText(stock) {
        if (stock === 0) return 'Out of Stock';
        if (stock < 10) return `Only ${stock} left`;
        return `In Stock (${stock})`;
    }

    // التحقق من وجود المنتج في قائمة الرغبات
    isInWishlist(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return false;
        
        const wishlist = currentUser.wishlist || [];
        return wishlist.some(item => item.id === productId);
    }



    // إضافة للسلة
    addToCart(productId) {
        // التحقق من تسجيل الدخول
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            this.showNotification('Please login to add items to cart', 'error');
            window.location.href = 'Login And Registration HTML.html';
            return;
        }
        
        // التحقق من وجود نظام السلة
        if (window.cartSystem) {
            window.cartSystem.addToCart(productId, 1);
        } else {
            // نظام السلة الاحتياطي
            this.addToCartFallback(productId);
        }
    }

    // نظام السلة الاحتياطي
    addToCartFallback(productId) {
        const product = this.productDB.getProductById(productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }
        
        if (product.stock === 0) {
            this.showNotification('Out of stock', 'error');
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const cart = currentUser.cart || [];
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: `$${product.price}`,
                image: product.image,
                category: product.category,
                quantity: 1,
                offer: product.offer || null
            });
        }
        
        // تحديث المخزون
        this.productDB.updateStock(productId, 1, 'subtract');
        
        // حفظ التغييرات
        currentUser.cart = cart;
        delete currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        this.showNotification(`${product.name} added to cart`, 'success');
        this.updateCartCounter();
        this.renderProducts(); // إعادة العرض لتحديث حالة المخزون
    }

    // تحديث عداد السلة
    updateCartCounter() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const cart = currentUser.cart || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        const cartCounters = document.querySelectorAll('.cart span');
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
        });
    }

    // إزالة منتج من السلة
    removeFromCart(productId) {
        if (window.cartSystem) {
            window.cartSystem.removeFromCart(productId);
        } else {
            this.removeFromCartFallback(productId);
        }
    }

    // نظام إزالة احتياطي
    removeFromCartFallback(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const cart = currentUser.cart || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) return;
        
        const removedItem = cart[itemIndex];
        const quantity = removedItem.quantity || 1;
        
        // إعادة المنتج للمخزون
        this.productDB.updateStock(productId, quantity, 'add');
        
        // إزالة من السلة
        cart.splice(itemIndex, 1);
        currentUser.cart = cart;
        
        delete currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        this.showNotification(`${removedItem.name} removed from cart`, 'info');
        this.updateCartCounter();
        this.renderProducts();
    }

    // تحديث عداد الرغبات
    updateWishlistCount() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const wishlistCount = currentUser.wishlist?.length || 0;
        localStorage.setItem('wishlistCount', wishlistCount);
        
        // تحديث الواجهة
        const wishlistBadge = document.querySelector('.wishlist-badge');
        if (wishlistBadge) {
            wishlistBadge.textContent = wishlistCount;
        }
    }

    // مسح الفلاتر
    clearFilters() {
        // إعادة تعيين الفلاتر
        document.getElementById('categoryFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('ratingFilter').value = '';
        document.getElementById('offerFilter').checked = false;
        document.getElementById('sortSelect').value = 'name-asc';
        
        this.filters = {};
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        
        this.renderProducts();
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#40aa54' : '#4eb060'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // تبديل قائمة الرغبات
    toggleWishlist(productId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to add items to wishlist');
            return;
        }

        const product = this.productDB.getProductById(productId);
        if (!product) return;

        currentUser.wishlist = currentUser.wishlist || [];
        
        const existingIndex = currentUser.wishlist.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            // إزالة من الرغبات
            currentUser.wishlist.splice(existingIndex, 1);
            this.showNotification(`${product.name} removed from wishlist`, 'info');
        } else {
            // إضافة للرغبات
            currentUser.wishlist.push({
                ...product,
                addedAt: new Date().toISOString()
            });
            this.showNotification(`${product.name} added to wishlist!`, 'success');
        }

        // تحديث المستخدم
        this.updateUser(currentUser);

        // تحديث الواجهة
        this.updateWishlistCount();
        this.renderProducts(); // إعادة العرض لتحديث الأزرار
    }

    // تحديث المستخدم
    updateUser(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // تحديث المستخدم الحالي
        delete user.password;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// إنشاء نظام عرض المنتجات
var productRenderer = new ProductRenderer();

// تصدير للإستخدام العام
window.ProductRenderer = ProductRenderer;
window.productRenderer = productRenderer;
