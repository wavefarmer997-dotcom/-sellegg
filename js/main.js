/**
 * EGGIFY – Fresh Egg Market | Main JavaScript
 * ผู้รับผิดชอบ: นาย A (หัวหน้าทีม / Main Web)
 * รองรับการเชื่อมต่อข้อมูล (Shared LocalStorage) กับ 5 Sub Web ของสมาชิกในทีม
 */

const DEFAULT_PRODUCTS = [
  {
    id: 'egg-01',
    name: 'ไข่ไก่สดออร์แกนิค (Free-Range) แพ็ก 10 ฟอง',
    category: 'organic',
    categoryLabel: 'ไข่ออร์แกนิค',
    badge: 'ขายดีอันดับ 1',
    meta: 'แม่ไก่เลี้ยงปล่อยอิสระ ปลอดยาปฏิชีวนะ 100%',
    price: 89,
    unit: 'แพ็ก 10 ฟอง',
    eggType: 'brown'
  },
  {
    id: 'egg-02',
    name: 'ไข่ไก่สดคัดพิเศษ เบอร์ 0 ยกแผง 30 ฟอง',
    category: 'chicken',
    categoryLabel: 'ไข่ไก่สด',
    badge: 'คุ้มค่า',
    meta: 'ฟองใหญ่พิเศษ ไข่แดงกลมโต เก็บใหม่จากฟาร์มทุกเช้า',
    price: 145,
    unit: 'แผง 30 ฟอง',
    eggType: 'brown'
  },
  {
    id: 'egg-03',
    name: 'ไข่เป็ดไล่ทุ่งสุพรรณบุรี แพ็ก 10 ฟอง',
    category: 'duck',
    categoryLabel: 'ไข่เป็ดสด',
    badge: 'ไข่แดงมันเยิ้ม',
    meta: 'เหมาะสำหรับทำไข่ดาวกรอบ ไข่ต้มยางมะตูม และขนมไทย',
    price: 75,
    unit: 'แพ็ก 10 ฟอง',
    eggType: 'white'
  },
  {
    id: 'egg-04',
    name: 'ไข่ไก่เสริม Omega-3 & Vitamin E แพ็ก 10 ฟอง',
    category: 'organic',
    categoryLabel: 'ไข่ออร์แกนิค',
    badge: 'เพื่อสุขภาพ',
    meta: 'โอเมก้า 3 สูงกว่าไข่ทั่วไป 3 เท่า บำรุงสมองและหัวใจ',
    price: 99,
    unit: 'แพ็ก 10 ฟอง',
    eggType: 'mixed'
  },
  {
    id: 'egg-05',
    name: 'ไข่เค็มไชยาพอกดินสอพอง สูตรดั้งเดิม 6 ฟอง',
    category: 'special',
    categoryLabel: 'ไข่แปรรูป',
    badge: 'OTOP คัดพิเศษ',
    meta: 'เค็มกำลังดี ไข่แดงแดงสดมันเยิ้ม ต้มหรือทอดก็อร่อย',
    price: 65,
    unit: 'กล่อง 6 ฟอง',
    eggType: 'white'
  },
  {
    id: 'egg-06',
    name: 'ชุดครอบครัวอิ่มคุ้ม Mixed Farm Pack (40 ฟอง)',
    category: 'special',
    categoryLabel: 'เซ็ตโปรโมชั่น',
    badge: 'ลดพิเศษ 15%',
    meta: 'ไข่ไก่เบอร์ 0 (30 ฟอง) + ไข่ออร์แกนิค (10 ฟอง) ส่งฟรี!',
    price: 215,
    unit: 'เซ็ต 40 ฟอง',
    eggType: 'mixed'
  }
];

