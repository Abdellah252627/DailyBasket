    // نظام المصادقة للملف الشخصي
class ProfileAuthSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.checkAuth();
    }

    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    checkAuth() {
        if (!this.currentUser) {
            alert('يجب تسجيل الدخول للوصول إلى الملف الشخصي');
            window.location.href = 'Login And Registration HTML.html';
            return false;
        }
        return true;
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Enhanced Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من المصادقة أولاً
    const authSystem = new ProfileAuthSystem();
    if (!authSystem.checkAuth()) return;
    
    initializeProfile();
    loadUserData();
});

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // تحميل بيانات المستخدم في النموذج
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (fullNameInput) fullNameInput.value = currentUser.name || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (phoneInput) phoneInput.value = currentUser.phone || '';

    // تحميل بيانات السلة والطلبات
    loadUserOrders();
    loadUserWishlist();
}

function loadUserOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // جلب الطلبات من localStorage (محاكاة)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => order.userId === currentUser.id);

    if (userOrders.length === 0) {
        showNoOrdersMessage();
        return;
    }

    // تحديث ملخص الطلبات
    updateOrderSummary(userOrders);
    
    // عرض الطلبات
    displayOrders(userOrders);
}

function updateOrderSummary(orders) {
    const totalOrdersElement = document.querySelector('.summary-card:nth-child(1) .summary-number');
    const totalSpentElement = document.querySelector('.summary-card:nth-child(2) .summary-amount');
    const activeOrdersElement = document.querySelector('.summary-card:nth-child(3) .summary-number');
    const pendingOrdersElement = document.querySelector('.summary-card:nth-child(4) .summary-number');
    const cancelledOrdersElement = document.querySelector('.summary-card:nth-child(5) .summary-number');

    if (totalOrdersElement) totalOrdersElement.textContent = orders.length;
    
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    if (totalSpentElement) totalSpentElement.textContent = `$ ${totalSpent}`;
    
    const activeOrders = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
    if (activeOrdersElement) activeOrdersElement.textContent = activeOrders;
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    if (pendingOrdersElement) pendingOrdersElement.textContent = pendingOrders;
    
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    if (cancelledOrdersElement) cancelledOrdersElement.textContent = cancelledOrders;
}

function displayOrders(orders) {
    const orderList = document.getElementById('orderList');
    if (!orderList) return;

    orderList.innerHTML = '';

    orders.forEach(order => {
        const orderItem = createOrderItem(order);
        orderList.appendChild(orderItem);
    });
}

