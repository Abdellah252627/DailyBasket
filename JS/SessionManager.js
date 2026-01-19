// نظام إدارة الجلسات المتقدم
class SessionManager {
    constructor() {
        this.sessions = this.loadSessions();
        this.currentUser = this.getCurrentUser();
        this.currentSession = this.getCurrentSession();
        this.security = window.securitySystem || new SecuritySystem();
        this.init();
    }

    init() {
        this.setupSessionMonitoring();
        this.setupActivityTracking();
        this.setupSessionTimeout();
        this.cleanupExpiredSessions();
        this.validateCurrentSession();
    }

    // تحميل جميع الجلسات
    loadSessions() {
        const stored = localStorage.getItem('userSessions');
        return stored ? JSON.parse(stored) : {};
    }

    // حفظ جميع الجلسات
    saveSessions() {
        localStorage.setItem('userSessions', JSON.stringify(this.sessions));
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    // الحصول على الجلسة الحالية
    getCurrentSession() {
        const sessionId = localStorage.getItem('currentSessionId');
        if (!sessionId) return null;

        const session = this.sessions[sessionId];
        if (!session) {
            localStorage.removeItem('currentSessionId');
            return null;
        }

        return session;
    }

    // إنشاء جلسة جديدة
    createSession(user) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            startTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            isActive: true,
            activities: [],
            cartItems: user.cart?.length || 0,
            wishlistItems: user.wishlist?.length || 0,
            loginMethod: 'standard',
            deviceInfo: this.getDeviceInfo(),
            location: this.getLocationInfo(),
            securityLevel: 'standard'
        };

        // حفظ الجلسة
        this.sessions[sessionId] = session;
        this.saveSessions();

        // تعيين الجلسة الحالية
        localStorage.setItem('currentSessionId', sessionId);

        // تسجيل حدث الجلسة
        this.logSessionEvent('SESSION_CREATED', sessionId, {
            userId: user.id,
            email: user.email,
            device: session.deviceInfo
        });

