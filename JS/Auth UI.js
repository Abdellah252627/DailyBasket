// نظام تحديث واجهة المستخدم بناءً على المصادقة
class AuthUI {
    constructor() {
        this.authSystem = new AuthSystem();
        this.init();
    }

    init() {
        this.updateNavigation();
        this.updateCartCount();
        this.updateWishlistCount();
        this.setupProtectedFeatures();
    }

    // تحديث شريط التنقل
    updateNavigation() {
        const loginLinks = document.querySelectorAll('a[href="Login And Registration HTML.html"]');
        const profileLink = document.querySelector('a[href="Profile HTML.html"]');
        const userProfileIcon = document.querySelector('.user-profile span');

        if (this.authSystem.isLoggedIn()) {
            const user = this.authSystem.currentUser;
            
            // تحديث روابط تسجيل الدخول إلى "تسجيل الخروج"
            loginLinks.forEach(link => {
                link.textContent = 'Logout';
                link.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                };
            });

            // تحديث رابط الملف الشخصي
            if (profileLink) {
                profileLink.style.display = 'flex';
                if (userProfileIcon) {
                    userProfileIcon.textContent = '1';
                }
            }

            // إضافة رسالة ترحيب
            this.addWelcomeMessage(user.name);
        } else {
            // إخفاء أيقونة الملف الشخصي إذا لم يتم تسجيل الدخول
            if (profileLink && userProfileIcon) {
                userProfileIcon.textContent = '0';
            }
        }
    }

    // إضافة رسالة ترحيب
    addWelcomeMessage(userName) {
        const header = document.querySelector('.navigation');
        if (header && !document.querySelector('.welcome-message')) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <span style="color: #40aa54; font-weight: 500; margin-left: 20px;">
                    مرحباً بك، ${userName}
                </span>
            `;
            header.appendChild(welcomeDiv);
        }
    }

    // تحديث عداد السلة
    updateCartCount() {
        if (this.authSystem.isLoggedIn()) {
            const cartCount = this.authSystem.currentUser.cart?.length || 0;
            const cartSpan = document.querySelector('.cart span');
            if (cartSpan) {
                cartSpan.textContent = cartCount;
            }
        }
    }

    // تحديث عداد قائمة الرغبات
    updateWishlistCount() {
        if (this.authSystem.isLoggedIn()) {
            const wishlistCount = this.authSystem.currentUser.wishlist?.length || 0;
            const wishlistSpan = document.querySelector('.like span');
            if (wishlistSpan) {
                wishlistSpan.textContent = wishlistCount;
            }
        }
    }

    // إعداد الميزات المحمية
    setupProtectedFeatures() {
        // حماية أزرار "إضافة للسلة"
        const cartButtons = document.querySelectorAll('.cart-btn');
        cartButtons.forEach(btn => {
            btn.onclick = (e) => {
                if (!this.authSystem.isLoggedIn()) {
                    e.preventDefault();
                    alert('يجب تسجيل الدخول لإضافة منتجات للسلة');
                    window.location.href = 'Login And Registration HTML.html';
                    return false;
                }
                this.addToCart(btn);
            };
        });

        // حماية أزرار "إضافة لقائمة الرغبات"
        const likeButtons = document.querySelectorAll('.like-btn');
        likeButtons.forEach(btn => {
            btn.onclick = (e) => {
                if (!this.authSystem.isLoggedIn()) {
                    e.preventDefault();
                    alert('يجب تسجيل الدخول لإضافة منتجات لقائمة الرغبات');
                    window.location.href = 'Login And Registration HTML.html';
                    return false;
                }
                this.addToWishlist(btn);
            };
        });

        // حماية رابط السلة
        const cartLink = document.querySelector('a[href="Shopping Cart HTML.html"]');
        if (cartLink) {
            cartLink.onclick = (e) => {
                if (!this.authSystem.isLoggedIn()) {
                    e.preventDefault();
                    alert('يجب تسجيل الدخول للوصول إلى السلة');
                    window.location.href = 'Login And Registration HTML.html';
                    return false;
                }
            };
        }

        // حماية رابط قائمة الرغبات
        const wishlistLink = document.querySelector('a[href="Wishlist HTML.html"]');
        if (wishlistLink) {
            wishlistLink.onclick = (e) => {
                if (!this.authSystem.isLoggedIn()) {
                    e.preventDefault();
                    alert('يجب تسجيل الدخول للوصول إلى قائمة الرغبات');
                    window.location.href = 'Login And Registration HTML.html';
                    return false;
                }
            };
        }

        // حماية رابط الملف الشخصي
        const profileLink = document.querySelector('a[href="Profile HTML.html"]');
        if (profileLink) {
            profileLink.onclick = (e) => {
                if (!this.authSystem.isLoggedIn()) {
                    e.preventDefault();
                    alert('يجب تسجيل الدخول للوصول إلى الملف الشخصي');
                    window.location.href = 'Login And Registration HTML.html';
                    return false;
                }
            };
        }
    }

    // إضافة منتج للسلة
    addToCart(button) {
        const productBox = button.closest('.product-box');
        if (!productBox) return;

        const product = {
            id: Date.now(),
            name: productBox.querySelector('strong').textContent,
            price: productBox.querySelector('.price').textContent,
            quantity: 1,
            image: productBox.querySelector('img').src,
            addedAt: new Date().toISOString()
        };

        const user = this.authSystem.currentUser;
        user.cart = user.cart || [];
        user.cart.push(product);

        // تحديث المستخدم في النظام
        this.authSystem.updateUser({ cart: user.cart });

        // تحديث العداد
        this.updateCartCount();

        // رسالة تأكيد
        this.showNotification('تم إضافة المنتج للسلة بنجاح');
    }

    // إضافة منتج لقائمة الرغبات
    addToWishlist(button) {
        const productBox = button.closest('.product-box');
        if (!productBox) return;

        const product = {
            id: Date.now(),
            name: productBox.querySelector('strong').textContent,
            price: productBox.querySelector('.price').textContent,
            image: productBox.querySelector('img').src,
            addedAt: new Date().toISOString()
        };

        const user = this.authSystem.currentUser;
        user.wishlist = user.wishlist || [];
        
        // التحقق من وجود المنتج مسبقاً
        const exists = user.wishlist.some(item => item.name === product.name);
        if (exists) {
            this.showNotification('المنتج موجود بالفعل في قائمة الرغبات');
            return;
        }

        user.wishlist.push(product);

        // تحديث المستخدم في النظام
        this.authSystem.updateUser({ wishlist: user.wishlist });

        // تحديث العداد
        this.updateWishlistCount();

        // تغيير أيقونة القلب
        const heartIcon = button.querySelector('i');
        if (heartIcon) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = '#ff6c57';
        }

        // رسالة تأكيد
        this.showNotification('تم إضافة المنتج لقائمة الرغبات بنجاح');
    }

    // تسجيل الخروج
    logout() {
        const result = this.authSystem.logout();
        if (result.success) {
            this.showNotification(result.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    // عرض إشعارات للمستخدم
    showNotification(message) {
        // إزالة أي إشعارات موجودة
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #40aa54;
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
}

// نظام المصادقة الأساسي (نسخة مبسطة للصفحات الأخرى)
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
    }

    loadUsers() {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    }

    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    updateUser(updates) {
        if (!this.currentUser) return { success: false };
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return { success: false };

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(this.users));

        const updatedUser = { ...this.users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return { success: true, user: updatedUser };
    }

    logout() {
        localStorage.removeItem('currentUser');
        return { success: true, message: 'تم تسجيل الخروج' };
    }
}

// تهيئة نظام واجهة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    new AuthUI();
});

// إضافة CSS للإشعارات
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
    
    .welcome-message {
        display: flex;
        align-items: center;
    }
    
    .like-btn i.fas {
        color: #ff6c57 !important;
    }
`;
document.head.appendChild(style);
