// نظام سلة التسوق الديناميكي
class ShoppingCartSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.checkAuth();
        this.init();
        
        // استعادة السلة المحفوظة
        this.restoreCartFromStorage();
        
        // إعداد الحفظ التلقائي
        this.setupAutoSave();
        
        // إعداد الحفظ عند إغلاق الصفحة
        this.setupBeforeUnload();
    }

    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    checkAuth() {
        if (!this.currentUser) {
            alert('يجب تسجيل الدخول للوصول إلى سلة التسوق');
            window.location.href = 'Login And Registration HTML.html';
            return false;
        }
        return true;
    }

    // استعادة السلة من التخزين
    restoreCartFromStorage() {
        if (!this.currentUser) return;
        
        // محاولة استعادة السلة من sessionStorage
        const sessionCart = sessionStorage.getItem(`cart_${this.currentUser.id}`);
        if (sessionCart) {
            try {
                const cartData = JSON.parse(sessionCart);
                if (cartData.cart && cartData.cart.length > 0) {
                    this.currentUser.cart = cartData.cart;
                    this.currentDiscount = cartData.discount || 0;
                    
                    // تحديث المستخدم في localStorage
                    this.updateUserCart(this.currentUser.cart);
                    
                    console.log('Cart restored from session storage');
                    return;
                }
            } catch (error) {
                console.error('Error restoring cart from session:', error);
            }
        }
        
        // محاولة استعادة السلة من localStorage
        const localCart = localStorage.getItem(`cart_backup_${this.currentUser.id}`);
        if (localCart) {
            try {
                const cartData = JSON.parse(localCart);
                if (cartData.cart && cartData.cart.length > 0) {
                    this.currentUser.cart = cartData.cart;
                    this.currentDiscount = cartData.discount || 0;
                    
                    // تحديث المستخدم في localStorage
                    this.updateUserCart(this.currentUser.cart);
                    
                    console.log('Cart restored from local storage');
                }
            } catch (error) {
                console.error('Error restoring cart from local storage:', error);
            }
        }
    }

    // إعداد الحفظ التلقائي
    setupAutoSave() {
        // حفظ كل 30 ثانية
        this.autoSaveInterval = setInterval(() => {
            this.saveCartToStorage();
        }, 30000);
        
        // حفظ عند أي تغيير في السلة
        this.saveOnChanges();
    }

    // حفظ السلة في التخزين
    saveCartToStorage() {
        if (!this.currentUser) return;
        
        const cartData = {
            cart: this.currentUser.cart || [],
            discount: this.currentDiscount || 0,
            timestamp: new Date().toISOString(),
            userId: this.currentUser.id
        };
        
        try {
            // حفظ في sessionStorage (للجلسة الحالية)
            sessionStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify(cartData));
            
            // حفظ في localStorage (للاستعادة بعد إغلاق الصفحة)
            localStorage.setItem(`cart_backup_${this.currentUser.id}`, JSON.stringify(cartData));
            
            console.log('Cart saved to storage');
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // حفظ عند التغييرات
    saveOnChanges() {
        // مراقبة التغييرات في السلة
        this.cartObserver = new MutationObserver(() => {
            this.saveCartToStorage();
        });
        
        // مراقبة تغييرات في حاوية المنتجات
        const productsContainer = document.querySelector('.products');
        if (productsContainer) {
            this.cartObserver.observe(productsContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-index']
            });
        }
    }

    // إعداد الحفظ عند إغلاق الصفحة
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            this.saveCartToStorage();
        });
        
        window.addEventListener('pagehide', (e) => {
            this.saveCartToStorage();
        });
        
        // حفظ عند تغيير التبويب
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveCartToStorage();
            }
        });
    }

    // مسح التخزين عند تسجيل الخروج
    clearCartStorage() {
        if (!this.currentUser) return;
        
        sessionStorage.removeItem(`cart_${this.currentUser.id}`);
        localStorage.removeItem(`cart_backup_${this.currentUser.id}`);
        
        console.log('Cart storage cleared');
    }

    // مزامنة السلة مع الخادم (محاكاة)
    syncCartWithServer() {
        if (!this.currentUser || !navigator.onLine) return;
        
        const cartData = {
            userId: this.currentUser.id,
            cart: this.currentUser.cart || [],
            discount: this.currentDiscount || 0,
            timestamp: new Date().toISOString()
        };
        
        // محاكاة إرسال البيانات للخادم
        console.log('Syncing cart with server:', cartData);
        
        // في تطبيق حقيقي، سيتم إرسال البيانات للخادم هنا
        // fetch('/api/cart/sync', { method: 'POST', body: JSON.stringify(cartData) })
    }

    init() {
        this.loadCartItems();
        this.setupEventListeners();
        this.updateCartSummary();
        this.updateCartCounter();
        
        // إضافة مستمعي الأحداث للتحديث الفوري
        this.setupRealtimeUpdates();
        
        // حفظ الحالة الأولية
        this.saveCartToStorage();
    }

    setupRealtimeUpdates() {
        // مستمع لتغيير الكميات
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const index = parseInt(e.target.closest('.product').dataset.index);
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity >= 1 && newQuantity <= 99) {
                    // تحديث فوري للإجمالي الفردي
                    const productElement = e.target.closest('.product');
                    const unitPrice = parseFloat(productElement.querySelector('.unit-price').textContent.replace('$', '').replace(' each', ''));
                    const itemTotal = unitPrice * newQuantity;
                    
                    const itemTotalElement = productElement.querySelector('.item-total');
                    if (itemTotalElement) {
                        itemTotalElement.textContent = `$ ${itemTotal.toFixed(2)}`;
                    }
                    
                    // حفظ التغييرات
                    this.saveCartToStorage();
                }
            }
        });

        // مستمع لتغييرات الكوبون
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'couponInput' && e.key === 'Enter') {
                const couponCode = e.target.value.trim();
                if (couponCode) {
                    this.applyCoupon(couponCode);
                }
            }
        });
    }

    loadCartItems() {
        const cart = this.currentUser.cart || [];
        const productsContainer = document.querySelector('.products');
        
        if (!productsContainer) return;

        if (cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        productsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
            const productElement = this.createCartItem(item, index);
            productsContainer.appendChild(productElement);
        });
        
        // حفظ الحالة بعد التحميل
        this.saveCartToStorage();
    }

    showEmptyCart() {
        const productsContainer = document.querySelector('.products');
        if (productsContainer) {
            productsContainer.innerHTML = `
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
        
        // تحديث ملخص السلة
        this.updateCartSummary();
    }

    updateQuantity(index, newQuantity) {
        // استخدام الدالة الجديدة مع إعادة الحساب
        this.updateQuantityWithRecalculation(index, newQuantity);
    }

    removeItem(index) {
        if (confirm('Are you sure you want to remove this item?')) {
            const cart = this.currentUser.cart || [];
            const removedItem = cart[index];
            
            // إعادة المنتج للمخزون
            if (window.productDB && removedItem) {
                const quantity = removedItem.quantity || 1;
                window.productDB.updateStock(removedItem.id, quantity, 'add');
            }
            
            cart.splice(index, 1);
            
            // تحديث المستخدم
            this.updateUserCart(cart);
            
            // تحديث الملخص فوراً
            this.updateCartSummary();
            
            // إعادة تحميل السلة
            this.loadCartItems();
            
            // تحديث عداد السلة
            this.updateCartCounter();
            
            // إشعار
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
        }
    }

    updateUserCart(cart) {
        this.currentUser.cart = cart;
        
        // تحديث في قائمة المستخدمين
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // تحديث المستخدم الحالي
        delete this.currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    updateCartSummary() {
        const cart = this.currentUser.cart || [];
        const cartTotal = document.querySelector('.cart-total');
        
        if (!cartTotal) return;

        if (cart.length === 0) {
            cartTotal.innerHTML = `
                <p><span>Total Price</span><span>$ 0.00</span></p>
                <p><span>No. of Items</span><span>0</span></p>
                <p><span>You Save</span><span>$ 0.00</span></p>
                <p><span>Final Total</span><span>$ 0.00</span></p>
                <a href="index.html" class="disabled-btn">Continue Shopping</a>
            `;
            return;
        }

        let totalPrice = 0;
        let totalSavings = 0;
        let totalItems = 0;
        let subtotal = 0;

        cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;
            
            totalPrice += itemTotal;
            subtotal += itemTotal;
            totalItems += quantity;
            
            // حساب الخصم من العروض
            if (item.offer) {
                const discount = parseFloat(item.offer.replace('%', '')) / 100;
                totalSavings += itemTotal * discount;
            }
        });

        // تطبيق خصم الكوبون إذا كان موجود
        let couponDiscount = 0;
        if (this.currentDiscount) {
            couponDiscount = subtotal * (this.currentDiscount / 100);
            totalSavings += couponDiscount;
        }

        const finalTotal = totalPrice - totalSavings;

        cartTotal.innerHTML = `
            <div class="cart-summary-details">
                <p><span>Subtotal</span><span>$ ${subtotal.toFixed(2)}</span></p>
                ${totalSavings > 0 ? `<p><span>Discount</span><span style="color: #40aa54;">-$ ${totalSavings.toFixed(2)}</span></p>` : ''}
                <p class="total-price"><span>Total Price</span><span>$ ${finalTotal.toFixed(2)}</span></p>
                <p><span>No. of Items</span><span>${totalItems}</span></p>
                ${totalSavings > 0 ? `<p><span>You Save</span><span style="color: #40aa54;">$ ${totalSavings.toFixed(2)}</span></p>` : ''}
                ${this.currentDiscount ? `<p><span>Coupon Applied</span><span style="color: #40aa54;">${this.currentDiscount}%</span></p>` : ''}
            </div>
            <div class="checkout-actions">
                <div class="coupon-section">
                    <input type="text" id="couponInput" placeholder="Enter coupon code" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-right: 5px;">
                    <button onclick="cartSystem.applyCoupon(document.getElementById('couponInput').value)" style="padding: 8px 12px; background: #40aa54; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply</button>
                </div>
                <a href="Details For Checkout HTML.html" onclick="return cartSystem.saveCartForCheckout()">Proceed to Checkout</a>
            </div>
        `;

        // تحديث الإجمالي في الوقت الفعلي
        this.updateRealtimeTotals();
    }

    // تحديث الإجماليات في الوقت الفعلي
    updateRealtimeTotals() {
        const cart = this.currentUser.cart || [];
        
        // تحديث كل منتج على حدة
        cart.forEach((item, index) => {
            const productElement = document.querySelector(`[data-index="${index}"]`);
            if (productElement) {
                const price = parseFloat(item.price.replace('$', ''));
                const quantity = item.quantity || 1;
                const itemTotal = price * quantity;
                
                // تحديث إجمالي المنتج الفردي
                const itemTotalElement = productElement.querySelector('.item-total');
                if (itemTotalElement) {
                    itemTotalElement.textContent = `$ ${itemTotal.toFixed(2)}`;
                }
                
                // تحديث سعر الوحدة
                const unitPriceElement = productElement.querySelector('.unit-price');
                if (unitPriceElement) {
                    unitPriceElement.textContent = `$ ${price.toFixed(2)} each`;
                }
            }
        });
    }

    // حساب وتحديث الإجمالي عند تغيير الكمية
    updateQuantityWithRecalculation(index, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (quantity < 1 || quantity > 99) return;

        const cart = this.currentUser.cart || [];
        if (cart[index]) {
            const oldQuantity = cart[index].quantity || 1;
            cart[index].quantity = quantity;
            
            // تحديث المستخدم
            this.updateUserCart(cart);
            
            // تحديث المخزون إذا تغيرت الكمية
            const quantityDiff = quantity - oldQuantity;
            if (window.productDB && quantityDiff !== 0) {
                const operation = quantityDiff > 0 ? 'subtract' : 'add';
                window.productDB.updateStock(cart[index].id, Math.abs(quantityDiff), operation);
            }
            
            // تحديث الملخص فوراً
            this.updateCartSummary();
            
            // إعادة تحميل السلة لتحديث الأسعار
            this.loadCartItems();
            
            // حفظ التغييرات
            this.saveCartToStorage();
            
            // مزامنة مع الخادم
            this.syncCartWithServer();
            
            // إشعار للمستخدم
            this.showNotification(`Quantity updated to ${quantity}`, 'info');
        }
    }

    removeItem(index) {
        if (confirm('Are you sure you want to remove this item?')) {
            const cart = this.currentUser.cart || [];
            const removedItem = cart[index];
            
            // إعادة المنتج للمخزون
            if (window.productDB && removedItem) {
                const quantity = removedItem.quantity || 1;
                window.productDB.updateStock(removedItem.id, quantity, 'add');
            }
            
            cart.splice(index, 1);
            
            // تحديث المستخدم
            this.updateUserCart(cart);
            
            // تحديث الملخص فوراً
            this.updateCartSummary();
            
            // إعادة تحميل السلة
            this.loadCartItems();
            
            // تحديث عداد السلة
            this.updateCartCounter();
            
            // حفظ التغييرات
            this.saveCartToStorage();
            
            // مزامنة مع الخادم
            this.syncCartWithServer();
            
            // إشعار
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
        }
    }

    setupEventListeners() {
        // إضافة مستمعي الأحداث للأزرار الديناميكية
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const index = parseInt(e.target.closest('.product').dataset.index);
                this.removeItem(index);
            }
        });

        // مستمعي الأحداث لتغيير الكمية
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const index = parseInt(e.target.closest('.product').dataset.index);
                this.updateQuantity(index, e.target.value);
            }
        });
    }

    showNotification(message, type = 'info') {
        // إزالة الإشعارات الموجودة
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#40aa54' : type === 'error' ? '#ff6c57' : '#4eb060'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // إضافة منتج للسلة ديناميكياً
    addToCart(productId, quantity = 1) {
        // التحقق من وجود قاعدة البيانات
        if (!window.productDB) {
            this.showNotification('Product database not available', 'error');
            return false;
        }
        
        // البحث عن المنتج
        const product = window.productDB.getProductById(productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return false;
        }
        
        // التحقق من المخزون
        if (product.stock < quantity) {
            this.showNotification('Insufficient stock', 'error');
            return false;
        }
        
        const cart = this.currentUser.cart || [];
        
        // التحقق إذا كان المنتج موجود بالفعل
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            // تحديث الكمية إذا كان المنتج موجود
            const newQuantity = cart[existingItemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                this.showNotification('Insufficient stock for requested quantity', 'error');
                return false;
            }
            cart[existingItemIndex].quantity = newQuantity;
        } else {
            // إضافة منتج جديد للسلة
            const cartItem = {
                id: product.id,
                name: product.name,
                price: `$${product.price}`,
                image: product.image,
                category: product.category,
                quantity: quantity,
                offer: product.offer || null,
                addedAt: new Date().toISOString()
            };
            cart.push(cartItem);
        }
        
        // تحديث المخزون
        window.productDB.updateStock(productId, quantity, 'subtract');
        
        // تحديث السلة
        this.updateUserCart(cart);
        this.loadCartItems();
        
        // إشعار النجاح
        this.showNotification(`${product.name} added to cart`, 'success');
        
        // تحديث عداد السلة في الواجهة
        this.updateCartCounter();
        
        return true;
    }
    
    // إزالة منتج من السلة ديناميكياً
    removeFromCart(productId) {
        const cart = this.currentUser.cart || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            this.showNotification('Item not found in cart', 'error');
            return false;
        }
        
        const removedItem = cart[itemIndex];
        const quantity = removedItem.quantity || 1;
        
        // إعادة المنتج للمخزون
        if (window.productDB) {
            window.productDB.updateStock(productId, quantity, 'add');
        }
        
        // إزالة من السلة
        cart.splice(itemIndex, 1);
        this.updateUserCart(cart);
        this.loadCartItems();
        
        // إشعار
        this.showNotification(`${removedItem.name} removed from cart`, 'info');
        
        // تحديث عداد السلة
        this.updateCartCounter();
        
        return true;
    }
    
    // تحديث عداد السلة في الواجهة
    updateCartCounter() {
        const cart = this.currentUser.cart || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // تحديث عداد السلة في جميع الأماكن
        const cartCounters = document.querySelectorAll('.cart span, .user-profile span');
        cartCounters.forEach(counter => {
            if (counter.closest('.cart')) {
                counter.textContent = totalItems;
            }
        });
    }
    
    // تفريغ السلة بالكامل
    clearCart() {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            const cart = this.currentUser.cart || [];
            
            // إعادة جميع المنتجات للمخزون
            if (window.productDB) {
                cart.forEach(item => {
                    const quantity = item.quantity || 1;
                    window.productDB.updateStock(item.id, quantity, 'add');
                });
            }
            
            // تفريغ السلة
            this.updateUserCart([]);
            
            // مسح الخصم
            this.currentDiscount = 0;
            
            // إعادة تحميل السلة
            this.loadCartItems();
            
            // تحديث الملخص
            this.updateCartSummary();
            
            // تحديث العداد
            this.updateCartCounter();
            
            // حفظ التغييرات
            this.saveCartToStorage();
            
            // مزامنة مع الخادم
            this.syncCartWithServer();
            
            this.showNotification('Cart cleared successfully', 'info');
        }
    }
    
    // تطبيق كوبون الخصم
    applyCoupon(couponCode) {
        const coupons = {
            'SAVE10': 10,
            'SAVE20': 20,
            'WELCOME': 15,
            'SPECIAL': 25
        };
        
        const discount = coupons[couponCode.toUpperCase()];
        if (discount) {
            this.currentDiscount = discount;
            
            // تحديث فوري للملخص
            this.updateCartSummary();
            
            // حفظ التغييرات
            this.saveCartToStorage();
            
            // مزامنة مع الخادم
            this.syncCartWithServer();
            
            // إظهار إشعار النجاح
            this.showNotification(`Coupon applied: ${discount}% discount`, 'success');
            
            // مسح حقل الكوبون
            const couponInput = document.getElementById('couponInput');
            if (couponInput) {
                couponInput.value = '';
            }
            
            return true;
        } else {
            this.showNotification('Invalid coupon code', 'error');
            return false;
        }
    }
    
    // حساب الإجمالي مع الخصم
    calculateTotalWithDiscount() {
        const cart = this.currentUser.cart || [];
        let subtotal = 0;
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
        });
        
        let discount = 0;
        if (this.currentDiscount) {
            discount = subtotal * (this.currentDiscount / 100);
        }
        
        return {
            subtotal: subtotal,
            discount: discount,
            total: subtotal - discount
        };
    }

    // حفظ بيانات السلة للدفع
    saveCartForCheckout() {
        const cart = this.currentUser.cart || [];
        if (cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return false;
        }
        
        // حفظ بيانات السلة مع الإجمالي
        const totals = this.calculateTotalWithDiscount();
        const checkoutData = {
            cart: cart,
            totals: totals,
            discount: this.currentDiscount || 0,
            timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
        return true;
    }
}

// تهيئة نظام السلة
let cartSystem;

document.addEventListener('DOMContentLoaded', function() {
    cartSystem = new ShoppingCartSystem();
    
    // إضافة مستمع لزر المتابعة للدفع
    const checkoutBtn = document.querySelector('.cart-total a[href="Details For Checkout HTML.html"]');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (!cartSystem.saveCartForCheckout()) {
                e.preventDefault();
            }
        });
    }
    
    // تنظيف المؤقت عند إغلاق الصفحة
    window.addEventListener('beforeunload', function() {
        if (cartSystem && cartSystem.autoSaveInterval) {
            clearInterval(cartSystem.autoSaveInterval);
        }
    });
    
    // تنظيف المراقب عند إغلاق الصفحة
    window.addEventListener('unload', function() {
        if (cartSystem && cartSystem.cartObserver) {
            cartSystem.cartObserver.disconnect();
        }
    });
});

// إضافة CSS للإشعارات والسلة الفارغة والحسابات التلقائية
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .empty-cart {
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .empty-cart h3 {
        margin: 20px 0 10px 0;
        color: #333;
    }
    
    .empty-cart p {
        margin-bottom: 30px;
    }
    
    .quantity-input {
        width: 60px;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        text-align: center;
    }
    
    .quantity-input:focus {
        outline: none;
        border-color: #40aa54;
    }
    
    .disabled-btn {
        background: #ccc !important;
        color: #666 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
    }
    
    .btn {
        background: #40aa54;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: background 0.3s;
    }
    
    .btn:hover {
        background: #359848;
    }
    
    .btn-primary {
        background: #40aa54;
    }
    
    .btn-primary:hover {
        background: #359848;
    }
    
    .cart-summary-details {
        margin-bottom: 20px;
    }
    
    .cart-summary-details p {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        padding: 5px 0;
    }
    
    .total-price {
        font-weight: bold;
        font-size: 18px;
        border-top: 2px solid #ddd;
        padding-top: 10px;
        margin-top: 10px;
        color: #40aa54;
    }
    
    .checkout-actions {
        border-top: 1px solid #eee;
        padding-top: 15px;
    }
    
    .coupon-section {
        display: flex;
        margin-bottom: 15px;
        align-items: center;
    }
    
    .coupon-section input {
        flex: 1;
        max-width: 200px;
    }
    
    .coupon-section button:hover {
        background: #359848;
    }
    
    .item-total {
        font-size: 14px;
        font-weight: bold;
        color: #40aa54;
        margin-left: 10px;
    }
    
    .unit-price {
        color: #666;
        font-size: 14px;
    }
    
    .product-info {
        position: relative;
    }
    
    .product-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cart-total a {
        display: block;
        text-align: center;
        background: #40aa54;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 10px;
        transition: background 0.3s;
    }
    
    .cart-total a:hover {
        background: #359848;
    }
    
    @media (max-width: 768px) {
        .coupon-section {
            flex-direction: column;
            align-items: stretch;
        }
        
        .coupon-section input {
            max-width: 100%;
            margin-bottom: 10px;
        }
        
        .product-quantity {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
        }
        
        .item-total {
            margin-left: 0;
            margin-top: 5px;
        }
    }
`;
document.head.appendChild(style);
