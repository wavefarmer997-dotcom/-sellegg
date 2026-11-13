/**
 * EGGIFY – Unified Online Database, Authentication & Cart Engine (js/db.js)
 * รองรับทั้งการเชื่อมต่อฐานข้อมูล SQLite ผ่าน Node.js API (/api/*)
 * และระบบ Cloud-Synced LocalStorage สำหรับรันเป็นเว็บออนไลน์ทุกแพลตฟอร์ม
 */

(function (window) {
  const STORAGE_KEYS = {
    PRODUCTS: 'eggify_products',
    ADMIN_PRODUCTS: 'eggify_admin_products',
    CART: 'eggify_cart',
    ORDERS: 'eggify_admin_orders',
    USERS: 'eggify_users',
    CURRENT_USER: 'eggify_current_user',
    TOKEN: 'eggify_auth_token',
    COUPON: 'eggify_active_coupon',
    DB_VERSION: 'eggify_db_v2'
  };

  const INITIAL_PRODUCTS = [
    {
      id: 1,
      code: 'egg-01',
      name: 'ไข่ไก่สดออร์แกนิค (Free-Range) แพ็ก 10 ฟอง',
      category: 'ไข่ไก่',
      categoryKey: 'chicken',
      badge: 'ขายดีอันดับ 1',
      price: 89,
      stock: 35,
      unit: 'แพ็ก 10 ฟอง',
      eggType: 'brown',
      weight: '65–70 กรัม/ฟอง',
      nutrition: 'โปรตีน 6.8g • โอเมก้าสูง • ปลอดยาปฏิชีวนะ 100%',
      farmOrigin: 'ฟาร์มระบบเปิด นครปฐม (GAP Certified)',
      description: 'แม่ไก่เลี้ยงปล่อยอิสระในโรงเรือนธรรมชาติ ไข่แดงกลมโตสีส้มสด เปลือกสะอาด ปลอดสารเร่งและยาปฏิชีวนะ 100%'
    },
    {
      id: 2,
      code: 'egg-02',
      name: 'ไข่ไก่สดคัดพิเศษ เบอร์ 0 ยกแผง 30 ฟอง',
      category: 'ไข่ไก่',
      categoryKey: 'chicken',
      badge: 'คุ้มค่าประจำบ้าน',
      price: 145,
      stock: 45,
      unit: 'แผง 30 ฟอง',
      eggType: 'brown',
      weight: '70 กรัมขึ้นไป/ฟอง',
      nutrition: 'โปรตีน 7.2g • วิตามิน A, B12, D สูง',
      farmOrigin: 'ฟาร์มเอ้กอิฟาย นครปฐม',
      description: 'ฟองใหญ่พิเศษ เปลือกหนา ไข่แดงกลมโต เก็บใหม่จากฟาร์มทุกเช้า เหมาะสำหรับทุกเมนูในครอบครัวและร้านเบเกอรี่'
    },
    {
      id: 3,
      code: 'egg-03',
      name: 'ไข่ไก่สด เบอร์ 1 คัดขนาดมาตรฐาน แพ็ก 10 ฟอง',
      category: 'ไข่ไก่',
      categoryKey: 'chicken',
      badge: 'ยอดนิยม',
      price: 55,
      stock: 60,
      unit: 'แพ็ก 10 ฟอง',
      eggType: 'brown',
      weight: '65–69 กรัม/ฟอง',
      nutrition: 'โปรตีน 6.5g • สดสะอาดผ่านการฆ่าเชื้อ UV',
      farmOrigin: 'ฟาร์มเอ้กอิฟาย นครปฐม',
      description: 'ไข่ไก่สด คัดขนาด เบอร์ 1 สดใหม่ทุกวัน เหมาะสำหรับทำอาหารเช้า ไข่เจียว ไข่ดาว และเมนูประจำบ้าน'
    },
    {
      id: 4,
      code: 'egg-04',
      name: 'ไข่ไก่เสริม Omega-3 & Vitamin E แพ็ก 10 ฟอง',
      category: 'ไข่ไก่',
      categoryKey: 'chicken',
      badge: 'เพื่อสุขภาพ',
      price: 99,
      stock: 28,
      unit: 'แพ็ก 10 ฟอง',
      eggType: 'mixed',
      weight: '65–70 กรัม/ฟอง',
      nutrition: 'DHA & Omega-3 สูงกว่าไข่ทั่วไป 3 เท่า • วิตามิน E สูง',
      farmOrigin: 'ฟาร์มเอ้กอิฟาย ออร์แกนิค นครปฐม',
      description: 'แม่ไก่กินอาหารสูตรเมล็ดแฟลกซ์และสาหร่ายทะเล อุดมด้วยโอเมก้า 3 สูงกว่าไข่ทั่วไป 3 เท่า บำรุงสมองและหัวใจ'
    },
    {
      id: 5,
      code: 'egg-05',
      name: 'ไข่เป็ดไล่ทุ่งสุพรรณบุรี สดใหม่ แพ็ก 10 ฟอง',
      category: 'ไข่เป็ด',
      categoryKey: 'duck',
      badge: 'ไข่แดงมันเยิ้ม',
      price: 65,
      stock: 30,
      unit: 'แพ็ก 10 ฟอง',
      eggType: 'white',
      weight: '70–75 กรัม/ฟอง',
      nutrition: 'โปรตีน 8.2g • ไข่แดงเข้มข้นมันธรรมชาติ',
      farmOrigin: 'ฟาร์มเป็ดไล่ทุ่ง สุพรรณบุรี',
      description: 'ไข่เป็ดสดใหม่จากฟาร์มไล่ทุ่งธรรมชาติ ไข่แดงสีส้มแดงมันเยิ้ม เหมาะสำหรับทำไข่ดาวกรอบ ไข่ต้มยางมะตูม และขนมไทย'
    },
    {
      id: 6,
      code: 'egg-06',
      name: 'ไข่เป็ดคัดพิเศษ เบอร์ใหญ่ ยกแผง 30 ฟอง',
      category: 'ไข่เป็ด',
      categoryKey: 'duck',
      badge: 'เกรดร้านขนมไทย',
      price: 175,
      stock: 20,
      unit: 'แผง 30 ฟอง',
      eggType: 'white',
      weight: '75 กรัมขึ้นไป/ฟอง',
      nutrition: 'โปรตีน 8.5g • วิตามิน B รวมและธาตุเหล็กสูง',
      farmOrigin: 'ฟาร์มเป็ดไล่ทุ่ง สุพรรณบุรี',
      description: 'ไข่เป็ดเปลือกขาวฟองใหญ่พิเศษ คัดเกรดสำหรับทำฝอยทอง ทองหยิบ ทองหยอด สังขยา และเมนูอาหารคาวรสเข้มข้น'
    },
    {
      id: 7,
      code: 'egg-07',
      name: 'ไข่เค็มไชยาพอกดินสอพอง สูตรดั้งเดิม 6 ฟอง',
      category: 'ไข่เป็ด',
      categoryKey: 'duck',
      badge: 'OTOP คัดพิเศษ',
      price: 65,
      stock: 25,
      unit: 'กล่อง 6 ฟอง',
      eggType: 'white',
      weight: '70 กรัม/ฟอง',
      nutrition: 'พอกดินสอพองธรรมชาติ • ไร้สารกันบูด',
      farmOrigin: 'กลุ่มแม่บ้านเกษตรกร ไชยา',
      description: 'เค็มกำลังดี ไข่แดงแดงสดมันเยิ้มเป็นทราย สามารถนำไปต้มเป็นไข่เค็มยำ หรือตอกทอดเป็นไข่ดาวเค็มได้ทันที'
    },
    {
      id: 8,
      code: 'egg-08',
      name: 'ไข่นกกระทาสดปลอดสาร คัดพิเศษ แพ็ก 25 ฟอง',
      category: 'ไข่นกกระทา',
      categoryKey: 'quail',
      badge: 'สดจากฟาร์มทุกเช้า',
      price: 40,
      stock: 50,
      unit: 'แพ็ก 25 ฟอง',
      eggType: 'quail',
      weight: '11–13 กรัม/ฟอง',
      nutrition: 'วิตามิน B12 และธาตุเหล็กสูง • ย่อยง่าย',
      farmOrigin: 'ฟาร์มนกกระทาปลอดสาร ราชบุรี',
      description: 'ไข่นกกระทาคุณภาพดี เปลือกลายสวย สดใหม่ทุกวัน เหมาะสำหรับทำขนมครกไข่นกกระทา กระเพาะปลา และเมนูเด็ก'
    },
    {
      id: 9,
      code: 'egg-09',
      name: 'ไข่นกกระทาต้มสุกพร้อมทาน ปอกเปลือกสะอาด 20 ฟอง',
      category: 'ไข่นกกระทา',
      categoryKey: 'quail',
      badge: 'พร้อมปรุงทันที',
      price: 55,
      stock: 32,
      unit: 'แพ็ก 20 ฟอง',
      eggType: 'quail',
      weight: '10–12 กรัม/ฟอง (ต้มสุก)',
      nutrition: 'โปรตีนล้วน • บรรจุสูญญากาศสะอาดปลอดภัย',
      farmOrigin: 'ฟาร์มนกกระทาปลอดสาร ราชบุรี',
      description: 'ไข่นกกระทาต้มสุกปอกเปลือกด้วยเครื่องจักรสะอาดมาตรฐาน อย. พร้อมนำไปทำพะโล้ สลัด หรือทานเล่นได้ทันที'
    },
    {
      id: 10,
      code: 'egg-10',
      name: 'ชุดครอบครัวอิ่มคุ้ม Mixed Farm Pack (40 ฟอง)',
      category: 'เซ็ตสุดคุ้ม',
      categoryKey: 'special',
      badge: 'ลดพิเศษ 15%',
      price: 215,
      stock: 18,
      unit: 'เซ็ต 40 ฟอง',
      eggType: 'mixed',
      weight: 'รวม 40 ฟอง (คละไซส์พรีเมียม)',
      nutrition: 'ครบคุณค่าโปรตีนสำหรับทุกคนในบ้าน',
      farmOrigin: 'ฟาร์มเอ้กอิฟาย นครปฐม',
      description: 'จับคู่ความคุ้ม! ไข่ไก่เบอร์ 0 ยกแผง (30 ฟอง) + ไข่ไก่ออร์แกนิค Free-Range (10 ฟอง) ประหยัดทันที 15%'
    }
  ];

  const INITIAL_ORDERS = [
    {
      id: 'EGG-1001',
      customer: 'สมชาย ใจดี',
      email: 'customer@eggify.com',
      phone: '081-234-5678',
      address: '88/12 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      paymentMethod: 'QR PromptPay',
      items: [
        { id: 3, name: 'ไข่ไก่สด เบอร์ 1 คัดขนาดมาตรฐาน แพ็ก 10 ฟอง', price: 55, qty: 3 }
      ],
      subtotal: 165,
      discount: 0,
      shipping: 0,
      total: 165,
      status: 'รอดำเนินการ',
      createdAt: '2026-11-12 09:30'
    },
    {
      id: 'EGG-1002',
      customer: 'สุดา รักไข่',
      email: 'suda@example.com',
      phone: '089-555-1212',
      address: '45/9 หมู่ 4 ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000',
      paymentMethod: 'โอนเงินผ่านธนาคาร',
      items: [
        { id: 2, name: 'ไข่ไก่สดคัดพิเศษ เบอร์ 0 ยกแผง 30 ฟอง', price: 145, qty: 1 },
        { id: 5, name: 'ไข่เป็ดไล่ทุ่งสุพรรณบุรี สดใหม่ แพ็ก 10 ฟอง', price: 65, qty: 1 }
      ],
      subtotal: 210,
      discount: 0,
      shipping: 10,
      total: 220,
      status: 'กำลังจัดส่ง',
      createdAt: '2026-11-12 14:15'
    },
    {
      id: 'EGG-1003',
      customer: 'มานะ ขยัน',
      email: 'mana@example.com',
      phone: '092-111-2222',
      address: '199/3 ต.ประชาธิปัตย์ อ.ธัญบุรี จ.ปทุมธานี 12130',
      paymentMethod: 'เก็บเงินปลายทาง (COD)',
      items: [
        { id: 8, name: 'ไข่นกกระทาสดปลอดสาร คัดพิเศษ แพ็ก 25 ฟอง', price: 40, qty: 1 },
        { id: 3, name: 'ไข่ไก่สด เบอร์ 1 คัดขนาดมาตรฐาน แพ็ก 10 ฟอง', price: 55, qty: 1 }
      ],
      subtotal: 95,
      discount: 0,
      shipping: 15,
      total: 110,
      status: 'จัดส่งแล้ว',
      createdAt: '2026-11-11 17:40'
    }
  ];

  const INITIAL_USERS = [
    {
      id: 1,
      name: 'ผู้ดูแลระบบ EGGIFY (Admin)',
      email: 'admin@eggify.com',
      password: 'admin123',
      phone: '02-123-4567',
      address: 'สำนักงานใหญ่ ฟาร์มเอ้กอิฟาย อ.สามพราน จ.นครปฐม 73110',
      role: 'admin',
      createdAt: '2026-11-01'
    },
    {
      id: 2,
      name: 'สมชาย ใจดี',
      email: 'customer@eggify.com',
      password: '123456',
      phone: '081-234-5678',
      address: '88/12 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      role: 'customer',
      createdAt: '2026-11-05'
    }
  ];

  let apiOnline = false;

  function normalizeProduct(p, index = 0) {
    const id = Number(p.id) || index + 1;
    const cat = p.category || 'ไข่ไก่';
    let categoryKey = p.categoryKey || 'chicken';
    if (cat.includes('เป็ด') || cat === 'duck') categoryKey = 'duck';
    else if (cat.includes('นกกระทา') || cat === 'quail') categoryKey = 'quail';
    else if (cat.includes('เซ็ต') || cat.includes('อื่น') || cat === 'special') categoryKey = 'special';
    else if (cat.includes('ไก่') || cat === 'chicken' || cat === 'organic') categoryKey = 'chicken';

    const categoryLabel =
      cat === 'chicken' || cat === 'organic' ? 'ไข่ไก่' :
      cat === 'duck' ? 'ไข่เป็ด' :
      cat === 'quail' ? 'ไข่นกกระทา' :
      cat === 'special' ? 'เซ็ตสุดคุ้ม' : cat;

    const eggType = p.eggType || (
      categoryKey === 'duck' ? 'white' :
      categoryKey === 'quail' ? 'quail' :
      categoryKey === 'special' ? 'mixed' : 'brown'
    );

    const desc = p.description || p.meta || 'คัดสรรสดใหม่จากฟาร์มมาตรฐาน GAP ส่งตรงถึงบ้านคุณ';

    return {
      id,
      code: p.code || `egg-${String(id).padStart(2, '0')}`,
      name: p.name || 'สินค้าไข่สด EGGIFY',
      category: categoryLabel,
      categoryKey,
      categoryLabel,
      badge: p.badge || (Number(p.stock) > 0 ? `คงเหลือ ${p.stock} ชิ้น` : 'สินค้าขายดี'),
      price: Number(p.price) || 0,
      stock: p.stock !== undefined ? Number(p.stock) : 25,
      unit: p.unit || 'แพ็กมาตรฐาน',
      eggType,
      weight: p.weight || 'ขนาดคัดพิเศษจากฟาร์ม',
      nutrition: p.nutrition || 'อุดมด้วยโปรตีนและวิตามินธรรมชาติ 100%',
      farmOrigin: p.farmOrigin || 'ฟาร์มเอ้กอิฟาย มาตรฐาน GAP',
      description: desc,
      meta: desc,
      image: p.image || ''
    };
  }

  function initLocalDatabase() {
    const isUpgraded = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
    if (!isUpgraded) {
      const normalized = INITIAL_PRODUCTS.map(normalizeProduct);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(normalized));
      localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCTS, JSON.stringify(normalized));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      }
      localStorage.setItem(STORAGE_KEYS.DB_VERSION, 'true');
    } else {
      // ซิงค์ข้อมูลระหว่าง eggify_admin_products และ eggify_products ให้ตรงกันเสมอ
      const adminProds = readJSON(STORAGE_KEYS.ADMIN_PRODUCTS, null);
      const storeProds = readJSON(STORAGE_KEYS.PRODUCTS, null);
      if (adminProds && Array.isArray(adminProds) && adminProds.length > 0) {
        const synced = adminProds.map(normalizeProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(synced));
        localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCTS, JSON.stringify(synced));
      } else if (storeProds && Array.isArray(storeProds) && storeProds.length > 0) {
        const synced = storeProds.map(normalizeProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(synced));
        localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCTS, JSON.stringify(synced));
      } else {
        const normalized = INITIAL_PRODUCTS.map(normalizeProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(normalized));
        localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCTS, JSON.stringify(normalized));
      }

      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      }
    }
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ซิงค์กับ SQLite API Server อัตโนมัติเมื่อเปิดผ่าน Node.js Server
  async function syncWithServer() {
    if (window.location.protocol === 'file:') {
      apiOnline = false;
      return false;
    }
    try {
      const res = await fetch('/api/bootstrap', { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) return false;
      const data = await res.json();
      apiOnline = true;
      if (Array.isArray(data.products) && data.products.length > 0) {
        const normalized = data.products.map(normalizeProduct);
        writeJSON(STORAGE_KEYS.PRODUCTS, normalized);
        writeJSON(STORAGE_KEYS.ADMIN_PRODUCTS, normalized);
      }
      if (Array.isArray(data.orders)) {
        writeJSON(STORAGE_KEYS.ORDERS, data.orders);
      }
      if (Array.isArray(data.users)) {
        writeJSON(STORAGE_KEYS.USERS, data.users);
      }
      window.dispatchEvent(new CustomEvent('eggify:synced', { detail: { online: true } }));
      return true;
    } catch {
      apiOnline = false;
      return false;
    }
  }

  // ================= PRODUCTS =================
  function getProducts() {
    const raw = readJSON(STORAGE_KEYS.ADMIN_PRODUCTS, null) || readJSON(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return (Array.isArray(raw) ? raw : INITIAL_PRODUCTS).map(normalizeProduct);
  }

  function saveProducts(list) {
    const normalized = list.map(normalizeProduct);
    writeJSON(STORAGE_KEYS.PRODUCTS, normalized);
    writeJSON(STORAGE_KEYS.ADMIN_PRODUCTS, normalized);
    return normalized;
  }

  async function upsertProduct(productData) {
    const list = getProducts();
    const isEdit = Boolean(productData.id && list.some(p => Number(p.id) === Number(productData.id)));
    const id = isEdit ? Number(productData.id) : Date.now();
    const existing = list.find(p => Number(p.id) === id) || {};
    const merged = normalizeProduct({ ...existing, ...productData, id });

    const nextList = isEdit
      ? list.map(p => (Number(p.id) === id ? merged : p))
      : [...list, merged];
    saveProducts(nextList);

    if (apiOnline) {
      try {
        await fetch(isEdit ? `/api/products/${id}` : '/api/products', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
      } catch {
        // fallback saved in localStorage
      }
    }
    return merged;
  }

  async function deleteProduct(id) {
    const numId = Number(id);
    const nextList = getProducts().filter(p => Number(p.id) !== numId);
    saveProducts(nextList);

    if (apiOnline) {
      try {
        await fetch(`/api/products/${numId}`, { method: 'DELETE' });
      } catch {
        // fallback saved in localStorage
      }
    }
    return nextList;
  }

  // ================= CART =================
  function getCart() {
    return readJSON(STORAGE_KEYS.CART, []);
  }

  function saveCart(cart) {
    const cleaned = cart.filter(item => Number(item.qty) > 0);
    writeJSON(STORAGE_KEYS.CART, cleaned);
    window.dispatchEvent(new CustomEvent('eggify:cart-updated', { detail: cleaned }));
    return cleaned;
  }

  function addToCart(productRef, qty = 1) {
    const products = getProducts();
    const product = products.find(
      p => String(p.id) === String(productRef) || String(p.code) === String(productRef)
    );
    if (!product) return null;

    const cart = getCart();
    const existing = cart.find(
      item => String(item.id) === String(product.id) || String(item.code) === String(product.code)
    );

    if (existing) {
      existing.qty = Math.min((Number(existing.qty) || 0) + Number(qty), Math.max(product.stock || 99, 1));
      existing.price = product.price;
      existing.name = product.name;
      existing.unit = product.unit;
      existing.category = product.category;
      existing.eggType = product.eggType;
    } else {
      cart.push({
        id: product.id,
        code: product.code,
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
        eggType: product.eggType,
        qty: Math.max(1, Number(qty) || 1)
      });
    }
    saveCart(cart);
    return product;
  }

  function updateCartQty(productRef, deltaOrExact, isExact = false) {
    let cart = getCart();
    const target = cart.find(
      item => String(item.id) === String(productRef) || String(item.code) === String(productRef)
    );
    if (!target) return cart;

    target.qty = isExact ? Number(deltaOrExact) : (Number(target.qty) || 0) + Number(deltaOrExact);
    if (target.qty <= 0) {
      cart = cart.filter(item => item !== target);
    }
    return saveCart(cart);
  }

  function removeFromCart(productRef) {
    const cart = getCart().filter(
      item => String(item.id) !== String(productRef) && String(item.code) !== String(productRef)
    );
    return saveCart(cart);
  }

  function clearCart() {
    return saveCart([]);
  }

  function calculateCartTotals(customCouponCode = null) {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const totalCount = cart.reduce((sum, item) => sum + Number(item.qty), 0);
    const activeCoupon = (customCouponCode !== null ? customCouponCode : localStorage.getItem(STORAGE_KEYS.COUPON) || '').trim().toUpperCase();

    let discount = 0;
    let couponDescription = '';
    let freeShippingCoupon = false;

    if (subtotal > 0 && activeCoupon) {
      if (activeCoupon === 'EGGFRESH20') {
        discount = Math.round(subtotal * 0.2);
        couponDescription = 'ลด 20% สำหรับลูกค้าใหม่ (EGGFRESH20)';
      } else if (activeCoupon === 'FAMILY50' && subtotal >= 500) {
        discount = 50;
        couponDescription = 'ส่วนลดแพ็กครอบครัว ฿50 (FAMILY50)';
      } else if (activeCoupon === 'FREESHIP299' && subtotal >= 299) {
        freeShippingCoupon = true;
        couponDescription = 'ส่งด่วนฟรีเมื่อครบ ฿299 (FREESHIP299)';
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = subtotal === 0 ? 0 : (subtotal >= 299 || freeShippingCoupon ? 0 : 35);
    const total = afterDiscount + shipping;

    return {
      cart,
      totalCount,
      subtotal,
      discount,
      shipping,
      total,
      activeCoupon,
      couponDescription
    };
  }

  // ================= ORDERS =================
  function getOrders() {
    return readJSON(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  function saveOrders(orders) {
    writeJSON(STORAGE_KEYS.ORDERS, orders);
    return orders;
  }

  async function createOrder(orderPayload) {
    const orders = getOrders();
    const nextNum = 1001 + orders.length;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newOrder = {
      id: orderPayload.id || `EGG-${nextNum}`,
      customer: orderPayload.customer,
      email: orderPayload.email || '',
      phone: orderPayload.phone,
      address: orderPayload.address,
      note: orderPayload.note || '',
      deliverySlot: orderPayload.deliverySlot || 'รอบเช้า (08:00 - 12:00 น.)',
      paymentMethod: orderPayload.paymentMethod || 'QR PromptPay',
      items: orderPayload.items || [],
      subtotal: Number(orderPayload.subtotal) || 0,
      discount: Number(orderPayload.discount) || 0,
      shipping: Number(orderPayload.shipping) || 0,
      total: Number(orderPayload.total) || 0,
      status: 'รอดำเนินการ',
      createdAt
    };

    orders.push(newOrder);
    saveOrders(orders);

    // ตัดสต็อกสินค้าอัตโนมัติ
    const products = getProducts().map(prod => {
      const bought = (newOrder.items || []).find(
        i => String(i.id) === String(prod.id) || String(i.code) === String(prod.code)
      );
      if (bought) {
        return { ...prod, stock: Math.max(0, Number(prod.stock) - Number(bought.qty)) };
      }
      return prod;
    });
    saveProducts(products);

    if (apiOnline) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
      } catch {
        // fallback saved in localStorage
      }
    }

    clearCart();
    return newOrder;
  }

  async function updateOrderStatus(orderId, status) {
    const orders = getOrders().map(o => (o.id === orderId ? { ...o, status } : o));
    saveOrders(orders);

    if (apiOnline) {
      try {
        await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch {
        // fallback saved in localStorage
      }
    }
    return orders;
  }

  // ================= AUTHENTICATION =================
  function getUsers() {
    return readJSON(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  function getCurrentUser() {
    return readJSON(STORAGE_KEYS.CURRENT_USER, null);
  }

  async function login(email, password) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (apiOnline) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          writeJSON(STORAGE_KEYS.CURRENT_USER, data.user);
          if (data.token) localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          return { ok: true, user: data.user };
        }
        return { ok: false, message: data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      } catch {
        // fallback to local auth
      }
    }

    const users = getUsers();
    const found = users.find(
      u => String(u.email).toLowerCase() === cleanEmail && String(u.password) === cleanPass
    );
    if (!found) {
      return { ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง' };
    }
    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone || '',
      address: found.address || '',
      role: found.role || 'customer'
    };
    writeJSON(STORAGE_KEYS.CURRENT_USER, safeUser);
    return { ok: true, user: safeUser };
  }

  async function register(payload) {
    const cleanEmail = String(payload.email || '').trim().toLowerCase();
    const name = String(payload.name || '').trim();
    const phone = String(payload.phone || '').trim();
    const address = String(payload.address || '').trim();
    const password = String(payload.password || '');

    if (!name || !cleanEmail || !password) {
      return { ok: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    if (apiOnline) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: cleanEmail, phone, address, password })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          writeJSON(STORAGE_KEYS.CURRENT_USER, data.user);
          if (data.token) localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          const users = getUsers();
          if (!users.some(u => u.email.toLowerCase() === cleanEmail)) {
            users.push({ ...data.user, password });
            writeJSON(STORAGE_KEYS.USERS, users);
          }
          return { ok: true, user: data.user };
        }
        return { ok: false, message: data.message || 'ไม่สามารถสมัครสมาชิกได้' };
      } catch {
        // fallback to local registration
      }
    }

    const users = getUsers();
    if (users.some(u => String(u.email).toLowerCase() === cleanEmail)) {
      return { ok: false, message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ' };
    }

    const newUser = {
      id: Date.now(),
      name,
      email: cleanEmail,
      password,
      phone,
      address,
      role: 'customer',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    users.push(newUser);
    writeJSON(STORAGE_KEYS.USERS, users);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role
    };
    writeJSON(STORAGE_KEYS.CURRENT_USER, safeUser);
    return { ok: true, user: safeUser };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  async function resetDatabase() {
    localStorage.removeItem(STORAGE_KEYS.DB_VERSION);
    initLocalDatabase();
    if (apiOnline) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        await syncWithServer();
      } catch {
        // ignore
      }
    }
    return true;
  }

  // สร้างกราฟิกแผงไข่ 3D สำหรับการ์ดสินค้าและหน้าแสดงรายละเอียด
  function renderEggGraphic(type) {
    if (type === 'white') {
      return `
        <div class="mini-egg-pack" style="background:#E6DEC8;border-color:#CFC4A9;">
          <div class="mini-egg egg-white"></div>
          <div class="mini-egg egg-white"></div>
          <div class="mini-egg egg-white"></div>
        </div>
      `;
    }
    if (type === 'quail') {
      return `
        <div class="mini-egg-pack" style="background:#E8DFD1;border-color:#CDBFA8;gap:10px;">
          <div class="mini-egg egg-quail"></div>
          <div class="mini-egg egg-quail"></div>
          <div class="mini-egg egg-quail"></div>
          <div class="mini-egg egg-quail"></div>
        </div>
      `;
    }
    if (type === 'mixed') {
      return `
        <div class="mini-egg-pack">
          <div class="mini-egg egg-brown"></div>
          <div class="mini-egg egg-white"></div>
          <div class="mini-egg egg-brown"></div>
        </div>
      `;
    }
    return `
      <div class="mini-egg-pack">
        <div class="mini-egg egg-brown"></div>
        <div class="mini-egg egg-brown"></div>
        <div class="mini-egg egg-brown"></div>
      </div>
    `;
  }

  // อัปเดตปุ่มผู้ใช้งานและจำนวนตะกร้าบน Navbar ของทุกหน้าโดยอัตโนมัติ
  function syncHeaderStatus() {
    const totals = calculateCartTotals();
    document.querySelectorAll('#cartCountBadge, .js-cart-count').forEach(el => {
      el.textContent = totals.totalCount;
    });

    const user = getCurrentUser();
    const userLinks = document.querySelectorAll('.js-user-nav-btn');
    userLinks.forEach(btn => {
      if (user) {
        btn.setAttribute('title', `เข้าสู่ระบบในชื่อ: ${user.name} (${user.role === 'admin' ? 'Admin' : 'สมาชิก'})`);
        btn.classList.add('logged-in-user');
        btn.innerHTML = `<span style="font-weight:700;font-size:0.78rem;color:var(--brand-green);">${user.name.trim().charAt(0).toUpperCase()}</span>`;
      } else {
        btn.setAttribute('title', 'เข้าสู่ระบบ / สมัครสมาชิก');
        btn.classList.remove('logged-in-user');
      }
    });
  }

  initLocalDatabase();
  syncWithServer();

  document.addEventListener('DOMContentLoaded', () => {
    syncHeaderStatus();
  });
  window.addEventListener('eggify:cart-updated', syncHeaderStatus);

  window.EggifyDB = {
    STORAGE_KEYS,
    INITIAL_PRODUCTS,
    INITIAL_ORDERS,
    INITIAL_USERS,
    isApiOnline: () => apiOnline,
    syncWithServer,
    getProducts,
    saveProducts,
    upsertProduct,
    deleteProduct,
    getCart,
    saveCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    calculateCartTotals,
    getOrders,
    saveOrders,
    createOrder,
    updateOrderStatus,
    getUsers,
    getCurrentUser,
    login,
    register,
    logout,
    resetDatabase,
    renderEggGraphic,
    syncHeaderStatus
  };
})(window);

