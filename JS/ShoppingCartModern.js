/**
 * Modern Shopping Cart System - ES6+ Implementation
 * DailyBasket Grocery Store - Advanced Cart Management
 */

// Constants and Configuration
const CART_CONFIG = {
    AUTO_SAVE_INTERVAL: 30000,
    MAX_QUANTITY: 99,
    MIN_QUANTITY: 1,
    STORAGE_KEYS: {
        SESSION: (userId) => `cart_${userId}`,
        BACKUP: (userId) => `cart_backup_${userId}`,
        CHECKOUT: 'checkoutCart'
    },
    COUPONS: {
        SAVE10: 10,
        SAVE20: 20,
        WELCOME: 15,
        SPECIAL: 25
    },
    NOTIFICATION_DURATION: 3000
};

// Utility Functions
const CartUtils = {
    /**
     * Format currency with proper decimal places
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    },

    /**
     * Parse price from string format
     * @param {string} priceString - Price string like "$1.30"
     * @returns {number} Parsed price as number
     */
    parsePrice(priceString) {
        return parseFloat(priceString.replace('$', ''));
    },

    /**
     * Generate unique ID for cart operations
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Debounce function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Deep clone object to prevent reference issues
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// Data Models
class CartItem {
    constructor(product, quantity = 1) {
        this.id = product.id;
        this.name = product.name;
        this.price = product.price;
        this.image = product.image;
        this.category = product.category;
        this.quantity = quantity;
        this.offer = product.offer || null;
        this.addedAt = new Date().toISOString();
    }

    /**
     * Calculate total price for this item
     * @returns {number} Total price
     */
    get total() {
        const price = CartUtils.parsePrice(this.price);
        return price * this.quantity;
    }

    /**
     * Calculate discount amount for this item
     * @returns {number} Discount amount
     */
    get discount() {
        if (!this.offer) return 0;
        const discountPercent = parseFloat(this.offer.replace('%', '')) / 100;
        return this.total * discountPercent;
    }

    /**
     * Get final price after discount
     * @returns {number} Final price
     */
    get finalPrice() {
        return this.total - this.discount;
    }

    /**
     * Validate cart item data
     * @returns {boolean} Is valid
     */
    isValid() {
        return this.id && this.name && this.price && this.quantity >= CART_CONFIG.MIN_QUANTITY;
    }
}

class CartSummary {
    constructor(items = [], couponDiscount = 0) {
        this.items = items;
        this.couponDiscount = couponDiscount;
    }

    /**
     * Calculate subtotal
     * @returns {number} Subtotal amount
     */
    get subtotal() {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    /**
     * Calculate total discount from items
     * @returns {number} Total discount amount
     */
    get itemDiscounts() {
        return this.items.reduce((sum, item) => sum + item.discount, 0);
    }

    /**
     * Calculate coupon discount amount
     * @returns {number} Coupon discount amount
     */
    get couponDiscountAmount() {
        return this.subtotal * (this.couponDiscount / 100);
    }

    /**
     * Calculate total discount
     * @returns {number} Total discount amount
     */
    get totalDiscount() {
        return this.itemDiscounts + this.couponDiscountAmount;
    }

    /**
     * Calculate final total
     * @returns {number} Final total amount
     */
    get total() {
        return this.subtotal - this.totalDiscount;
    }

    /**
     * Get total number of items
     * @returns {number} Total items count
     */
    get itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Get summary object for display
     * @returns {Object} Summary data
     */
    getSummary() {
        return {
            subtotal: this.subtotal,
            itemDiscounts: this.itemDiscounts,
            couponDiscountAmount: this.couponDiscountAmount,
            totalDiscount: this.totalDiscount,
            total: this.total,
            itemCount: this.itemCount,
            couponDiscount: this.couponDiscount
        };
    }
}

// Storage Management
class CartStorage {
    constructor(userId) {
        this.userId = userId;
    }

    /**
     * Save cart data to multiple storage locations
     * @param {Array} items - Cart items
     * @param {number} couponDiscount - Coupon discount percentage
     */
    save(items, couponDiscount = 0) {
        const cartData = {
            cart: items,
            discount: couponDiscount,
            timestamp: new Date().toISOString(),
            userId: this.userId
        };

        try {
            // Save to sessionStorage for current session
            sessionStorage.setItem(
                CART_CONFIG.STORAGE_KEYS.SESSION(this.userId), 
                JSON.stringify(cartData)
            );

            // Save to localStorage as backup
            localStorage.setItem(
                CART_CONFIG.STORAGE_KEYS.BACKUP(this.userId), 
                JSON.stringify(cartData)
            );

            console.log('Cart saved to storage successfully');
            return true;
        } catch (error) {
            console.error('Error saving cart to storage:', error);
            return false;
        }
    }