function createOrderItem(order) {
    const div = document.createElement('div');
    div.className = 'order-item';
    
    const statusClass = order.status === 'delivered' ? 'delivered' : 
                       order.status === 'processing' ? 'processing' : 
                       order.status === 'shipped' ? 'shipped' : 
                       order.status === 'cancelled' ? 'cancelled' : 'pending';

    div.innerHTML = `
        <div class="order-header">
            <span class="order-id">#${order.id}</span>
            <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            <span class="order-status ${statusClass}">${order.status}</span>
            <span class="order-total">$ ${order.total}</span>
        </div>
        <div class="order-products">
            ${order.products.map(product => `
                <div class="product-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <p>Quantity: ${product.quantity} | Price: $ ${product.price}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="order-actions">
            <button class="btn-small" onclick="viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
            ${order.status !== 'cancelled' && order.status !== 'delivered' ? 
                `<button class="btn-small btn-danger" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>` : ''}
            ${order.status === 'shipped' ? 
                `<button class="btn-small btn-primary" onclick="confirmDelivery('${order.id}')">
                    <i class="fas fa-check"></i> Confirm Delivery
                </button>` : ''}
            <button class="btn-small" onclick="trackOrder('${order.id}')">
                <i class="fas fa-truck"></i> Track Package
            </button>
        </div>
    `;
    
    return div;
}

function loadUserWishlist() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const wishlist = currentUser.wishlist || [];
    
    if (wishlist.length === 0) {
        const wishlistGrid = document.querySelector('.wishlist-grid');
        if (wishlistGrid) {
            wishlistGrid.innerHTML = '<p class="empty-wishlist">No items in wishlist</p>';
        }
        return;
    }

    displayWishlist(wishlist);
}

function displayWishlist(wishlist) {
    const wishlistGrid = document.querySelector('.wishlist-grid');
    if (!wishlistGrid) return;

    wishlistGrid.innerHTML = '';

    wishlist.forEach((item, index) => {
        const wishlistItem = createWishlistItem(item, index);
        wishlistGrid.appendChild(wishlistItem);
    });

    updateWishlistSummary(wishlist);
}

function createWishlistItem(item, index) {
    const div = document.createElement('div');
    div.className = 'wishlist-item';
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="wishlist-info">
            <h4>${item.name}</h4>
            <p class="wishlist-price">${item.price}</p>
            <p class="wishlist-date">Added on ${new Date(item.addedAt).toLocaleDateString()}</p>
        </div>
        <div class="wishlist-actions">
            <button class="btn-small btn-primary" onclick="addToCartFromWishlist(${index})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="btn-small btn-danger" onclick="removeFromWishlist(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    
    return div;
}

function updateWishlistSummary(wishlist) {
    const summaryElement = document.querySelector('.wishlist-summary');
    if (!summaryElement) return;

    const totalValue = wishlist.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return sum + price;
    }, 0);

    summaryElement.innerHTML = `
        <p><strong>${wishlist.length} items</strong> in wishlist</p>
        <p>Total value: <strong>$ ${totalValue}</strong></p>
    `;
}

function addToCartFromWishlist(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const wishlist = currentUser.wishlist || [];
    const item = wishlist[index];
    
    if (!item) return;

    // إضافة للسلة
    currentUser.cart = currentUser.cart || [];
    currentUser.cart.push({
        ...item,
        quantity: 1,
        addedAt: new Date().toISOString()
    });

    // تحديث المستخدم
    updateUserInStorage(currentUser);

    showNotification(`${item.name} added to cart!`, 'success');
}

function removeFromWishlist(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const wishlist = currentUser.wishlist || [];
    const item = wishlist[index];
    
    if (!item) return;

    if (confirm(`Remove ${item.name} from wishlist?`)) {
        wishlist.splice(index, 1);
        currentUser.wishlist = wishlist;
        
        updateUserInStorage(currentUser);
        loadUserWishlist(); // إعادة تحميل القائمة
        
        showNotification(`${item.name} removed from wishlist`, 'info');
    }
}

function updateUserInStorage(user) {
    // تحديث في قائمة المستخدمين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // تحديث المستخدم الحالي
    delete user.password; // إزالة كلمة المرور للأمان
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function initializeProfile() {
    // Tab functionality
    const tabBtn = document.querySelectorAll(".tab");
    const tab = document.querySelectorAll(".tabShow");
    
    // Form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Settings toggles
    initializeSettings();
    
    // Wishlist functionality
    initializeWishlist();
    
    // Order tracking
    initializeOrderTracking();
    
    // Tab click event
    tabBtn.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const index = Array.prototype.indexOf.call(tabBtn, btn);
            tabs(index);
        });
    });
}

function tabs(panelIndex) {
    // Hide all tabs
    tab.forEach(function(node) {
        node.style.display = "none";
    });
    
    // Remove active class from all tabs
    tabBtn.forEach(function(btn) {
        btn.classList.remove("active");
    });
    
    // Show selected tab
    if (tab[panelIndex]) {
        tab[panelIndex].style.display = "block";
        tabBtn[panelIndex].classList.add("active");
    }
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('User not found. Please login again.', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const updateData = {
        name: formData.get('fullName') || document.getElementById('fullName').value,
        email: formData.get('email') || document.getElementById('email').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        gender: formData.get('gender') || document.getElementById('gender').value,
        birthday: formData.get('birthday') || document.getElementById('birthday').value,
        address: formData.get('address') || document.getElementById('address').value
    };
    
    // Validate form
    if (validateProfileForm(updateData)) {
        // تحديث بيانات المستخدم
        const updatedUser = { ...currentUser, ...updateData };
        
        // حفظ التغييرات
        updateUserInStorage(updatedUser);
        
        // Show success message
        showNotification('Profile updated successfully!', 'success');
        
        console.log('Profile update:', updateData);
    }
}

function validateProfileForm(data) {
    // Basic validation
    if (!data.fullName || data.fullName.length < 2) {
        showNotification('Please enter a valid name', 'error');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!data.phone || data.phone.length < 10) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeSettings() {
    const settingsToggles = document.querySelectorAll('.setting-item input[type="checkbox"]');
    
    settingsToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.id;
            const isEnabled = this.checked;
            
            // Save setting (in real app, send to server)
            saveSetting(settingName, isEnabled);
            
            // Show feedback
            const settingLabel = this.nextElementSibling.textContent.trim();
            showNotification(`${settingLabel} ${isEnabled ? 'enabled' : 'disabled'}`, 'info');
        });
    });
}

function saveSetting(settingName, value) {
    // Save to localStorage
    localStorage.setItem(settingName, value);
    console.log(`Setting ${settingName}:`, value);
}

function initializeWishlist() {
    const addToCartButtons = document.querySelectorAll('.wishlist .btn-primary');
    const removeButtons = document.querySelectorAll('.wishlist .btn-danger');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.closest('.wishlist-item').querySelector('h4').textContent;
            showNotification(`${productName} added to cart!`, 'success');
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.closest('.wishlist-item');
            const productName = item.querySelector('h4').textContent;
            
            if (confirm(`Remove ${productName} from wishlist?`)) {
                item.remove();
                updateWishlistCount();
                showNotification(`${productName} removed from wishlist`, 'info');
            }
        });
    });
}

function initializeOrderTracking() {
    const trackButtons = document.querySelectorAll('.order-actions .btn-small');
    const viewButtons = document.querySelectorAll('.order-actions .btn-small');
    const searchInput = document.getElementById('orderSearch');
    const searchBtn = document.getElementById('searchOrderBtn');
    const orderFilter = document.getElementById('orderFilter');
    const timeFilter = document.getElementById('timeFilter');
    
    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', searchOrders);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchOrders();
            }
        });
    }
    
    // Filter functionality
    if (orderFilter) {
        orderFilter.addEventListener('change', filterOrders);
    }
    
    if (timeFilter) {
        timeFilter.addEventListener('change', filterOrders);
    }
    
    trackButtons.forEach(button => {
        if (button.textContent.includes('Track')) {
            button.addEventListener('click', function() {
                const orderId = this.closest('.order-item').querySelector('.order-id').textContent;
                showNotification(`Tracking ${orderId}...`, 'info');
                // In real app, this would open tracking modal or redirect to tracking page
                console.log('Track order:', orderId);
            });
        }
    });
    
    viewButtons.forEach(button => {
        if (button.textContent.includes('View')) {
            button.addEventListener('click', function() {
                const orderId = this.closest('.order-item').querySelector('.order-id').textContent;
                showNotification(`Loading details for ${orderId}...`, 'info');
                // In real app, this would open order details modal
                console.log('View order details:', orderId);
            });
        }
    });
}

function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const orderId = item.querySelector('.order-id').textContent.toLowerCase();
        const productNames = Array.from(item.querySelectorAll('.product-details h4')).map(h4 => h4.textContent.toLowerCase());
        
        const matchesSearch = orderId.includes(searchTerm) || productNames.some(name => name.includes(searchTerm));
        
        item.style.display = matchesSearch ? 'block' : 'none';
    });
    
    if (!Array.from(orderItems).some(item => item.style.display === 'block')) {
        showNoOrdersMessage();
    } else {
        hideNoOrdersMessage();
    }
}

function filterOrders() {
    const statusFilter = document.getElementById('orderFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const status = item.querySelector('.order-status').textContent.toLowerCase();
        const orderDate = item.querySelector('.order-date').textContent;
        const orderYear = orderDate.includes('2024') ? '2024' : 
                           orderDate.includes('2023') ? '2023' : 
                           orderDate.includes('2022') ? '2022' : 'all';
        
        let showItem = true;
        
        // Filter by status
        if (statusFilter !== 'all') {
            const statusMatches = (statusFilter === 'delivered' && status === 'delivered') ||
                                (statusFilter === 'processing' && status === 'processing') ||
                                (statusFilter === 'shipped' && status === 'shipped') ||
                                (statusFilter === 'cancelled' && status === 'cancelled') ||
                                (statusFilter === 'pending' && status === 'pending');
            showItem = statusMatches;
        }
        
        // Filter by time
        if (timeFilter !== 'all') {
            showItem = showItem && orderYear === timeFilter;
        }
        
        item.style.display = showItem ? 'block' : 'none';
    });
    
    // Show no orders message if all filtered out
    if (!Array.from(orderItems).some(item => item.style.display === 'block')) {
        showNoOrdersMessage();
    } else {
        hideNoOrdersMessage();
    }
}

function viewOrderDetails(orderId) {
    showNotification(`Opening details for order ${orderId}...`, 'info');
    // In real app, this would open modal with order details
    console.log('View order details:', orderId);
}

function reorderItems(orderId) {
    if (confirm(`Reorder all items from order ${orderId}?`)) {
        showNotification('Items added to cart!', 'success');
        // In real app, this would add items to shopping cart
        console.log('Reorder items:', orderId);
    }
}

function downloadInvoice(orderId) {
    showNotification(`Downloading invoice for order ${orderId}...`, 'info');
    // In real app, this would generate and download PDF invoice
    console.log('Download invoice:', orderId);
}

function trackOrder(orderId) {
    showNotification(`Tracking order ${orderId}...`, 'info');
    // In real app, this would open tracking page or modal
    console.log('Track order:', orderId);
}

function cancelOrder(orderId) {
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
        showNotification(`Order ${orderId} cancelled`, 'error');
        // In real app, this would send cancellation request to server
        console.log('Cancel order:', orderId);
    }
}

function confirmDelivery(orderId) {
    showNotification(`Delivery confirmed for order ${orderId}`, 'success');
    // In real app, this would update order status
    console.log('Confirm delivery:', orderId);
}

function showNoOrdersMessage() {
    const noOrdersMsg = document.getElementById('noOrdersMessage');
    const orderList = document.getElementById('orderList');
    
    if (noOrdersMsg && orderList) {
        noOrdersMsg.style.display = 'block';
        orderList.style.display = 'none';
    }
}

function hideNoOrdersMessage() {
    const noOrdersMsg = document.getElementById('noOrdersMessage');
    const orderList = document.getElementById('orderList');
    
    if (noOrdersMsg && orderList) {
        noOrdersMsg.style.display = 'none';
        orderList.style.display = 'block';
    }
}

function updateWishlistCount() {
    const wishlistItems = document.querySelectorAll('.wishlist-item');
    const countElement = document.querySelector('.wishlist-summary p');
    if (countElement) {
        const count = wishlistItems.length;
        countElement.innerHTML = `<strong>${count}</strong> items in wishlist`;
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.profile-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `profile-notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize first tab
tabs(0);