// لوحة تحكم الجلسات
class SessionDashboard {
    constructor() {
        this.sessionManager = window.sessionManager;
        this.authSystem = window.authSystem;
        this.init();
    }

    init() {
        this.setupSessionDashboard();
        this.loadSessionData();
        this.setupRealTimeUpdates();
    }

    // إعداد لوحة تحكم الجلسات
    setupSessionDashboard() {
        // إضافة تبويب الجلسات للملف الشخصي
        this.addSessionTab();
        
        // إنشاء محتوى تبويب الجلسات
        this.createSessionTabContent();
    }

    // إضافة تبويب الجلسات
    addSessionTab() {
        const nav = document.querySelector('.leftbox nav');
        if (!nav) return;

        // التحقق من وجود تبويب الجلسات مسبقاً
        if (nav.querySelector('.session-tab')) return;

        const sessionTab = document.createElement('a');
        sessionTab.className = 'tab session-tab';
        sessionTab.onclick = () => this.showSessionTab();
        sessionTab.innerHTML = '<i class="fas fa-clock"></i>';

        // إضافة التبويب قبل تبويب الإعدادات
        const settingsTab = nav.querySelector('a[onclick*="settings"]');
        if (settingsTab) {
            nav.insertBefore(sessionTab, settingsTab);
        } else {
            nav.appendChild(sessionTab);
        }
    }

    // إنشاء محتوى تبويب الجلسات
    createSessionTabContent() {
        const rightbox = document.querySelector('.rightbox');
        if (!rightbox) return;

        // التحقق من وجود المحتوى مسبقاً
        if (rightbox.querySelector('.session-dashboard')) return;

        const sessionContent = document.createElement('div');
        sessionContent.className = 'session-dashboard tabShow';
        sessionContent.style.display = 'none';

        sessionContent.innerHTML = `
            <h1>إدارة الجلسات</h1>
            
            <!-- إحصائيات الجلسة الحالية -->
            <div class="current-session-stats">
                <h2>الجلسة الحالية</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-info">
                            <span class="stat-value" id="sessionDuration">--</span>
                            <span class="stat-label">مدة الجلسة</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-mouse-pointer"></i>
                        <div class="stat-info">
                            <span class="stat-value" id="totalActivities">--</span>
                            <span class="stat-label">الأنشطة</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-file-alt"></i>
                        <div class="stat-info">
                            <span class="stat-value" id="pagesVisited">--</span>
                            <span class="stat-label">الصفحات</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-shopping-cart"></i>
                        <div class="stat-info">
                            <span class="stat-value" id="cartItems">--</span>
                            <span class="stat-label">عناصر السلة</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الجلسات النشطة -->
            <div class="active-sessions">
                <h2>الجلسات النشطة</h2>
                <div class="sessions-list" id="activeSessionsList">
                    <div class="loading">جاري تحميل الجلسات...</div>
                </div>
            </div>

            <!-- سجل الجلسات -->
            <div class="session-history">
                <h2>سجل الجلسات</h2>
                <div class="history-controls">
                    <select id="historyFilter">
                        <option value="all">كل الجلسات</option>
                        <option value="today">اليوم</option>
                        <option value="week">هذا الأسبوع</option>
                        <option value="month">هذا الشهر</option>
                    </select>
                    <button onclick="sessionDashboard.exportSessionData()" class="btn-small">
                        <i class="fas fa-download"></i> تصدير البيانات
                    </button>
                </div>
                <div class="history-list" id="sessionHistoryList">
                    <div class="loading">جاري تحميل السجل...</div>
                </div>
            </div>

            <!-- إعدادات الجلسة -->
            <div class="session-settings">
                <h2>إعدادات الجلسة</h2>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="autoLogout" checked>
                            <span class="checkmark"></span>
                            تسجيل الخروج التلقائي بعد 30 دقيقة
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="trackActivity" checked>
                            <span class="checkmark"></span>
                            تتبع النشاط
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="showNotifications" checked>
                            <span class="checkmark"></span>
                            إشعارات الجلسة
                        </label>
                    </div>
                </div>
                <div class="session-actions">
                    <button onclick="sessionDashboard.endCurrentSession()" class="btn-danger">
                        <i class="fas fa-sign-out-alt"></i> إنهاء الجلسة الحالية
                    </button>
                    <button onclick="sessionDashboard.endAllSessions()" class="btn-warning">
                        <i class="fas fa-power-off"></i> إنهاء جميع الجلسات
                    </button>
                </div>
            </div>
        `;

        rightbox.appendChild(sessionContent);
    }

