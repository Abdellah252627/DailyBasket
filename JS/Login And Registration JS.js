// نظام المصادقة المحسن مع حماية أمنية شاملة وإدارة الجلسات
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.security = window.securitySystem || new SecuritySystem();
        this.sessionManager = window.sessionManager || new SessionManager();
        this.init();
    }

    // تحميل المستخدمين من localStorage
    loadUsers() {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    }

    // حفظ المستخدمين في localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    // حفظ المستخدم الحالي
    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // تسجيل الدخول مع حماية أمنية وإنشاء جلسة
    login(email, password) {
        // تعقيم المدخلات
        const sanitizedEmail = this.security.sanitizeInput(email);

        // التحقق من صحة البريد الإلكتروني
        if (!this.security.validateEmail(sanitizedEmail)) {
            return { success: false, message: 'بريد إلكتروني غير صالح' };
        }

        const user = this.users.find(u => u.email === sanitizedEmail);
        
        if (!user) {
            this.security.logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', { 
                email: sanitizedEmail 
            });
            return { success: false, message: 'المستخدم غير موجود' };
        }

        // التحقق من كلمة المرور
        if (!this.verifyPassword(password, user.password)) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            user.lastLoginAttempt = Date.now();
            this.saveUsers();

            this.security.logSecurityEvent('LOGIN_FAILED_PASSWORD', { 
                userId: user.id, 
                email: sanitizedEmail, 
                attempts: user.loginAttempts 
            });

            return { success: false, message: 'كلمة المرور غير صحيحة' };
        }

        // إعادة تعيين محاولات تسجيل الدخول
        user.loginAttempts = 0;
        user.lastLogin = new Date().toISOString();
        user.lastLoginIP = this.security.getClientIP();
        
        // تحديث إحصائيات المستخدم
        user.statistics = user.statistics || {};
        user.statistics.totalLogins = (user.statistics.totalLogins || 0) + 1;
        user.statistics.lastActivity = new Date().toISOString();
        
        this.saveUsers();

        // حفظ المستخدم الحالي (بدون كلمة المرور)
        const userSession = { ...user };
        delete userSession.password;
        this.saveCurrentUser(userSession);

        // إنشاء جلسة جديدة
        const session = this.sessionManager.createSession(userSession);
        
        // تحديث إحصائيات الجلسات
        user.statistics.totalSessions = (user.statistics.totalSessions || 0) + 1;
        this.saveUsers();

        // تتبع نشاط تسجيل الدخول
        this.sessionManager.trackUserActivity('LOGIN_SUCCESS', {
            loginMethod: 'standard',
            sessionId: session.id,
            deviceInfo: session.deviceInfo
        });

        // تسجيل الحدث الأمني
        this.security.logSecurityEvent('LOGIN_SUCCESS', { 
            userId: user.id, 
            email: sanitizedEmail,
            sessionId: session.id
        });

        return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح', 
            user: userSession,
            session: session
        };
    }

    // تسجيل الخروج مع إنهاء الجلسة
    logout() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // إنهاء الجلسة الحالية
            this.sessionManager.endSession();
            
            // تتبع نشاط تسجيل الخروج
            this.sessionManager.trackUserActivity('LOGOUT', {
                reason: 'user_initiated',
                sessionId: this.sessionManager.currentSession?.id
            });

            // تسجيل الحدث الأمني
            this.security.logSecurityEvent('USER_LOGOUT', { 
                userId: currentUser.id,
                sessionId: this.sessionManager.currentSession?.id
            });
        }
        
        this.saveCurrentUser(null);
        return { success: true, message: 'تم تسجيل الخروج' };
    }

    // التسجيل مع حماية أمنية وإنشاء جلسة
    register(name, email, password, phone = '') {
        // تعقيم المدخلات
        const sanitizedName = this.security.sanitizeInput(name);
        const sanitizedEmail = this.security.sanitizeInput(email);

        // التحقق من صحة البيانات
        if (!this.security.validateEmail(sanitizedEmail)) {
            return { success: false, message: 'بريد إلكتروني غير صالح' };
        }

        if (!this.security.validatePassword(password)) {
            return { success: false, message: this.security.getPasswordErrorMessage(this.security.checkPasswordStrength(password)) };
        }

        // التحقق من وجود المستخدم
        if (this.users.find(u => u.email === sanitizedEmail)) {
            this.security.logSecurityEvent('REGISTRATION_FAILED_USER_EXISTS', { email: sanitizedEmail });
            return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };
        }

        // إنشاء المستخدم الجديد
        const newUser = {
            id: this.generateUserId(),
            name: sanitizedName,
            email: sanitizedEmail,
            password: this.hashPassword(password),
            phone: phone ? this.security.sanitizeInput(phone) : '',
            role: 'customer',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginAttempts: 0,
            isActive: true,
            statistics: {
                totalLogins: 0,
                totalSessions: 0,
                lastActivity: new Date().toISOString()
            },
            preferences: {
                currency: 'USD',
                language: 'en',
                notifications: true
            },
            cart: [],
            wishlist: [],
            orders: []
        };

        // إضافة المستخدم
        this.users.push(newUser);
        this.saveUsers();

        // تسجيل الحدث الأمني
        this.security.logSecurityEvent('USER_REGISTERED', {
            userId: newUser.id,
            email: sanitizedEmail
        });

        return { success: true, message: 'تم التسجيل بنجاح! يرجى تسجيل الدخول' };
    }

    // إنشاء معرف مستخدم فريد
    generateUserId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `user_${timestamp}_${random}`;
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null && this.sessionManager.currentSession !== null;
    }

    // تشفير كلمة المرور
    hashPassword(password) {
        const salt = this.generateSalt();
        const hash = btoa(salt + password + 'dailybasket-salt-2024');
        return salt + ':' + hash;
    }

    // التحقق من كلمة المرور
    verifyPassword(password, hash) {
        if (!hash || !hash.includes(':')) return false;
        
        const [salt, hashedPassword] = hash.split(':');
        const computedHash = btoa(salt + password + 'dailybasket-salt-2024');
        
        return hashedPassword === computedHash;
    }

    // إنشاء salt عشوائي
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // تهيئة النظام
    init() {
        this.updateUI();
        this.setupSessionTracking();
    }

    // إعداد تتبع الجلسات
    setupSessionTracking() {
        // تتبع نشاط المستخدم في الصفحة الحالية
        if (this.isLoggedIn()) {
            // تتبع تحميل الصفحة
            this.sessionManager.trackUserActivity('PAGE_LOAD', {
                page: window.location.pathname,
                loadTime: performance.now(),
                sessionId: this.sessionManager.currentSession?.id
            });
        }
    }

    // تحديث الواجهة بناءً على حالة تسجيل الدخول
    updateUI() {
        const loginLinks = document.querySelectorAll('a[href="Login And Registration HTML.html"]');
        const profileLink = document.querySelector('a[href="Profile HTML.html"]');
        
        if (this.isLoggedIn()) {
            loginLinks.forEach(link => {
                link.textContent = 'Logout';
                link.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                    window.location.reload();
                };
            });
            
            if (profileLink) {
                profileLink.querySelector('span').textContent = '1';
            }

            // إضافة معلومات الجلسة للواجهة
            this.addSessionInfo();
        }
    }

    // إضافة معلومات الجلسة للواجهة
    addSessionInfo() {
        const sessionStats = this.sessionManager.getCurrentSessionStats();
        if (sessionStats) {
            // إضافة وقت الجلسة في شريط التنقل
            const navigation = document.querySelector('.navigation');
            if (navigation && !navigation.querySelector('.session-info')) {
                const sessionInfo = document.createElement('div');
                sessionInfo.className = 'session-info';
                sessionInfo.innerHTML = `
                    <span style="color: #666; font-size: 12px; margin-left: 20px;">
                        🕐 ${this.formatDuration(sessionStats.duration)}
                    </span>
                `;
                navigation.appendChild(sessionInfo);
            }
        }
    }

    // تنسيق المدة
    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}ث`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}د`;
        return `${Math.floor(seconds / 3600)}س ${Math.floor((seconds % 3600) / 60)}د`;
    }
}