// เตรียมข้อมูลลง LocalStorage เพื่อให้หน้า Sub Web อื่นๆ (เช่น สินค้า, ตะกร้า, Admin) ดึงไปใช้ต่อได้ทันที
function initSharedStore() {
  if (!localStorage.getItem('eggify_products')) {
    localStorage.setItem('eggify_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('eggify_cart')) {
    localStorage.setItem('eggify_cart', JSON.stringify([]));
  }
}

function mapAdminProduct(p) {
  const catMap = {
    'ไข่ไก่': 'chicken',
    'ไข่เป็ด': 'duck',
    'ไข่นกกระทา': 'special',
    'อื่น ๆ': 'special'
  };
  return {
    id: `admin-${p.id}`,
    name: p.name,
    category: catMap[p.category] || 'special',
    categoryLabel: p.category || 'สินค้าทั่วไป',
    badge: `คงเหลือ ${p.stock} ชิ้น`,
    meta: p.description || 'สินค้าคัดพิเศษจากระบบหลังบ้าน EGGIFY Admin',
    price: Number(p.price) || 0,
    unit: 'รายการ',
    eggType: p.category === 'ไข่เป็ด' ? 'white' : p.category === 'ไข่นกกระทา' ? 'mixed' : 'brown'
  };
}

function getProducts() {
  let base = DEFAULT_PRODUCTS;
  try {
    base = JSON.parse(localStorage.getItem('eggify_products')) || DEFAULT_PRODUCTS;
  } catch {
    base = DEFAULT_PRODUCTS;
  }

  try {
    const adminRaw = localStorage.getItem('eggify_admin_products');
    if (adminRaw) {
      const adminList = JSON.parse(adminRaw);
      if (Array.isArray(adminList)) {
        const customAdminItems = adminList
          .filter((p) => Number(p.id) > 3)
          .map(mapAdminProduct);
        return [...base, ...customAdminItems];
      }
    }
  } catch {
    // fallback to base products
  }
  return base;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('eggify_cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('eggify_cart', JSON.stringify(cart));
  updateCartUI();
}

// สร้างกราฟิกไข่จำลองสำหรับแต่ละการ์ดสินค้า
function renderEggThumbGraphic(type) {
  if (type === 'white') {
    return `
      <div class="mini-egg-pack" style="background:#E6DEC8;border-color:#CFC4A9;">
        <div class="mini-egg egg-white"></div>
        <div class="mini-egg egg-white"></div>
        <div class="mini-egg egg-white"></div>
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

// แสดงรายการสินค้าบนหน้าหลัก
function renderProducts(filterCategory = 'all', searchKeyword = '') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const products = getProducts();
  const allCountBtn = document.querySelector('.cat-pill[data-cat="all"]');
  if (allCountBtn) {
    allCountBtn.textContent = `ทั้งหมด (${products.length})`;
  }
  const filtered = products.filter((item) => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch =
      !searchKeyword ||
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.meta.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 24px;">
        <p style="font-size: 1.1rem; font-weight: 600;">ไม่พบสินค้าที่ค้นหา</p>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">ลองเลือกหมวดหมู่อื่น หรือล้างคำค้นหา</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
      <article class="product-card" data-category="${item.category}">
        <div class="product-thumb">
          <span class="product-badge">${item.badge}</span>
          ${renderEggThumbGraphic(item.eggType)}
        </div>
        <div>
          <span class="product-cat">${item.categoryLabel} • ${item.unit}</span>
          <h3 class="product-name">${item.name}</h3>
          <p class="product-meta">${item.meta}</p>
        </div>
        <div class="product-bottom">
          <div>
            <span class="product-price">฿${item.price}</span>
            <span class="price-unit">/ ${item.unit}</span>
          </div>
          <button type="button" class="btn-add-cart" onclick="addToCart('${item.id}')">
            <span>+ ใส่ตะกร้า</span>
          </button>
        </div>
      </article>
    `
    )
    .join('');
}

// ระบบตะกร้าสินค้า
function addToCart(productId) {
  const products = getProducts();
  const target = products.find((p) => p.id === productId);
  if (!target) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: target.id,
      name: target.name,
      price: target.price,
      unit: target.unit,
      qty: 1
    });
  }

  saveCart(cart);
  showToast(`เพิ่ม "${target.name}" ลงตะกร้าแล้ว`);
}