    /**
     * Restore cart data from storage
     * @returns {Object|null} Restored cart data or null
     */
    restore() {
        // Try sessionStorage first (fastest)
        const sessionCart = sessionStorage.getItem(
            CART_CONFIG.STORAGE_KEYS.SESSION(this.userId)
        );
        
        if (sessionCart) {
            try {
                const cartData = JSON.parse(sessionCart);
                if (cartData.cart && cartData.cart.length > 0) {
                    console.log('Cart restored from session storage');
                    return cartData;
                }
            } catch (error) {
                console.error('Error parsing session cart:', error);
            }
        }

        // Try localStorage as backup
        const localCart = localStorage.getItem(
            CART_CONFIG.STORAGE_KEYS.BACKUP(this.userId)
        );
        
        if (localCart) {
            try {
                const cartData = JSON.parse(localCart);
                if (cartData.cart && cartData.cart.length > 0) {
                    console.log('Cart restored from local storage');
                    return cartData;
                }
            } catch (error) {
                console.error('Error parsing local cart:', error);
            }
        }

        return null;
    }

    /**
     * Clear all cart storage
     */
    clear() {
        sessionStorage.removeItem(CART_CONFIG.STORAGE_KEYS.SESSION(this.userId));
        localStorage.removeItem(CART_CONFIG.STORAGE_KEYS.BACKUP(this.userId));
        console.log('Cart storage cleared');
    }

    /**
     * Save checkout data
     * @param {Object} checkoutData - Checkout information
     */
    saveCheckout(checkoutData) {
        try {
            sessionStorage.setItem(
                CART_CONFIG.STORAGE_KEYS.CHECKOUT, 
                JSON.stringify(checkoutData)
            );
            return true;
        } catch (error) {
            console.error('Error saving checkout data:', error);
            return false;
        }
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    /**
     * Create notification container
     * @returns {HTMLElement} Container element
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     * @param {number} duration - Display duration
     */
    show(message, type = 'info', duration = CART_CONFIG.NOTIFICATION_DURATION) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);
    }

    /**
     * Create notification element
     * @param {string} message - Message content
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const colors = {
            success: '#40aa54',
            error: '#ff6c57',
            info: '#4eb060'
        };

        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;

        return notification;
    }

    /**
     * Remove notification with animation
     * @param {HTMLElement} notification - Notification element
     */
    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Event Management
class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}

// Main Shopping Cart Class
class ShoppingCartModern {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.storage = new CartStorage(this.currentUser?.id);
        this.notifications = new NotificationManager();
        this.events = new EventManager();
        
        this.items = [];
        this.couponDiscount = 0;
        this.autoSaveInterval = null;
        this.observer = null;