    // عرض تبويب الجلسات
    showSessionTab() {
        // إخفاء جميع التبويبات
        document.querySelectorAll('.tabShow').forEach(tab => {
            tab.style.display = 'none';
        });

        // إزالة الكلاس النشط من جميع التبويبات
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // عرض تبويب الجلسات
        const sessionTab = document.querySelector('.session-dashboard');
        const sessionTabBtn = document.querySelector('.session-tab');
        
        if (sessionTab) {
            sessionTab.style.display = 'block';
        }
        
        if (sessionTabBtn) {
            sessionTabBtn.classList.add('active');
        }

        // تحميل البيانات
        this.loadSessionData();
    }

    // تحميل بيانات الجلسات
    loadSessionData() {
        this.updateCurrentSessionStats();
        this.loadActiveSessions();
        this.loadSessionHistory();
        this.loadSessionSettings();
    }

    // تحديث إحصائيات الجلسة الحالية
    updateCurrentSessionStats() {
        const stats = this.sessionManager.getCurrentSessionStats();
        if (!stats) return;

        // تحديث مدة الجلسة
        const durationEl = document.getElementById('sessionDuration');
        if (durationEl) {
            durationEl.textContent = this.formatDuration(stats.duration);
        }

        // تحديث عدد الأنشطة
        const activitiesEl = document.getElementById('totalActivities');
        if (activitiesEl) {
            activitiesEl.textContent = stats.activities;
        }

        // تحديث عدد الصفحات
        const pagesEl = document.getElementById('pagesVisited');
        if (pagesEl) {
            pagesEl.textContent = stats.pagesVisited;
        }

        // تحديث عناصر السلة
        const cartEl = document.getElementById('cartItems');
        if (cartEl) {
            cartEl.textContent = stats.cartItems;
        }

        // تحديث كل ثانية
        setTimeout(() => this.updateCurrentSessionStats(), 1000);
    }

    // تحميل الجلسات النشطة
    loadActiveSessions() {
        const activeSessions = this.sessionManager.getActiveSessions();
        const listEl = document.getElementById('activeSessionsList');
        
        if (!listEl) return;

        if (activeSessions.length === 0) {
            listEl.innerHTML = '<p class="no-data">لا توجد جلسات نشطة أخرى</p>';
            return;
        }

        listEl.innerHTML = activeSessions.map(session => `
            <div class="session-item ${session.id === this.sessionManager.currentSession?.id ? 'current' : ''}">
                <div class="session-info">
                    <h4>${session.userName}</h4>
                    <p>الجهاز: ${session.deviceInfo.platform}</p>
                    <p>بدأت: ${new Date(session.startTime).toLocaleString('ar')}</p>
                    <p>المدة: ${this.formatDuration(this.sessionManager.calculateSessionDuration(session))}</p>
                </div>
                <div class="session-actions">
                    ${session.id !== this.sessionManager.currentSession?.id ? 
                        `<button onclick="sessionDashboard.endSession('${session.id}')" class="btn-small btn-danger">
                            <i class="fas fa-times"></i> إنهاء
                        </button>` : 
                        '<span class="current-badge">جلسة حالية</span>'
                    }
                </div>
            </div>
        `).join('');
    }