// إنشاء نظام المصادقة
const authSystem = new AuthSystem();

// التعامل مع نماذج تسجيل الدخول والتسجيل مع حماية
document.addEventListener('DOMContentLoaded', function() {
    // نموذج تسجيل الدخول
    const loginForm = document.querySelector('#one form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = loginForm.querySelector('input[placeholder="EMAIL"]').value;
            const password = loginForm.querySelector('input[placeholder="PASSWORD"]').value;
            
            // التحقق من صحة النموذج
            if (!securitySystem.validateForm(loginForm)) {
                return;
            }
            
            const result = authSystem.login(email, password);
            
            if (result.success) {
                alert(result.message);
                window.location.href = 'index.html';
            } else {
                alert(result.message);
            }
        });
    }

    // نموذج التسجيل
    const registerForm = document.querySelector('#four form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = registerForm.querySelector('input[placeholder="NAME"]').value;
            const email = registerForm.querySelector('input[placeholder="EMAIL"]').value;
            const password = registerForm.querySelector('input[placeholder="PASSWORD"]').value;
            const phone = registerForm.querySelector('input[placeholder="PHONE NO. (optional)"]').value;
            
            // التحقق من صحة النموذج
            if (!securitySystem.validateForm(registerForm)) {
                return;
            }
            
            const result = authSystem.register(name, email, password, phone);
            
            if (result.success) {
                alert(result.message);
                // التبديل إلى نموذج تسجيل الدخول
                document.getElementById('b2').click();
            } else {
                alert(result.message);
            }
        });
    }

    // زر نسيان كلمة المرور مع حماية
    const forgotPasswordBtn = document.querySelector('#one button a[href="#"]');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
            
            if (email && securitySystem.validateEmail(email)) {
                const sanitizedEmail = securitySystem.sanitizeInput(email);
                
                // تسجيل محاولة استرداد كلمة المرور
                securitySystem.logSecurityEvent('PASSWORD_RESET_REQUESTED', { 
                    email: sanitizedEmail 
                });
                
                alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (محاكاة)');
            } else if (email) {
                alert('بريد إلكتروني غير صالح');
            }
        });
    }
});

// تبديل بين نماذج تسجيل الدخول والتسجيل
var a, b, c, d;
a = document.getElementById("one");
b = document.getElementById("two");
c = document.getElementById("three");
d = document.getElementById("four");
var r = document.getElementById("b1");
var s = document.getElementById("b2");

r.onclick = function () {
    d.classList.add("mover");
    a.classList.add("hide");
    a.classList.remove("show");
    c.classList.add("movel2");
    b.classList.add("hide");
    b.classList.remove("show");
    c.classList.remove("hide");
    c.classList.add("show");
    d.classList.remove("hide");
    d.classList.add("show");
}

s.onclick = function () {
    b.classList.add("mover2");
    c.classList.add("hide");
    c.classList.remove("show");
    a.classList.add("movel");
    d.classList.add("hide");
    d.classList.remove("show");
    b.classList.remove("hide");
    b.classList.add("show");
    a.classList.remove("hide");
    a.classList.add("show");
}