function changeCartQty(productId, delta) {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }
  saveCart(cart);
}

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    badge.textContent = totalCount;
  }

  const cartList = document.getElementById('cartItemsContainer');
  const cartTotalEl = document.getElementById('cartTotalPrice');
  if (!cartList || !cartTotalEl) return;

  cartTotalEl.textContent = `฿${totalPrice.toLocaleString()}`;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center; padding: 48px 16px; color: var(--text-secondary);">
        <p style="font-weight:600; font-size:1rem;">ตะกร้าสินค้ายังว่างอยู่</p>
        <p style="font-size:0.85rem; margin-top:4px;">เลือกซื้อไข่สดใหม่จากหน้าเว็บได้เลย!</p>
      </div>
    `;
    return;
  }

  cartList.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <div style="font-weight:600; font-size:0.9rem;">${item.name}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">฿${item.price} / ${item.unit}</div>
        </div>
        <div class="cart-qty-controls">
          <button type="button" class="qty-btn" onclick="changeCartQty('${item.id}', -1)" aria-label="ลดจำนวน">-</button>
          <span style="font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="changeCartQty('${item.id}', 1)" aria-label="เพิ่มจำนวน">+</button>
        </div>
      </div>
    `
    )
    .join('');
}

// เปิด-ปิด ตะกร้าสินค้า
function toggleCartDrawer(forceOpen) {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer || !backdrop) return;

  const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  backdrop.classList.toggle('open', isOpen);
}

// ระบบคัดลอกโค้ดส่วนลดโปรโมชั่น
function copyPromoCode(code, btnElement) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  localStorage.setItem('eggify_active_coupon', code);
  showToast(`คัดลอกโค้ดส่วนลด "${code}" เรียบร้อยแล้ว!`);

  if (btnElement) {
    const originalText = btnElement.textContent;
    btnElement.textContent = 'คัดลอกแล้ว ✓';
    btnElement.classList.add('copied');
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.classList.remove('copied');
    }, 2000);
  }
}

// แจ้งเตือน Toast
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// นับเวลาถอยหลังโปรโมชั่น Flash Sale
function startPromoCountdown() {
  const hoursEl = document.getElementById('timerHours');
  const minsEl = document.getElementById('timerMinutes');
  const secsEl = document.getElementById('timerSeconds');
  if (!hoursEl || !minsEl || !secsEl) return;

  let remainingSeconds = 5 * 3600 + 42 * 60 + 18;
  setInterval(() => {
    remainingSeconds = remainingSeconds > 0 ? remainingSeconds - 1 : 6 * 3600;
    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;

    hoursEl.textContent = String(hrs).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }, 1000);
}

// เริ่มต้นการทำงานเมื่อโหลดหน้าเว็บเสร็จ
document.addEventListener('DOMContentLoaded', () => {
  initSharedStore();
  renderProducts('all');
  updateCartUI();
  startPromoCountdown();

  // ปุ่มกรองหมวดหมู่สินค้า
  const catButtons = document.querySelectorAll('.cat-pill');
  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      catButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedCat = btn.getAttribute('data-cat') || 'all';
      const searchInput = document.getElementById('quickSearchInput');
      renderProducts(selectedCat, searchInput ? searchInput.value : '');
    });
  });

  // ช่องค้นหาสินค้าด่วน
  const searchInput = document.getElementById('quickSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeCatBtn = document.querySelector('.cat-pill.active');
      const selectedCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';
      renderProducts(selectedCat, e.target.value);
    });
  }

  // ปุ่มค้นหาบน Navbar (เลื่อนลงไปที่ช่องค้นหาพร้อมโฟกัส)
  const searchTriggerBtn = document.getElementById('navSearchBtn');
  if (searchTriggerBtn && searchInput) {
    searchTriggerBtn.addEventListener('click', () => {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInput.focus(), 400);
    });
  }

  // ปุ่มเมนูมือถือ
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }
});

