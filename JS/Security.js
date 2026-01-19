// نظام الحماية الأمني الشامل
class SecuritySystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupInputSanitization();
        this.setupXSSProtection();
        this.setupCSRFProtection();
        this.setupInputValidation();
        this.setupRateLimiting();
    }

    // تنظيف وتعقيم المدخلات ضد XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            // إزالة الأحرف الخطرة
            .replace(/[<>]/g, '')
            // تعقيم HTML entities
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            // إزالة JavaScript events
            .replace(/on\w+\s*=/gi, '')
            // إزالة script tags
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // إزالة iframe tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            // إزالة object tags
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            // إزالة embed tags
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            // إزالة style tags مع content
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            // إزالة meta tags
            .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
            // إزالة link tags
            .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
            // تقليم المسافات الزائدة
            .trim();
    }

    // حماية ضد SQL Injection
    sanitizeSQL(input) {
        if (typeof input !== 'string') return input;
        
        return input
            // إزالة أحرف SQL الخطرة
            .replace(/['"\\;]/g, '')
            // إزالة كلمات SQL الرئيسية
            .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND|WHERE|FROM|INTO|TABLE|DATABASE)\b/gi, '')
            // إزالة تعليقات SQL
            .replace(/(--|#|\/\*|\*\/)/g, '')
            // إزالة أوامر متقدمة
            .replace(/\b(GRANT|REVOKE|COMMIT|ROLLBACK|TRUNCATE)\b/gi, '')
            .trim();
    }

    // التحقق من صحة البريد الإلكتروني
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const sanitizedEmail = this.sanitizeInput(email);
        
        return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
    }

    // التحقق من صحة رقم الهاتف
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        const sanitizedPhone = this.sanitizeInput(phone);
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        return phoneRegex.test(sanitizedPhone.replace(/[\s\-\(\)]/g, ''));
    }

    // التحقق من قوة كلمة المرور
    validatePassword(password) {
        if (!password || typeof password !== 'string') return false;
        
        const sanitizedPassword = this.sanitizeInput(password);
        
        const requirements = {
            length: sanitizedPassword.length >= 8,
            uppercase: /[A-Z]/.test(sanitizedPassword),
            lowercase: /[a-z]/.test(sanitizedPassword),
            numbers: /\d/.test(sanitizedPassword),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(sanitizedPassword)
        };
        
        return {
            isValid: Object.values(requirements).every(req => req),
            requirements: requirements,
            score: Object.values(requirements).filter(req => req).length
        };
    }

    // التحقق من صحة الاسم
    validateName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const sanitized = this.sanitizeInput(name);
        const nameRegex = /^[a-zA-Z\s\u0600-\u06FF]{2,50}$/;
        
        return nameRegex.test(sanitized) && sanitized.trim().length >= 2;
    }

    // التحقق من صحة العنوان
    validateAddress(address) {
        if (!address || typeof address !== 'string') return false;
        
        const sanitized = this.sanitizeInput(address);
        
        return sanitized.length >= 10 && sanitized.length <= 200 &&
               !/[<>\"'&]/.test(sanitized);
    }

    // إعداد حماية XSS لجميع المدخلات
    setupXSSProtection() {
        // حماية Content Security Policy
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' https://kit.fontawesome.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https: http:;
            connect-src 'self';
            frame-src 'none';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();
        
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            document.head.appendChild(cspMeta);
        }

        // حماية XSS Detection
        document.addEventListener('DOMContentLoaded', () => {
            this.detectXSSAttempts();
        });
    }

    // كشف محاولات XSS
    detectXSSAttempts() {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ];

        // فحص جميع حقول الإدخال
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                const isXSS = xssPatterns.some(pattern => pattern.test(value));
                
                if (isXSS) {
                    e.target.value = this.sanitizeInput(value);
                    this.showSecurityAlert('تم اكتشاف محاولة XSS! تم تعقيم المدخل.');
                    this.logSecurityEvent('XSS_ATTEMPT', { input: e.target.name, value: value });
                }
            });

            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    const value = e.target.value;
                    const isXSS = xssPatterns.some(pattern => pattern.test(value));
                    
                    if (isXSS) {
                        e.target.value = this.sanitizeInput(value);
                        this.showSecurityAlert('تم اكتشاف محتوى خطير في اللصق! تم التعقيم.');
                        this.logSecurityEvent('XSS_PASTE_ATTEMPT', { input: e.target.name });
                    }
                }, 0);
            });
        });
    }

    // إعداد حماية CSRF
    setupCSRFProtection() {
        // إنشاء CSRF token
        if (!localStorage.getItem('csrfToken')) {
            const token = this.generateCSRFToken();
            localStorage.setItem('csrfToken', token);
        }

        // إضافة token لجميع النماذج
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'csrf_token';
                tokenInput.value = localStorage.getItem('csrfToken');
                form.appendChild(tokenInput);
            });
        });
    }

    // إنشاء CSRF token
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // التحقق من CSRF token
    validateCSRFToken(token) {
        const storedToken = localStorage.getItem('csrfToken');
        return storedToken && token === storedToken;
    }

    // إعداد التحقق من المدخلات
    setupInputValidation() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupRealTimeValidation();
        });
    }

    // التحقق الفوري للمدخلات
    setupRealTimeValidation() {
        // التحقق من البريد الإلكتروني
        const emailInputs = document.querySelectorAll('input[type="email"], input[placeholder*="EMAIL"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value && !this.validateEmail(e.target.value)) {
                    this.showInputError(e.target, 'بريد إلكتروني غير صالح');
                } else {
                    this.clearInputError(e.target);
                }
            });
        });

        // التحقق من كلمة المرور
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value) {
                    const validation = this.validatePassword(e.target.value);
                    if (!validation.isValid) {
                        const message = this.getPasswordErrorMessage(validation.requirements);
                        this.showInputError(e.target, message);
                    } else {
                        this.clearInputError(e.target);
                    }
                }
            });
        });

        // التحقق من رقم الهاتف
        const phoneInputs = document.querySelectorAll('input[type="tel"], input[placeholder*="PHONE"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value && !this.validatePhone(e.target.value)) {
                    this.showInputError(e.target, 'رقم هاتف غير صالح');
                } else {
                    this.clearInputError(e.target);
                }
            });
        });

        // التحقق من الأسماء
        const nameInputs = document.querySelectorAll('input[placeholder*="NAME"], input[id*="name"]');
        nameInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                if (e.target.value && !this.validateName(e.target.value)) {
                    this.showInputError(e.target, 'اسم غير صالح (يجب أن يكون 2-50 حرفاً)');
                } else {
                    this.clearInputError(e.target);
                }
            });
        });
    }

    // رسالة خطأ كلمة المرور
    getPasswordErrorMessage(requirements) {
        const errors = [];
        if (!requirements.length) errors.push('8 أحرف على الأقل');
        if (!requirements.uppercase) errors.push('حرف كبير واحد');
        if (!requirements.lowercase) errors.push('حرف صغير واحد');
        if (!requirements.numbers) errors.push('رقم واحد');
        if (!requirements.special) errors.push('رمز خاص واحد');
        
        return 'كلمة المرور يجب أن تحتوي على: ' + errors.join('، ');
    }

    // عرض خطأ الإدخال
    showInputError(input, message) {
        this.clearInputError(input);
        
        input.style.borderColor = '#ff6c57';
        input.style.backgroundColor = '#fff0ee';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6c57;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }

    // مسح خطأ الإدخال
    clearInputError(input) {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        
        const errorMessage = input.parentNode.querySelector('.input-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // إعداد تقييد معدل الطلبات
    setupRateLimiting() {
        this.rateLimitData = this.loadRateLimitData();
        
        // تقييد محاولات تسجيل الدخول
        this.setupLoginRateLimit();
        
        // تقييد طلبات التسجيل
        this.setupRegistrationRateLimit();
    }

    // تحميل بيانات تقييد المعدل
    loadRateLimitData() {
        const stored = localStorage.getItem('rateLimitData');
        return stored ? JSON.parse(stored) : {};
    }

    // حفظ بيانات تقييد المعدل
    saveRateLimitData() {
        localStorage.setItem('rateLimitData', JSON.stringify(this.rateLimitData));
    }

    // إعداد تقييد تسجيل الدخول
    setupLoginRateLimit() {
        const loginForms = document.querySelectorAll('form');
        loginForms.forEach(form => {
            const submitBtn = form.querySelector('button[type="submit"], .sign_in_btn');
            if (submitBtn) {
                form.addEventListener('submit', (e) => {
                    if (!this.checkLoginRateLimit()) {
                        e.preventDefault();
                        this.showSecurityAlert('محاولات تسجيل دخول كثيرة جداً! يرجى الانتظار 5 دقائق.');
                    }
                });
            }
        });
    }

    // التحقق من معدل تسجيل الدخول
    checkLoginRateLimit() {
        const now = Date.now();
        const windowMs = 5 * 60 * 1000; // 5 دقائق
        const maxAttempts = 5;
        
        if (!this.rateLimitData.loginAttempts) {
            this.rateLimitData.loginAttempts = [];
        }
        
        // تنظيف المحاولات القديمة
        this.rateLimitData.loginAttempts = this.rateLimitData.loginAttempts.filter(
            attempt => now - attempt < windowMs
        );
        
        // التحقق من تجاوز الحد
        if (this.rateLimitData.loginAttempts.length >= maxAttempts) {
            return false;
        }
        
        // إضافة محاولة جديدة
        this.rateLimitData.loginAttempts.push(now);
        this.saveRateLimitData();
        
        return true;
    }

    // إعداد تقييد التسجيل
    setupRegistrationRateLimit() {
        const registerForms = document.querySelectorAll('.sign_up_btn');
        registerForms.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.checkRegistrationRateLimit()) {
                    e.preventDefault();
                    this.showSecurityAlert('محاولات تسجيل كثيرة جداً! يرجى الانتظار 10 دقائق.');
                }
            });
        });
    }

    // التحقق من معدل التسجيل
    checkRegistrationRateLimit() {
        const now = Date.now();
        const windowMs = 10 * 60 * 1000; // 10 دقائق
        const maxAttempts = 3;
        
        if (!this.rateLimitData.registrationAttempts) {
            this.rateLimitData.registrationAttempts = [];
        }
        
        // تنظيف المحاولات القديمة
        this.rateLimitData.registrationAttempts = this.rateLimitData.registrationAttempts.filter(
            attempt => now - attempt < windowMs
        );
        
        // التحقق من تجاوز الحد
        if (this.rateLimitData.registrationAttempts.length >= maxAttempts) {
            return false;
        }
        
        // إضافة محاولة جديدة
        this.rateLimitData.registrationAttempts.push(now);
        this.saveRateLimitData();
        
        return true;
    }

    // عرض تنبيه أمني
    showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6c57;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // تسجيل الأحداث الأمنية
    logSecurityEvent(eventType, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: eventType,
            data: data,
            userAgent: navigator.userAgent,
            ip: this.getClientIP()
        };
        
        // حفظ السجل الأمني
        const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        securityLogs.push(logEntry);
        
        // الاحتفاظ بآخر 100 سجل فقط
        if (securityLogs.length > 100) {
            securityLogs.shift();
        }
        
        localStorage.setItem('securityLogs', JSON.stringify(securityLogs));
        
        console.warn('Security Event:', logEntry);
    }

    // الحصول على IP العميل (محاكاة)
    getClientIP() {
        // في تطبيق حقيقي، سيتم الحصول على IP من الخادم
        return 'client-ip-simulated';
    }

    // إعداد تعقيم المدخلات
    setupInputSanitization() {
        // تعقيم جميع المدخلات عند الإرسال
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    this.sanitizeFormInputs(form);
                });
            });
        });
    }

    // تعقيم مدخلات النموذج
    sanitizeFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type !== 'password' && input.type !== 'file') {
                input.value = this.sanitizeInput(input.value);
            }
        });
    }

    // التحقق من سلامة النموذج
    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            
            // التحقق من الحقول المطلوبة
            if (input.hasAttribute('required') && !value) {
                this.showInputError(input, 'هذا الحقل مطلوب');
                isValid = false;
                return;
            }
            
            // التحقق من نوع الإدخال
            if (value) {
                switch (input.type) {
                    case 'email':
                        if (!this.validateEmail(value)) {
                            this.showInputError(input, 'بريد إلكتروني غير صالح');
                            isValid = false;
                        }
                        break;
                    case 'tel':
                        if (!this.validatePhone(value)) {
                            this.showInputError(input, 'رقم هاتف غير صالح');
                            isValid = false;
                        }
                        break;
                    case 'password':
                        const passwordValidation = this.validatePassword(value);
                        if (!passwordValidation.isValid) {
                            const message = this.getPasswordErrorMessage(passwordValidation.requirements);
                            this.showInputError(input, message);
                            isValid = false;
                        }
                        break;
                }
            }
        });
        
        return isValid;
    }
}

// تهيئة نظام الأمان
const securitySystem = new SecuritySystem();

// إضافة CSS للتنبيهات والأخطاء
const securityStyles = document.createElement('style');
securityStyles.textContent = `
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
    
    .security-alert {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    }
    
    .input-error-message {
        font-family: 'Poppins', sans-serif;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    input.error, textarea.error {
        border-color: #ff6c57 !important;
        background-color: #fff0ee !important;
    }
`;
document.head.appendChild(securityStyles);

// تصدير النظام للاستخدام في ملفات أخرى
window.SecuritySystem = SecuritySystem;
window.securitySystem = securitySystem;
