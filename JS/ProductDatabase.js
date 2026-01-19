// نظام إدارة قاعدة بيانات المنتجات الديناميكية
class ProductDatabase {
    constructor() {
        this.products = this.loadProducts();
        this.categories = this.loadCategories();
        this.init();
    }

    init() {
        this.setupDatabaseManagement();
        this.setupProductCRUD();
        this.setupSearchAndFilter();
        this.initializeDefaultProducts();
    }

    // تحميل المنتجات من localStorage
    loadProducts() {
        const stored = localStorage.getItem('products');
        return stored ? JSON.parse(stored) : [];
    }

    // حفظ المنتجات في localStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
        this.updateProductCount();
    }

    // تحميل الفئات
    loadCategories() {
        const stored = localStorage.getItem('categories');
        return stored ? JSON.parse(stored) : this.getDefaultCategories();
    }

    // حفظ الفئات
    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    // الحصول على الفئات الافتراضية
    getDefaultCategories() {
        return [
            { id: 'fruits', name: 'Fruits & Vegetables', icon: '🍎', description: 'Fresh fruits and vegetables' },
            { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', description: 'Milk, cheese, eggs, and more' },
            { id: 'meat', name: 'Meat & Fish', icon: '🥩', description: 'Fresh meat and seafood' },
            { id: 'bakery', name: 'Bakery', icon: '🍞', description: 'Bread, pastries, and baked goods' },
            { id: 'beverages', name: 'Beverages', icon: '🥤', description: 'Drinks and beverages' },
            { id: 'snacks', name: 'Snacks', icon: '🍿', description: 'Chips, nuts, and snacks' },
            { id: 'beauty', name: 'Beauty & Personal Care', icon: '💄', description: 'Cosmetics and personal care' },
            { id: 'baby', name: 'Baby Care', icon: '👶', description: 'Baby products and essentials' },
            { id: 'medicine', name: 'Medicine & Health', icon: '💊', description: 'Medicines and health products' },
            { id: 'home', name: 'Home & Kitchen', icon: '🏠', description: 'Home and kitchen essentials' },
            { id: 'office', name: 'Office Supplies', icon: '📎', description: 'Office and school supplies' },
            { id: 'gardening', name: 'Gardening', icon: '🌱', description: 'Gardening tools and supplies' }
        ];
    }

    // تهيئة المنتجات الافتراضية
    initializeDefaultProducts() {
        if (this.products.length === 0) {
            this.products = this.getDefaultProducts();
            this.saveProducts();
        }
    }

    // الحصول على المنتجات الافتراضية
    getDefaultProducts() {
        return [
            // Fruits & Vegetables
            {
                id: 'prod_001',
                name: 'Fresh Apples',
                category: 'fruits',
                price: 1.30,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/vUJ2JKU.png',
                description: 'Crispy and sweet fresh apples',
                stock: 100,
                rating: 4.5,
                reviews: 128,
                offer: '10%',
                tags: ['fresh', 'organic', 'fruit'],
                nutritionalInfo: {
                    calories: 52,
                    protein: 0.3,
                    carbs: 14,
                    fat: 0.2
                }
            },
            {
                id: 'prod_002',
                name: 'Fresh Red Chili',
                category: 'fruits',
                price: 1.05,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/rFhSMZN.png',
                description: 'Spicy and fresh red chilies',
                stock: 75,
                rating: 4.2,
                reviews: 89,
                offer: null,
                tags: ['spicy', 'fresh', 'vegetable'],
                nutritionalInfo: {
                    calories: 40,
                    protein: 1.9,
                    carbs: 9,
                    fat: 0.4
                }
            },
            {
                id: 'prod_003',
                name: 'Fresh Onions',
                category: 'fruits',
                price: 0.65,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/sGLggWL.jpg',
                description: 'Fresh and flavorful onions',
                stock: 150,
                rating: 4.3,
                reviews: 156,
                offer: '5%',
                tags: ['fresh', 'vegetable', 'cooking'],
                nutritionalInfo: {
                    calories: 40,
                    protein: 1.1,
                    carbs: 9.3,
                    fat: 0.1
                }
            },
            {
                id: 'prod_004',
                name: 'Fresh Potatoes',
                category: 'fruits',
                price: 0.80,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/WFjH6ui.png',
                description: 'High quality fresh potatoes',
                stock: 200,
                rating: 4.4,
                reviews: 203,
                offer: null,
                tags: ['fresh', 'vegetable', 'staple'],
                nutritionalInfo: {
                    calories: 77,
                    protein: 2,
                    carbs: 17,
                    fat: 0.1
                }
            },
            {
                id: 'prod_005',
                name: 'Fresh Garlic',
                category: 'fruits',
                price: 0.65,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/XVLuy2J.png',
                description: 'Aromatic fresh garlic bulbs',
                stock: 80,
                rating: 4.6,
                reviews: 167,
                offer: '15%',
                tags: ['fresh', 'aromatic', 'vegetable'],
                nutritionalInfo: {
                    calories: 149,
                    protein: 6.4,
                    carbs: 33,
                    fat: 0.5
                }
            },
            {
                id: 'prod_006',
                name: 'Fresh Tomatoes',
                category: 'fruits',
                price: 1.05,
                currency: 'USD',
                unit: '1 KG',
                image: 'https://i.imgur.com/8l5hDhS.png',
                description: 'Ripe and juicy fresh tomatoes',
                stock: 120,
                rating: 4.5,
                reviews: 189,
                offer: null,
                tags: ['fresh', 'juicy', 'vegetable'],
                nutritionalInfo: {
                    calories: 18,
                    protein: 0.9,
                    carbs: 3.9,
                    fat: 0.2
                }
            },

            // Beauty & Personal Care
            {
                id: 'prod_007',
                name: 'Baby Cream',
                category: 'beauty',
                price: 3.50,
                currency: 'USD',
                unit: '100ml',
                image: 'https://i.imgur.com/9QqB6iO.jpg',
                description: 'Gentle baby cream for sensitive skin',
                stock: 50,
                rating: 4.7,
                reviews: 234,
                offer: '20%',
                tags: ['baby', 'gentle', 'moisturizing'],
                nutritionalInfo: null
            },
            {
                id: 'prod_008',
                name: 'Baby Powder',
                category: 'beauty',
                price: 2.50,
                currency: 'USD',
                unit: '200g',
                image: 'https://i.imgur.com/3kP5e9u.jpg',
                description: 'Soft and gentle baby powder',
                stock: 60,
                rating: 4.4,
                reviews: 178,
                offer: null,
                tags: ['baby', 'gentle', 'fresh'],
                nutritionalInfo: null
            },
            {
                id: 'prod_009',
                name: 'Baby Shampoo',
                category: 'beauty',
                price: 4.20,
                currency: 'USD',
                unit: '250ml',
                image: 'https://i.imgur.com/7mN8d2f.jpg',
                description: 'Tear-free baby shampoo',
                stock: 45,
                rating: 4.6,
                reviews: 198,
                offer: '10%',
                tags: ['baby', 'tear-free', 'gentle'],
                nutritionalInfo: null
            },
            {
                id: 'prod_010',
                name: 'Face Cream',
                category: 'beauty',
                price: 6.00,
                currency: 'USD',
                unit: '50ml',
                image: 'https://i.imgur.com/8jK2LmP.jpg',
                description: 'Nourishing face cream for all skin types',
                stock: 35,
                rating: 4.5,
                reviews: 267,
                offer: '25%',
                tags: ['moisturizing', 'nourishing', 'anti-aging'],
                nutritionalInfo: null
            },
            {
                id: 'prod_011',
                name: 'Lip Balm',
                category: 'beauty',
                price: 2.00,
                currency: 'USD',
                unit: '10g',
                image: 'https://i.imgur.com/5mN3qRt.jpg',
                description: 'Hydrating lip balm with SPF',
                stock: 80,
                rating: 4.3,
                reviews: 145,
                offer: null,
                tags: ['hydrating', 'SPF', 'lip care'],
                nutritionalInfo: null
            },
            {
                id: 'prod_012',
                name: 'Moisturizer',
                category: 'beauty',
                price: 5.00,
                currency: 'USD',
                unit: '100ml',
                image: 'https://i.imgur.com/2kL9mNp.jpg',
                description: 'Daily moisturizer for hydrated skin',
                stock: 40,
                rating: 4.6,
                reviews: 289,
                offer: '15%',
                tags: ['daily', 'hydrating', 'lightweight'],
                nutritionalInfo: null
            },

            // Grains & Staples
            {
                id: 'prod_013',
                name: 'Chakki Fresh Atta',
                category: 'fruits',
                price: 4.55,
                currency: 'USD',
                unit: '5 KG',
                image: 'https://i.imgur.com/oYbYgGQ.jpg',
                description: 'Whole wheat flour for fresh rotis',
                stock: 30,
                rating: 4.7,
                reviews: 312,
                offer: '50%',
                tags: ['whole wheat', 'fresh', 'staple'],
                nutritionalInfo: {
                    calories: 340,
                    protein: 12,
                    carbs: 72,
                    fat: 2.5
                }
            },

            // Instant Food
            {
                id: 'prod_014',
                name: 'Maggie Noodles',
                category: 'snacks',
                price: 0.13,
                currency: 'USD',
                unit: '70g',
                image: 'https://i.imgur.com/mHmTIxp.jpg',
                description: 'Quick and delicious instant noodles',
                stock: 200,
                rating: 4.1,
                reviews: 456,
                offer: '20%',
                tags: ['instant', 'quick', 'snack'],
                nutritionalInfo: {
                    calories: 285,
                    protein: 7,
                    carbs: 41,
                    fat: 11
                }
            },

            // Office Supplies
            {
                id: 'prod_015',
                name: 'Stapler',
                category: 'office',
                price: 2.80,
                currency: 'USD',
                unit: '1 piece',
                image: 'https://i.imgur.com/4kL9mNp.jpg',
                description: 'Heavy duty stapler for office use',
                stock: 25,
                rating: 4.2,
                reviews: 89,
                offer: null,
                tags: ['office', 'heavy duty', 'essential'],
                nutritionalInfo: null
            },
            {
                id: 'prod_016',
                name: 'Pencils Set',
                category: 'office',
                price: 4.00,
                currency: 'USD',
                unit: '12 pieces',
                image: 'https://i.imgur.com/6mN3qRt.jpg',
                description: 'High quality HB pencils set',
                stock: 40,
                rating: 4.4,
                reviews: 123,
                offer: '10%',
                tags: ['stationery', 'school', 'office'],
                nutritionalInfo: null
            },
            {
                id: 'prod_017',
                name: 'Ball Pens',
                category: 'office',
                price: 2.20,
                currency: 'USD',
                unit: '10 pieces',
                image: 'https://i.imgur.com/8kL2LmP.jpg',
                description: 'Smooth writing ball pens',
                stock: 60,
                rating: 4.3,
                reviews: 167,
                offer: null,
                tags: ['stationery', 'smooth', 'reliable'],
                nutritionalInfo: null
            },

            // Medicine
            {
                id: 'prod_018',
                name: 'Cetirizine Tablets',
                category: 'medicine',
                price: 1.10,
                currency: 'USD',
                unit: '10 tablets',
                image: 'https://i.imgur.com/9QqB6iO.jpg',
                description: 'Allergy relief cetirizine tablets',
                stock: 100,
                rating: 4.5,
                reviews: 234,
                offer: null,
                tags: ['allergy', 'medicine', 'relief'],
                nutritionalInfo: null
            },
            {
                id: 'prod_019',
                name: 'Dolo Paracetamol',
                category: 'medicine',
                price: 1.25,
                currency: 'USD',
                unit: '15 tablets',
                image: 'https://i.imgur.com/3kP5e9u.jpg',
                description: 'Fever and pain relief tablets',
                stock: 120,
                rating: 4.6,
                reviews: 289,
                offer: '5%',
                tags: ['fever', 'pain relief', 'medicine'],
                nutritionalInfo: null
            },

            // Gardening
            {
                id: 'prod_020',
                name: 'Organic Manure',
                category: 'gardening',
                price: 6.00,
                currency: 'USD',
                unit: '5 KG',
                image: 'https://i.imgur.com/7mN8d2f.jpg',
                description: 'Organic manure for healthy plants',
                stock: 20,
                rating: 4.4,
                reviews: 78,
                offer: '20%',
                tags: ['organic', 'gardening', 'fertilizer'],
                nutritionalInfo: null
            }
        ];
    }

    // الحصول على جميع المنتجات
    getAllProducts() {
        return this.products;
    }

    // الحصول على المنتجات حسب الفئة
    getProductsByCategory(categoryId) {
        return this.products.filter(product => product.category === categoryId);
    }

    // البحث عن المنتجات
    searchProducts(query, filters = {}) {
        let results = this.products;

        // البحث بالنص
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // فلترة حسب الفئة
        if (filters.category) {
            results = results.filter(product => product.category === filters.category);
        }

        // فلترة حسب السعر
        if (filters.minPrice !== undefined) {
            results = results.filter(product => product.price >= filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            results = results.filter(product => product.price <= filters.maxPrice);
        }

        // فلترة حسب التقييم
        if (filters.minRating !== undefined) {
            results = results.filter(product => product.rating >= filters.minRating);
        }

        // فلترة حسب العرض
        if (filters.offerOnly) {
            results = results.filter(product => product.offer);
        }

        // فلترة حسب المخزون
        if (filters.inStock) {
            results = results.filter(product => product.stock > 0);
        }

        return results;
    }

    // الحصول على منتج بالمعرف
    getProductById(productId) {
        return this.products.find(product => product.id === productId);
    }

    // إضافة منتج جديد
    addProduct(productData) {
        const newProduct = {
            id: this.generateProductId(),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.products.push(newProduct);
        this.saveProducts();
        
        return newProduct;
    }

    // تحديث منتج
    updateProduct(productId, updateData) {
        const productIndex = this.products.findIndex(product => product.id === productId);
        
        if (productIndex === -1) {
            return null;
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveProducts();
        return this.products[productIndex];
    }

    // حذف منتج
    deleteProduct(productId) {
        const productIndex = this.products.findIndex(product => product.id === productId);
        
        if (productIndex === -1) {
            return false;
        }

        this.products.splice(productIndex, 1);
        this.saveProducts();
        return true;
    }

    // تحديث المخزون
    updateStock(productId, quantity, operation = 'set') {
        const product = this.getProductById(productId);
        if (!product) return false;

        switch (operation) {
            case 'add':
                product.stock += quantity;
                break;
            case 'subtract':
                product.stock = Math.max(0, product.stock - quantity);
                break;
            case 'set':
            default:
                product.stock = quantity;
                break;
        }

        product.updatedAt = new Date().toISOString();
        this.saveProducts();
        return true;
    }

    // الحصول على المنتجات العرضية
    getFeaturedProducts(limit = 8) {
        return this.products
            .filter(product => product.rating >= 4.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    // الحصول على المنتجات المخفضة
    getDiscountedProducts(limit = 10) {
        return this.products
            .filter(product => product.offer)
            .sort((a, b) => {
                const discountA = parseFloat(a.offer) || 0;
                const discountB = parseFloat(b.offer) || 0;
                return discountB - discountA;
            })
            .slice(0, limit);
    }

    // الحصول على المنتجات الأكثر مبيعاً
    getBestSellingProducts(limit = 10) {
        // في تطبيق حقيقي، سيتم استخدام بيانات المبيعات الفعلية
        return this.products
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
    }

    // الحصول على المنتجات المتعلقة
    getRelatedProducts(productId, limit = 4) {
        const product = this.getProductById(productId);
        if (!product) return [];

        return this.products
            .filter(p => 
                p.id !== productId && 
                (p.category === product.category || 
                 p.tags.some(tag => product.tags.includes(tag)))
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
    }

    // الحصول على إحصائيات المنتجات
    getProductStats() {
        const stats = {
            totalProducts: this.products.length,
            totalCategories: this.categories.length,
            averagePrice: 0,
            totalStock: 0,
            productsWithOffers: 0,
            averageRating: 0,
            categoryDistribution: {}
        };

        if (this.products.length === 0) return stats;

        stats.totalStock = this.products.reduce((sum, product) => sum + product.stock, 0);
        stats.averagePrice = this.products.reduce((sum, product) => sum + product.price, 0) / this.products.length;
        stats.productsWithOffers = this.products.filter(product => product.offer).length;
        stats.averageRating = this.products.reduce((sum, product) => sum + (product.rating || 0), 0) / this.products.length;

        // توزيع الفئات
        this.categories.forEach(category => {
            const categoryProducts = this.getProductsByCategory(category.id);
            stats.categoryDistribution[category.id] = {
                name: category.name,
                count: categoryProducts.length,
                percentage: (categoryProducts.length / this.products.length * 100).toFixed(1)
            };
        });

        return stats;
    }

    // إنشاء معرف منتج فريد
    generateProductId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `prod_${timestamp}_${random}`;
    }

    // تصدير المنتجات
    exportProducts(format = 'json') {
        const data = {
            products: this.products,
            categories: this.categories,
            exportDate: new Date().toISOString(),
            stats: this.getProductStats()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data.products);
            default:
                return data;
        }
    }

    // تحويل إلى CSV
    convertToCSV(products) {
        const headers = ['ID', 'Name', 'Category', 'Price', 'Currency', 'Unit', 'Stock', 'Rating', 'Offer'];
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                product.id,
                `"${product.name}"`,
                product.category,
                product.price,
                product.currency,
                `"${product.unit}"`,
                product.stock,
                product.rating || 0,
                product.offer || ''
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    // استيراد المنتجات
    importProducts(data, format = 'json') {
        try {
            let productsToImport = [];

            switch (format) {
                case 'json':
                    productsToImport = data.products || data;
                    break;
                case 'csv':
                    productsToImport = this.parseCSV(data);
                    break;
                default:
                    throw new Error('Unsupported format');
            }

            // التحقق من صحة البيانات
            const validProducts = productsToImport.filter(product => 
                product.name && 
                product.price && 
                product.category
            );

            // إضافة المنتجات
            validProducts.forEach(product => {
                const existingProduct = this.getProductById(product.id);
                if (existingProduct) {
                    this.updateProduct(product.id, product);
                } else {
                    this.addProduct(product);
                }
            });

            return {
                success: true,
                imported: validProducts.length,
                total: productsToImport.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // تحليل CSV
    parseCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const product = {};
            
            headers.forEach((header, index) => {
                const value = values[index];
                switch (header.toLowerCase()) {
                    case 'price':
                        product[header] = parseFloat(value) || 0;
                        break;
                    case 'stock':
                    case 'rating':
                        product[header] = parseInt(value) || 0;
                        break;
                    default:
                        product[header] = value;
                }
            });
            
            return product;
        }).filter(product => product.name);
    }

    // إعداد إدارة قاعدة البيانات
    setupDatabaseManagement() {
        // إضافة واجهة إدارة للمطورين
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createAdminInterface();
        }
    }

    // إنشاء واجهة الإدارة
    createAdminInterface() {
        const adminBtn = document.createElement('button');
        adminBtn.innerHTML = '🗄️ DB Admin';
        adminBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #40aa54;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            font-size: 12px;
        `;
        
        adminBtn.onclick = () => this.showAdminPanel();
        document.body.appendChild(adminBtn);
    }

    // عرض لوحة الإدارة
    showAdminPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const stats = this.getProductStats();
        
        panel.innerHTML = `
            <h2>🗄️ Product Database Admin</h2>
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${stats.totalProducts}</h3>
                    <p>Total Products</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.totalCategories}</h3>
                    <p>Categories</p>
                </div>
                <div class="stat-card">
                    <h3>$${stats.averagePrice.toFixed(2)}</h3>
                    <p>Avg Price</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.totalStock}</h3>
                    <p>Total Stock</p>
                </div>
            </div>
            <div class="admin-actions">
                <button onclick="productDB.exportProducts('json')">📥 Export JSON</button>
                <button onclick="productDB.exportProducts('csv')">📥 Export CSV</button>
                <button onclick="productDB.showImportDialog()">📤 Import Products</button>
                <button onclick="productDB.refreshProducts()">🔄 Refresh</button>
            </div>
            <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px;">✕</button>
        `;

        // إضافة CSS للوحة الإدارة
        const style = document.createElement('style');
        style.textContent = `
            .admin-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .stat-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .stat-card h3 {
                margin: 0;
                color: #40aa54;
                font-size: 24px;
            }
            .stat-card p {
                margin: 5px 0 0 0;
                color: #666;
                font-size: 12px;
            }
            .admin-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 20px;
            }
            .admin-actions button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background: #40aa54;
                color: white;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(panel);
    }

    // تحديث عدد المنتجات
    updateProductCount() {
        const countElement = document.querySelector('.product-count');
        if (countElement) {
            countElement.textContent = `${this.products.length} Products`;
        }
    }

    // تحديث المنتجات
    refreshProducts() {
        this.products = this.loadProducts();
        this.updateProductCount();
        this.showNotification('Products refreshed successfully', 'success');
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
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // إعداد عمليات CRUD
    setupProductCRUD() {
        // هذه الدوال يمكن توسيعها لإضافة واجهة مستخدم كاملة لإدارة المنتجات
        window.productDB = this;
    }

    // إعداد البحث والفلترة
    setupSearchAndFilter() {
        // إعداد البحث المتقدم للمنتجات
        this.setupAdvancedSearch();
    }

    // إعداد البحث المتقدم
    setupAdvancedSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                const results = this.searchProducts(query);
                this.displaySearchResults(results, query);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    const results = this.searchProducts(query);
                    this.displaySearchResults(results, query);
                }
            });
        }
    }

    // عرض نتائج البحث
    displaySearchResults(results, query) {
        if (results.length === 0) {
            alert(`No products found for "${query}". Try different keywords.`);
            return;
        }
        
        let resultMessage = `Found ${results.length} product(s) for "${query}":\n\n`;
        results.forEach((product, index) => {
            resultMessage += `${index + 1}. ${product.name} (${product.category}) - $${product.price}\n`;
        });
        
        alert(resultMessage);
    }
}

// إنشاء قاعدة بيانات المنتجات
const productDB = new ProductDatabase();

// تصدير للإستخدام العام
window.ProductDatabase = ProductDatabase;
window.productDB = productDB;