        this.init();
    }

    /**
     * Initialize the cart system
     */
    async init() {
        if (!this.checkAuth()) return;

        // Restore cart from storage
        await this.restoreCart();
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup DOM observers
        this.setupDOMObserver();
        
        // Setup page lifecycle events
        this.setupPageLifecycle();
        
        // Load cart items in UI
        this.loadCartItems();
        
        // Emit initialization event
        this.events.emit('cart:initialized', {
            itemCount: this.items.length,
            total: this.summary.total
        });
    }

    /**
     * Get current user from storage
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        try {
            const stored = localStorage.getItem('currentUser');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Check user authentication
     * @returns {boolean} Is authenticated
     */
    checkAuth() {
        if (!this.currentUser) {
            this.notifications.show('Please login to access shopping cart', 'error');
            window.location.href = 'Login And Registration HTML.html';
            return false;
        }
        return true;
    }

    /**
     * Restore cart from storage
     */
    async restoreCart() {
        const cartData = this.storage.restore();
        if (cartData) {
            this.items = cartData.cart.map(itemData => 
                Object.assign(new CartItem(itemData), itemData)
            );
            this.couponDiscount = cartData.discount || 0;
            
            // Update user data
            this.updateUserCart();
            
            this.notifications.show('Cart restored successfully', 'success');
            this.events.emit('cart:restored', { itemCount: this.items.length });
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveToStorage();
        }, CART_CONFIG.AUTO_SAVE_INTERVAL);

        // Save on cart changes
        this.events.on('cart:itemAdded', () => this.saveToStorage());
        this.events.on('cart:itemRemoved', () => this.saveToStorage());
        this.events.on('cart:quantityChanged', () => this.saveToStorage());
        this.events.on('cart:couponApplied', () => this.saveToStorage());
        this.events.on('cart:cleared', () => this.saveToStorage());
    }

    /**
     * Setup DOM observer for auto-save
     */
    setupDOMObserver() {
        const productsContainer = document.querySelector('.products');
        if (productsContainer) {
            this.observer = new MutationObserver(
                CartUtils.debounce(() => {
                    this.saveToStorage();
                }, 1000)
            );

            this.observer.observe(productsContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-index']
            });
        }
    }

    /**
     * Setup page lifecycle events
     */
    setupPageLifecycle() {
        // Save before unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });

        // Save when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveToStorage();
            }
        });

        // Cleanup on unload
        window.addEventListener('unload', () => {
            this.cleanup();
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Quantity change listeners
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const index = parseInt(e.target.closest('.product').dataset.index);
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity >= CART_CONFIG.MIN_QUANTITY && newQuantity <= CART_CONFIG.MAX_QUANTITY) {
                    this.updateQuantity(index, newQuantity);
                }
            }
        });

        // Remove item listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const index = parseInt(e.target.closest('.product').dataset.index);
                this.removeItem(index);
            }
        });

        // Coupon input listeners
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'couponInput' && e.key === 'Enter') {
                const couponCode = e.target.value.trim();
                if (couponCode) {
                    this.applyCoupon(couponCode);
                }
            }
        });
    }

    /**
     * Get cart summary
     * @returns {CartSummary} Cart summary instance
     */
    get summary() {
        return new CartSummary(this.items, this.couponDiscount);
    }

    /**
     * Add item to cart
     * @param {Object} product - Product data
     * @param {number} quantity - Quantity to add
     * @returns {boolean} Success status
     */
    addItem(product, quantity = 1) {
        try {
            // Validate product
            if (!product || !product.id) {
                throw new Error('Invalid product data');
            }

            // Check stock
            if (window.productDB) {
                const productData = window.productDB.getProductById(product.id);
                if (productData && productData.stock < quantity) {
                    this.notifications.show('Insufficient stock', 'error');
                    return false;
                }
            }

            // Check if item already exists
            const existingIndex = this.items.findIndex(item => item.id === product.id);
            
            if (existingIndex !== -1) {
                // Update quantity
                const newQuantity = this.items[existingIndex].quantity + quantity;
                this.items[existingIndex].quantity = newQuantity;
            } else {
                // Add new item
                const cartItem = new CartItem(product, quantity);
                this.items.push(cartItem);
            }

            // Update stock
            if (window.productDB) {
                window.productDB.updateStock(product.id, quantity, 'subtract');
            }

            // Update UI
            this.loadCartItems();
            this.updateCartCounter();
            
            // Emit events
            this.events.emit('cart:itemAdded', { product, quantity });
            
            this.notifications.show(`${product.name} added to cart`, 'success');
            return true;

        } catch (error) {
            console.error('Error adding item to cart:', error);
            this.notifications.show('Error adding item to cart', 'error');
            return false;
        }
    }

    /**
     * Remove item from cart
     * @param {number} index - Item index
     * @returns {boolean} Success status
     */
    removeItem(index) {
        try {
            if (index < 0 || index >= this.items.length) {
                throw new Error('Invalid item index');
            }

            const item = this.items[index];
            
            // Return stock
            if (window.productDB) {
                window.productDB.updateStock(item.id, item.quantity, 'add');
            }

            // Remove item
            this.items.splice(index, 1);

            // Update UI
            this.loadCartItems();
            this.updateCartCounter();
            
            // Emit events
            this.events.emit('cart:itemRemoved', { item });
            
            this.notifications.show(`${item.name} removed from cart`, 'info');
            return true;

        } catch (error) {
            console.error('Error removing item from cart:', error);
            this.notifications.show('Error removing item from cart', 'error');
            return false;
        }
    }

    /**
     * Update item quantity
     * @param {number} index - Item index
     * @param {number} newQuantity - New quantity
     * @returns {boolean} Success status
     */
    updateQuantity(index, newQuantity) {
        try {
            if (index < 0 || index >= this.items.length) {
                throw new Error('Invalid item index');
            }

            if (newQuantity < CART_CONFIG.MIN_QUANTITY || newQuantity > CART_CONFIG.MAX_QUANTITY) {
                throw new Error('Invalid quantity');
            }

            const item = this.items[index];
            const oldQuantity = item.quantity;
            const quantityDiff = newQuantity - oldQuantity;

            // Update stock
            if (window.productDB && quantityDiff !== 0) {
                const operation = quantityDiff > 0 ? 'subtract' : 'add';
                window.productDB.updateStock(item.id, Math.abs(quantityDiff), operation);
            }

            // Update quantity
            item.quantity = newQuantity;

            // Update UI
            this.updateCartSummary();
            this.updateItemTotal(index);
            
            // Emit events
            this.events.emit('cart:quantityChanged', { item, newQuantity, oldQuantity });
            
            return true;

        } catch (error) {
            console.error('Error updating quantity:', error);
            this.notifications.show('Error updating quantity', 'error');
            return false;
        }
    }

    /**
     * Apply coupon discount
     * @param {string} couponCode - Coupon code
     * @returns {boolean} Success status
     */
    applyCoupon(couponCode) {
        try {
            const discount = CART_CONFIG.COUPONS[couponCode.toUpperCase()];
            
            if (!discount) {
                this.notifications.show('Invalid coupon code', 'error');
                return false;
            }

            this.couponDiscount = discount;
            
            // Update UI
            this.updateCartSummary();
            
            // Clear input
            const couponInput = document.getElementById('couponInput');
            if (couponInput) {
                couponInput.value = '';
            }
            
            // Emit events
            this.events.emit('cart:couponApplied', { discount, code: couponCode });
            
            this.notifications.show(`Coupon applied: ${discount}% discount`, 'success');
            return true;

        } catch (error) {
            console.error('Error applying coupon:', error);
            this.notifications.show('Error applying coupon', 'error');
            return false;
        }
    }

    /**
     * Clear entire cart
     * @returns {boolean} Success status
     */
    clearCart() {
        try {
            if (!confirm('Are you sure you want to clear your entire cart?')) {
                return false;
            }

            // Return all items to stock
            if (window.productDB) {
                this.items.forEach(item => {
                    window.productDB.updateStock(item.id, item.quantity, 'add');
                });
            }

            // Clear items
            this.items = [];
            this.couponDiscount = 0;

            // Update UI
            this.loadCartItems();
            this.updateCartCounter();
            
            // Emit events
            this.events.emit('cart:cleared');
            
            this.notifications.show('Cart cleared successfully', 'info');
            return true;

        } catch (error) {
            console.error('Error clearing cart:', error);
            this.notifications.show('Error clearing cart', 'error');
            return false;
        }
    }

    /**
     * Save cart to storage
     */
    saveToStorage() {
        this.storage.save(this.items, this.couponDiscount);
        this.events.emit('cart:saved');
    }

    /**
     * Update user cart data
     */
    updateUserCart() {
        if (!this.currentUser) return;

        this.currentUser.cart = this.items;
        
        // Update users array
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex] = this.currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user
            delete this.currentUser.password;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
        } catch (error) {
            console.error('Error updating user cart:', error);
        }
    }

    /**
     * Load cart items in UI
     */
    loadCartItems() {
        const container = document.querySelector('.products');
        if (!container) return;

        if (this.items.length === 0) {
            this.showEmptyCart(container);
        } else {
            this.renderCartItems(container);
        }

        this.updateCartSummary();
    }

    /**
     * Render cart items
     * @param {HTMLElement} container - Container element
     */
    renderCartItems(container) {
        container.innerHTML = '';
        
        this.items.forEach((item, index) => {
            const itemElement = this.createCartItemElement(item, index);
            container.appendChild(itemElement);
        });
    }

    /**
     * Create cart item element
     * @param {CartItem} item - Cart item
     * @param {number} index - Item index
     * @returns {HTMLElement} Item element
     */
    createCartItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'product';
        div.dataset.index = index;
        
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" 
                 onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
            <div class="product-info">
                <h3 class="product-name">${item.name}</h3>
                <h4 class="product-price unit-price">${CartUtils.formatCurrency(CartUtils.parsePrice(item.price))} each</h4>
                ${item.offer ? `<h4 class="product-offer">${item.offer} OFF</h4>` : ''}
                <p class="product-quantity">
                    Qnt: 
                    <input type="number" value="${item.quantity}" 
                           min="${CART_CONFIG.MIN_QUANTITY}" 
                           max="${CART_CONFIG.MAX_QUANTITY}" 
                           class="quantity-input">
                    <span class="item-total">${CartUtils.formatCurrency(item.finalPrice)}</span>
                </p>
                <p class="product-remove">
                    <i class="fas fa-trash-alt"></i>
                    <span class="remove">Remove</span>
                </p>
            </div>
        `;
        
        return div;
    }

    /**
     * Show empty cart state
     * @param {HTMLElement} container - Container element
     */
    showEmptyCart(container) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html'">
                    <i class="fas fa-shopping-bag"></i> Continue Shopping
                </button>
            </div>
        `;
    }

    /**
     * Update cart summary
     */
    updateCartSummary() {
        const container = document.querySelector('.cart-total');
        if (!container) return;

        const summary = this.summary.getSummary();

        if (this.items.length === 0) {
            container.innerHTML = `
                <p><span>Total Price</span><span>${CartUtils.formatCurrency(0)}</span></p>
                <p><span>No. of Items</span><span>0</span></p>
                <p><span>You Save</span><span>${CartUtils.formatCurrency(0)}</span></p>
                <a href="index.html" class="disabled-btn">Continue Shopping</a>
            `;
        } else {
            container.innerHTML = `
                <div class="cart-summary-details">
                    <p><span>Subtotal</span><span>${CartUtils.formatCurrency(summary.subtotal)}</span></p>
                    ${summary.totalDiscount > 0 ? 
                        `<p><span>Discount</span><span style="color: #40aa54;">-${CartUtils.formatCurrency(summary.totalDiscount)}</span></p>` : ''}
                    <p class="total-price"><span>Total Price</span><span>${CartUtils.formatCurrency(summary.total)}</span></p>
                    <p><span>No. of Items</span><span>${summary.itemCount}</span></p>
                    ${summary.totalDiscount > 0 ? 
                        `<p><span>You Save</span><span style="color: #40aa54;">${CartUtils.formatCurrency(summary.totalDiscount)}</span></p>` : ''}
                    ${this.couponDiscount > 0 ? 
                        `<p><span>Coupon Applied</span><span style="color: #40aa54;">${this.couponDiscount}%</span></p>` : ''}
                </div>
                <div class="checkout-actions">
                    <div class="coupon-section">
                        <input type="text" id="couponInput" placeholder="Enter coupon code">
                        <button onclick="cartModern.applyCoupon(document.getElementById('couponInput').value)">Apply</button>
                    </div>
                    <a href="Details For Checkout HTML.html" onclick="return cartModern.saveForCheckout()">Proceed to Checkout</a>
                </div>
            `;
        }
    }

    /**
     * Update individual item total
     * @param {number} index - Item index
     */
    updateItemTotal(index) {
        const item = this.items[index];
        const itemElement = document.querySelector(`[data-index="${index}"]`);
        
        if (itemElement && item) {
            const totalElement = itemElement.querySelector('.item-total');
            if (totalElement) {
                totalElement.textContent = CartUtils.formatCurrency(item.finalPrice);
            }
        }
    }

    /**
     * Update cart counter
     */
    updateCartCounter() {
        const summary = this.summary.getSummary();
        const counters = document.querySelectorAll('.cart span');
        
        counters.forEach(counter => {
            if (counter.closest('.cart')) {
                counter.textContent = summary.itemCount;
            }
        });
    }

    /**
     * Save cart for checkout
     * @returns {boolean} Success status
     */
    saveForCheckout() {
        if (this.items.length === 0) {
            this.notifications.show('Your cart is empty', 'error');
            return false;
        }

        const checkoutData = {
            cart: this.items,
            summary: this.summary.getSummary(),
            timestamp: new Date().toISOString()
        };

        return this.storage.saveCheckout(checkoutData);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.saveToStorage();
    }
}

// Initialize the modern cart system
let cartModern;

document.addEventListener('DOMContentLoaded', () => {
    cartModern = new ShoppingCartModern();
    
    // Make it globally available
    window.cartModern = cartModern;
    window.ShoppingCartModern = ShoppingCartModern;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCartModern, CartItem, CartSummary };
}