        return session;
    }

    // إنشاء معرف جلسة فريد
    generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const timestamp = Date.now().toString(36);
        const random = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        return `sess_${timestamp}_${random}`;
    }

    // تحديث نشاط الجلسة
    updateSessionActivity(activity) {
        if (!this.currentSession) return;

        const session = this.sessions[this.currentSession.id];
        if (!session) return;

        // تحديث آخر نشاط
        session.lastActivity = new Date().toISOString();
        session.isActive = true;

        // إضافة النشاط للسجل
        session.activities.push({
            timestamp: new Date().toISOString(),
            type: activity.type,
            details: activity.details,
            page: window.location.pathname,
            duration: activity.duration || 0
        });

        // الحفاظ على آخر 50 نشاط فقط
        if (session.activities.length > 50) {
            session.activities = session.activities.slice(-50);
        }

        // تحديث الإحصائيات
        if (activity.type === 'CART_UPDATE') {
            session.cartItems = activity.details.cartCount;
        } else if (activity.type === 'WISHLIST_UPDATE') {
            session.wishlistItems = activity.details.wishlistCount;
        }

        this.saveSessions();
        this.updateCurrentSession(session);
    }

    // تتبع نشاط المستخدم
    trackUserActivity(type, details = {}) {
        if (!this.currentUser) return;

        const activity = {
            type: type,
            details: details,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            sessionId: this.currentSession?.id
        };

        // تحديث الجلسة
        this.updateSessionActivity(activity);

        // تسجيل النشاط العام
        this.logUserActivity(activity);
    }

    // تسجيل نشاط المستخدم
    logUserActivity(activity) {
        const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        activities.push(activity);

        // الاحتفاظ بآخر 200 نشاط
        if (activities.length > 200) {
            activities.shift();
        }

        localStorage.setItem('userActivities', JSON.stringify(activities));
    }

    // تسجيل أحداث الجلسة
    logSessionEvent(eventType, sessionId, details = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            type: eventType,
            sessionId: sessionId,
            details: details,
            userId: this.currentUser?.id
        };

        const sessionEvents = JSON.parse(localStorage.getItem('sessionEvents') || '[]');
        sessionEvents.push(event);

        // الاحتفاظ بآخر 100 حدث
        if (sessionEvents.length > 100) {
            sessionEvents.shift();
        }

        localStorage.setItem('sessionEvents', JSON.stringify(sessionEvents));
    }

    // إنهاء الجلسة
    endSession(sessionId = null) {
        const targetSessionId = sessionId || this.currentSession?.id;
        if (!targetSessionId) return false;

        const session = this.sessions[targetSessionId];
        if (!session) return false;

        // تحديث بيانات الجلسة
        session.endTime = new Date().toISOString();
        session.isActive = false;
        session.duration = this.calculateSessionDuration(session);

        // تسجيل حدث انتهاء الجلسة
        this.logSessionEvent('SESSION_ENDED', targetSessionId, {
            duration: session.duration,
            activitiesCount: session.activities.length,
            cartItems: session.cartItems,
            wishlistItems: session.wishlistItems
        });

        // حفظ التغييرات
        this.saveSessions();

        // إذا كانت الجلسة الحالية
        if (this.currentSession?.id === targetSessionId) {
            localStorage.removeItem('currentSessionId');
            this.currentSession = null;
        }

        return true;
    }

    // حساب مدة الجلسة
    calculateSessionDuration(session) {
        const start = new Date(session.startTime);
        const end = session.endTime ? new Date(session.endTime) : new Date();
        return Math.floor((end - start) / 1000); // بالثواني
    }

    // الحصول على جميع جلسات المستخدم
    getUserSessions(userId) {
        return Object.values(this.sessions).filter(session => session.userId === userId);
    }

    // الحصول على الجلسات النشطة
    getActiveSessions() {
        return Object.values(this.sessions).filter(session => session.isActive);
    }

    // الحصول على إحصائيات الجلسة الحالية
    getCurrentSessionStats() {
        if (!this.currentSession) return null;

        const session = this.sessions[this.currentSession.id];
        if (!session) return null;

        return {
            sessionId: session.id,
            startTime: session.startTime,
            duration: this.calculateSessionDuration(session),
            activities: session.activities.length,
            pagesVisited: this.getUniquePages(session.activities),
            cartItems: session.cartItems,
            wishlistItems: session.wishlistItems,
            deviceInfo: session.deviceInfo,
            lastActivity: session.lastActivity
        };
    }

    // الحصول على عدد الصفحات الفريدة
    getUniquePages(activities) {
        const pages = new Set();
        activities.forEach(activity => {
            if (activity.page) pages.add(activity.page);
        });
        return pages.size;
    }

    // إعداد مراقبة الجلسة
    setupSessionMonitoring() {
        // مراقبة تغييرات الصفحة
        let lastPage = window.location.pathname;
        
        const checkPageChange = () => {
            const currentPage = window.location.pathname;
            if (currentPage !== lastPage) {
                this.trackUserActivity('PAGE_NAVIGATION', {
                    from: lastPage,
                    to: currentPage,
                    timestamp: new Date().toISOString()
                });
                lastPage = currentPage;
            }
        };

        // فحص كل ثانية
        setInterval(checkPageChange, 1000);

        // مراقبة إغلاق النافذة
        window.addEventListener('beforeunload', () => {
            this.trackUserActivity('SESSION_SUSPEND', {
                page: window.location.pathname,
                reason: 'page_unload'
            });
        });

        // مراقبة التركيز/التركيز خارج النافذة
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackUserActivity('SESSION_BLUR', {
                    page: window.location.pathname
                });
            } else {
                this.trackUserActivity('SESSION_FOCUS', {
                    page: window.location.pathname
                });
            }
        });
    }

    // إعداد تتبع النشاط
    setupActivityTracking() {
        // تتبع النقرات
        document.addEventListener('click', (e) => {
            const target = e.target;
            const activity = {
                element: target.tagName,
                className: target.className,
                id: target.id,
                text: target.textContent?.substring(0, 50)
            };

            this.trackUserActivity('USER_CLICK', activity);
        });

        // تتبع التمرير
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackUserActivity('USER_SCROLL', {
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                    pageHeight: document.body.scrollHeight
                });
            }, 1000);
        });

        // تتبع إدخال النماذج
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.trackUserActivity('FORM_INPUT', {
                    inputType: e.target.type,
                    inputName: e.target.name,
                    inputId: e.target.id
                });
            }
        });
    }

    // إعداد مهلة الجلسة
    setupSessionTimeout() {
        const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة
        const WARNING_TIMEOUT = 25 * 60 * 1000; // 25 دقيقة
        
        let warningShown = false;
        let lastActivity = Date.now();

        const resetTimer = () => {
            lastActivity = Date.now();
            warningShown = false;
        };

        const checkInactivity = () => {
            const now = Date.now();
            const inactiveTime = now - lastActivity;

            if (inactiveTime >= INACTIVE_TIMEOUT) {
                // إنهاء الجلسة
                this.endSession();
                this.showSessionTimeoutMessage();
                window.location.href = 'Login And Registration HTML.html';
            } else if (inactiveTime >= WARNING_TIMEOUT && !warningShown) {
                // عرض تحذير
                this.showInactivityWarning();
                warningShown = true;
            }
        };

        // تحديث المؤقت عند أي نشاط
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        // فحص كل دقيقة
        setInterval(checkInactivity, 60000);
    }

    // عرض رسالة انتهاء الجلسة
    showSessionTimeoutMessage() {
        this.security.showSecurityAlert('انتهت جلسة بسبب عدم النشاط. يرجى تسجيل الدخول مرة أخرى.');
    }

    // عرض تحذير عدم النشاط
    showInactivityWarning() {
        const warning = document.createElement('div');
        warning.className = 'session-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h4>⚠️ تحذير عدم النشاط</h4>
                <p>ستنتهي جلستك خلال 5 دقائق بسبب عدم النشاط.</p>
                <button onclick="this.closest('.session-warning').remove(); sessionManager.resetActivityTimer();">
                    إبقاء الجلسة نشطة
                </button>
            </div>
        `;
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(warning);

        // إزالة التحذير تلقائياً بعد 4 دقائق
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 240000);
    }

    // إعادة تعيين مؤشر النشاط
    resetActivityTimer() {
        this.trackUserActivity('SESSION_EXTENDED', {
            reason: 'user_interaction',
            page: window.location.pathname
        });
    }

    // تنظيف الجلسات المنتهية صلاحيتها
    cleanupExpiredSessions() {
        const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 أيام
        const now = Date.now();

        Object.keys(this.sessions).forEach(sessionId => {
            const session = this.sessions[sessionId];
            const sessionAge = now - new Date(session.startTime).getTime();

            if (sessionAge > SESSION_EXPIRY && !session.isActive) {
                delete this.sessions[sessionId];
                this.logSessionEvent('SESSION_EXPIRED', sessionId, {
                    age: sessionAge,
                    reason: 'expiry'
                });
            }
        });

        this.saveSessions();
    }

    // التحقق من صحة الجلسة الحالية
    validateCurrentSession() {
        if (!this.currentSession) return;

        const session = this.sessions[this.currentSession.id];
        if (!session || !session.isActive) {
            // الجلسة غير صالحة
            localStorage.removeItem('currentSessionId');
            this.currentSession = null;
            
            // توجيه لتسجيل الدخول
            if (window.location.pathname !== '/Login And Registration HTML.html') {
                this.security.showSecurityAlert('جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.');
                setTimeout(() => {
                    window.location.href = 'Login And Registration HTML.html';
                }, 2000);
            }
        }
    }

    // تحديث الجلسة الحالية
    updateCurrentSession(session) {
        this.currentSession = session;
        localStorage.setItem('currentSessionId', session.id);
    }

    // الحصول على معلومات الجهاز
    getDeviceInfo() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };
    }

    // الحصول على معلومات الموقع (محاكاة)
    getLocationInfo() {
        // في تطبيق حقيقي، سيتم استخدام Geolocation API
        return {
            country: 'Unknown',
            city: 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // الحصول على IP العميل (محاكاة)
    getClientIP() {
        // في تطبيق حقيقي، سيتم الحصول على IP من الخادم
        return 'client-ip-simulated';
    }

    // الحصول على إحصائيات جميع الجلسات
    getAllSessionsStats() {
        const allSessions = Object.values(this.sessions);
        const activeSessions = allSessions.filter(s => s.isActive);
        const userSessions = this.getUserSessions(this.currentUser?.id);

        return {
            totalSessions: allSessions.length,
            activeSessions: activeSessions.length,
            userSessions: userSessions.length,
            averageSessionDuration: this.calculateAverageDuration(allSessions),
            mostActivePages: this.getMostActivePages(allSessions),
            peakActivityTimes: this.getPeakActivityTimes(allSessions)
        };
    }

    // حساب متوسط مدة الجلسات
    calculateAverageDuration(sessions) {
        const completedSessions = sessions.filter(s => s.endTime);
        if (completedSessions.length === 0) return 0;

        const totalDuration = completedSessions.reduce((sum, session) => {
            return sum + this.calculateSessionDuration(session);
        }, 0);

        return Math.floor(totalDuration / completedSessions.length);
    }

    // الحصول على الصفحات الأكثر نشاطاً
    getMostActivePages(sessions) {
        const pageCounts = {};

        sessions.forEach(session => {
            session.activities.forEach(activity => {
                if (activity.page) {
                    pageCounts[activity.page] = (pageCounts[activity.page] || 0) + 1;
                }
            });
        });

        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    }

    // الحصول على أوقات الذروة
    getPeakActivityTimes(sessions) {
        const hourCounts = {};

        sessions.forEach(session => {
            session.activities.forEach(activity => {
                const hour = new Date(activity.timestamp).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
        });

        return Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    }

    // تصدير بيانات الجلسة
    exportSessionData(sessionId) {
        const session = this.sessions[sessionId];
        if (!session) return null;

        return {
            sessionInfo: {
                id: session.id,
                userId: session.userId,
                startTime: session.startTime,
                endTime: session.endTime,
                duration: this.calculateSessionDuration(session),
                deviceInfo: session.deviceInfo,
                location: session.location
            },
            activities: session.activities,
            statistics: {
                totalActivities: session.activities.length,
                uniquePages: this.getUniquePages(session.activities),
                cartItems: session.cartItems,
                wishlistItems: session.wishlistItems
            }
        };
    }
}

// إنشاء مدير الجلسات
const sessionManager = new SessionManager();

// إضافة CSS للتنبيهات
const sessionStyles = document.createElement('style');
sessionStyles.textContent = `
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
    
    .session-warning {
        font-family: 'Poppins', sans-serif;
        z-index: 10000;
    }
    
    .session-warning h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
    }
    
    .session-warning p {
        margin: 0 0 15px 0;
        font-size: 14px;
    }
    
    .session-warning button {
        background: white;
        color: #ff9800;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
    }
    
    .session-warning button:hover {
        background: #f5f5f5;
    }
`;
document.head.appendChild(sessionStyles);

// تصدير النظام للاستخدام في ملفات أخرى
window.SessionManager = SessionManager;
window.sessionManager = sessionManager;