    // تحميل سجل الجلسات
    loadSessionHistory() {
        const userId = this.authSystem.currentUser?.id;
        if (!userId) return;

        const userSessions = this.sessionManager.getUserSessions(userId);
        const listEl = document.getElementById('sessionHistoryList');
        
        if (!listEl) return;

        const filter = document.getElementById('historyFilter')?.value || 'all';
        const filteredSessions = this.filterSessions(userSessions, filter);

        if (filteredSessions.length === 0) {
            listEl.innerHTML = '<p class="no-data">لا توجد جلسات في هذه الفترة</p>';
            return;
        }

        listEl.innerHTML = filteredSessions.slice(0, 10).map(session => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${new Date(session.startTime).toLocaleDateString('ar')}</h4>
                    <p>المدة: ${this.formatDuration(session.duration || 0)}</p>
                    <p>الجهاز: ${session.deviceInfo.platform}</p>
                    <p>الأنشطة: ${session.activities?.length || 0}</p>
                </div>
                <div class="history-status">
                    <span class="status-badge ${session.isActive ? 'active' : 'ended'}">
                        ${session.isActive ? 'نشطة' : 'منتهية'}
                    </span>
                    <button onclick="sessionDashboard.viewSessionDetails('${session.id}')" class="btn-small">
                        <i class="fas fa-eye"></i> تفاصيل
                    </button>
                </div>
            </div>
        `).join('');
    }

    // فلترة الجلسات
    filterSessions(sessions, filter) {
        const now = new Date();
        
        return sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            
            switch (filter) {
                case 'today':
                    return sessionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return sessionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return sessionDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    // تحميل إعدادات الجلسة
    loadSessionSettings() {
        const settings = JSON.parse(localStorage.getItem('sessionSettings') || '{}');
        
        // تحميل الإعدادات المحفوظة
        const autoLogout = document.getElementById('autoLogout');
        const trackActivity = document.getElementById('trackActivity');
        const showNotifications = document.getElementById('showNotifications');
        
        if (autoLogout) autoLogout.checked = settings.autoLogout !== false;
        if (trackActivity) trackActivity.checked = settings.trackActivity !== false;
        if (showNotifications) showNotifications.checked = settings.showNotifications !== false;

        // إضافة مستمعي الأحداث
        [autoLogout, trackActivity, showNotifications].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => this.saveSessionSettings());
            }
        });
    }

    // حفظ إعدادات الجلسة
    saveSessionSettings() {
        const settings = {
            autoLogout: document.getElementById('autoLogout')?.checked || false,
            trackActivity: document.getElementById('trackActivity')?.checked || false,
            showNotifications: document.getElementById('showNotifications')?.checked || false
        };
        
        localStorage.setItem('sessionSettings', JSON.stringify(settings));
    }

    // إنهاء جلسة محددة
    endSession(sessionId) {
        if (confirm('هل أنت متأكد من إنهاء هذه الجلسة؟')) {
            const success = this.sessionManager.endSession(sessionId);
            if (success) {
                this.showNotification('تم إنهاء الجلسة بنجاح', 'success');
                this.loadActiveSessions();
                this.loadSessionHistory();
            } else {
                this.showNotification('فشل في إنهاء الجلسة', 'error');
            }
        }
    }

    // إنهاء الجلسة الحالية
    endCurrentSession() {
        if (confirm('هل أنت متأكد من إنهاء الجلسة الحالية؟ سيتم تسجيل خروجك.')) {
            this.authSystem.logout();
            window.location.href = 'index.html';
        }
    }

    // إنهاء جميع الجلسات
    endAllSessions() {
        if (confirm('هل أنت متأكد من إنهاء جميع الجلسات؟ سيتم تسجيل خروجك من جميع الأجهزة.')) {
            const activeSessions = this.sessionManager.getActiveSessions();
            let successCount = 0;
            
            activeSessions.forEach(session => {
                if (this.sessionManager.endSession(session.id)) {
                    successCount++;
                }
            });
            
            this.showNotification(`تم إنهاء ${successCount} جلسة بنجاح`, 'success');
            
            // تسجيل الخروج من الجلسة الحالية
            setTimeout(() => {
                this.authSystem.logout();
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // عرض تفاصيل الجلسة
    viewSessionDetails(sessionId) {
        const sessionData = this.sessionManager.exportSessionData(sessionId);
        if (!sessionData) return;

        // إنشاء نافذة منبثقة للتفاصيل
        const modal = document.createElement('div');
        modal.className = 'session-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل الجلسة</h3>
                    <button onclick="this.closest('.session-modal').remove()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4>معلومات الجلسة</h4>
                        <p><strong>المعرف:</strong> ${sessionData.sessionInfo.id}</p>
                        <p><strong>بدأت:</strong> ${new Date(sessionData.sessionInfo.startTime).toLocaleString('ar')}</p>
                        <p><strong>انتهت:</strong> ${sessionData.sessionInfo.endTime ? new Date(sessionData.sessionInfo.endTime).toLocaleString('ar') : 'لا تزال نشطة'}</p>
                        <p><strong>المدة:</strong> ${this.formatDuration(sessionData.sessionInfo.duration)}</p>
                        <p><strong>الجهاز:</strong> ${sessionData.sessionInfo.deviceInfo.platform}</p>
                    </div>
                    <div class="detail-section">
                        <h4>الإحصائيات</h4>
                        <p><strong>إجمالي الأنشطة:</strong> ${sessionData.statistics.totalActivities}</p>
                        <p><strong>الصفحات المزارة:</strong> ${sessionData.statistics.uniquePages}</p>
                        <p><strong>عناصر السلة:</strong> ${sessionData.statistics.cartItems}</p>
                        <p><strong>عناصر الرغبات:</strong> ${sessionData.statistics.wishlistItems}</p>
                    </div>
                    <div class="detail-section">
                        <h4>آخر الأنشطة</h4>
                        <div class="activities-list">
                            ${sessionData.activities.slice(-5).map(activity => `
                                <div class="activity-item">
                                    <span class="activity-type">${activity.type}</span>
                                    <span class="activity-time">${new Date(activity.timestamp).toLocaleTimeString('ar')}</span>
                                    <span class="activity-page">${activity.page}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // تصدير بيانات الجلسة
    exportSessionData() {
        const userId = this.authSystem.currentUser?.id;
        if (!userId) return;

        const userSessions = this.sessionManager.getUserSessions(userId);
        const exportData = {
            userId: userId,
            userName: this.authSystem.currentUser.name,
            exportDate: new Date().toISOString(),
            sessions: userSessions.map(session => this.sessionManager.exportSessionData(session.id))
        };

        // تحويل البيانات إلى JSON وتحميلها
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `session_data_${userId}_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('تم تصدير بيانات الجلسة بنجاح', 'success');
    }

    // إعداد التحديثات الفورية
    setupRealTimeUpdates() {
        // تحديث كل 30 ثانية
        setInterval(() => {
            if (document.querySelector('.session-dashboard').style.display !== 'none') {
                this.loadActiveSessions();
            }
        }, 30000);
    }

    // تنسيق المدة
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '--';
        
        if (seconds < 60) return `${Math.floor(seconds)}ث`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}د`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}س ${Math.floor((seconds % 3600) / 60)}د`;
        return `${Math.floor(seconds / 86400)}ي ${Math.floor((seconds % 86400) / 3600)}س`;
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `session-notification ${type}`;
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
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// إنشاء لوحة تحكم الجلسات
const sessionDashboard = new SessionDashboard();

// إضافة CSS للوحة التحكم
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .session-dashboard {
        padding: 20px;
        direction: rtl;
    }
    
    .session-dashboard h1 {
        color: #333;
        margin-bottom: 30px;
        text-align: right;
    }
    
    .session-dashboard h2 {
        color: #555;
        margin: 30px 0 15px 0;
        text-align: right;
        border-bottom: 2px solid #40aa54;
        padding-bottom: 5px;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .stat-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 15px;
        border-right: 4px solid #40aa54;
    }
    
    .stat-card i {
        font-size: 24px;
        color: #40aa54;
    }
    
    .stat-info {
        display: flex;
        flex-direction: column;
    }
    
    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
    }
    
    .stat-label {
        font-size: 14px;
        color: #666;
    }
    
    .session-item, .history-item {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .session-item.current {
        border-color: #40aa54;
        background: #f0f8f0;
    }
    
    .session-info h4, .history-info h4 {
        margin: 0 0 5px 0;
        color: #333;
    }
    
    .session-info p, .history-info p {
        margin: 2px 0;
        font-size: 12px;
        color: #666;
    }
    
    .current-badge {
        background: #40aa54;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .status-badge.active {
        background: #40aa54;
        color: white;
    }
    
    .status-badge.ended {
        background: #ccc;
        color: #666;
    }
    
    .history-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .settings-grid {
        display: grid;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .setting-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    .setting-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right: 10px;
    }
    
    .setting-label input[type="checkbox"] {
        margin-left: 10px;
    }
    
    .session-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .btn-small {
        padding: 6px 12px;
        font-size: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s;
    }
    
    .btn-danger {
        background: #ff6c57;
        color: white;
    }
    
    .btn-danger:hover {
        background: #ff5744;
    }
    
    .btn-warning {
        background: #ff9800;
        color: white;
    }
    
    .btn-warning:hover {
        background: #f57c00;
    }
    
    .session-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #333;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .detail-section {
        margin-bottom: 20px;
    }
    
    .detail-section h4 {
        color: #555;
        margin-bottom: 10px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 5px;
    }
    
    .detail-section p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .activities-list {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .activity-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 12px;
    }
    
    .activity-type {
        font-weight: bold;
        color: #40aa54;
    }
    
    .no-data, .loading {
        text-align: center;
        color: #666;
        padding: 20px;
        font-style: italic;
    }
    
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
`;
document.head.appendChild(dashboardStyles);
