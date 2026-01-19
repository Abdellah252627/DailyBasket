// نظام قائمة الرغبات الديناميكي
class WishlistSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.checkAuth();
        this.init();
    }

    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    checkAuth() {
        if (!this.currentUser) {
            alert('يجب تسجيل الدخول للوصول إلى قائمة الرغبات');
            window.location.href = 'Login And Registration HTML.html';
            return false;
        }
        return true;
    }

    init() {
        this.loadWishlistItems();
        this.setupEventListeners();
        this.updateWishlistSummary();
    }

    loadWishlistItems() {
        const wishlist = this.currentUser.wishlist || [];
        const wishlistContainer = document.querySelector('.wishlist-grid');
        
        if (!wishlistContainer) return;

        if (wishlist.length === 0) {
            this.showEmptyWishlist();
            return;
        }

        wishlistContainer.innerHTML = '';
        
        wishlist.forEach((item, index) => {
            const wishlistElement = this.createWishlistItem(item, index);
            wishlistContainer.appendChild(wishlistElement);
        });
    }

    createWishlistItem(item, index) {
        const div = document.createElement('div');
        div.className = 'wishlist-item';
        div.dataset.index = index;
        
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="wishlist-info">
                <h4>${item.name}</h4>
                <p class="wishlist-price">${item.price}</p>
                <p class="wishlist-date">Added on ${new Date(item.addedAt).toLocaleDateString()}</p>
            </div>
            <div class="wishlist-actions">
                <button class="btn-small btn-primary" onclick="wishlistSystem.addToCart(${index})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn-small btn-danger" onclick="wishlistSystem.removeItem(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        return div;
    }

    showEmptyWishlist() {
        const wishlistContainer = document.querySelector('.wishlist-grid');
        if (wishlistContainer) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fas fa-heart" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Add items you love to keep track of them!</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">
                        <i class="fas fa-shopping-bag"></i> Continue Shopping
                    </button>
                </div>
            `;
        }
        
        // تحديث ملخص قائمة الرغبات
        this.updateWishlistSummary();
    }

    addToCart(index) {
        const wishlist = this.currentUser.wishlist || [];
        const item = wishlist[index];
        
        if (!item) return;

        // إضافة للسلة
        this.currentUser.cart = this.currentUser.cart || [];
        
        // التحقق من وجود المنتج في السلة مسبقاً
        const existingItem = this.currentUser.cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            this.showNotification(`${item.name} quantity updated in cart`, 'info');
        } else {
            this.currentUser.cart.push({
                ...item,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
            this.showNotification(`${item.name} added to cart!`, 'success');
        }

        // تحديث المستخدم
        this.updateUserWishlist(this.currentUser);
        
        // تحديث عداد السلة في الصفحة الرئيسية
        this.updateCartCount();
    }

    removeItem(index) {
        if (confirm('Are you sure you want to remove this item from your wishlist?')) {
            const wishlist = this.currentUser.wishlist || [];
            const removedItem = wishlist[index];
            
            wishlist.splice(index, 1);
            this.currentUser.wishlist = wishlist;
            
            // تحديث المستخدم
            this.updateUserWishlist(this.currentUser);
            
            // إعادة تحميل قائمة الرغبات
            this.loadWishlistItems();
            
            // إشعار
            this.showNotification(`${removedItem.name} removed from wishlist`, 'info');
        }
    }

    updateUserWishlist(user) {
        // تحديث في قائمة المستخدمين
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

    updateWishlistSummary() {
        const wishlist = this.currentUser.wishlist || [];
        const summaryElement = document.querySelector('.wishlist-summary');
        
        if (!summaryElement) return;

        if (wishlist.length === 0) {
            summaryElement.innerHTML = `
                <p><strong>0 items</strong> in wishlist</p>
                <p>Total value: <strong>$ 0</strong></p>
            `;
            return;
        }

        const totalValue = wishlist.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return sum + price;
        }, 0);

        summaryElement.innerHTML = `
            <p><strong>${wishlist.length} items</strong> in wishlist</p>
            <p>Total value: <strong>$ ${totalValue}</strong></p>
        `;
    }

    updateCartCount() {
        const cart = this.currentUser.cart || [];
        const cartCount = cart.length;
        
        // تحديث عداد السلة في localStorage
        localStorage.setItem('cartCount', cartCount);
        
        // إرسال حدث لتحديث الواجهة
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: cartCount } }));
    }

    setupEventListeners() {
        // إضافة مستمعي الأحداث للأزرار الديناميكية
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-danger') && e.target.textContent.includes('Remove')) {
                const index = parseInt(e.target.closest('.wishlist-item').dataset.index);
                this.removeItem(index);
            }
            
            if (e.target.closest('.btn-primary') && e.target.textContent.includes('Add to Cart')) {
                const index = parseInt(e.target.closest('.wishlist-item').dataset.index);
                this.addToCart(index);
            }
        });
    }

    showNotification(message, type = 'info') {
        // إزالة الإشعارات الموجودة
        const existingNotification = document.querySelector('.wishlist-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = `wishlist-notification ${type}`;
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

    // إضافة منتج لقائمة الرغبات (للاستخدام من صفحات أخرى)
    static addToWishlist(product) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('يجب تسجيل الدخول لإضافة منتجات لقائمة الرغبات');
            return false;
        }

        currentUser.wishlist = currentUser.wishlist || [];
        
        // التحقق من وجود المنتج مسبقاً
        const exists = currentUser.wishlist.some(item => item.name === product.name);
        if (exists) {
            alert('المنتج موجود بالفعل في قائمة الرغبات');
            return false;
        }

        currentUser.wishlist.push({
            ...product,
            addedAt: new Date().toISOString()
        });

        // تحديث المستخدم
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        delete currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return true;
    }
}

// تهيئة نظام قائمة الرغبات
let wishlistSystem;

document.addEventListener('DOMContentLoaded', function() {
    wishlistSystem = new WishlistSystem();
});

// إضافة CSS للإشعارات وقائمة الرغبات الفارغة
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
    
    .empty-wishlist {
        text-align: center;
        padding: 60px 20px;
        color: #666;
        grid-column: 1 / -1;
    }
    
    .empty-wishlist h3 {
        margin: 20px 0 10px 0;
        color: #333;
    }
    
    .empty-wishlist p {
        margin-bottom: 30px;
    }
    
    .btn-small {
        padding: 8px 16px;
        font-size: 12px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s;
    }
    
    .btn-primary {
        background: #40aa54;
        color: white;
    }
    
    .btn-primary:hover {
        background: #359848;
    }
    
    .btn-danger {
        background: #ff6c57;
        color: white;
    }
    
    .btn-danger:hover {
        background: #ff5744;
    }
    
    .wishlist-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
`;
document.head.appendChild(style);
