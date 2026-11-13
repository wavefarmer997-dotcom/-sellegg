/**
 * EGGIFY – Fresh Egg Market | Main JavaScript (js/main.js)
 * ผู้รับผิดชอบ: นาย A (หัวหน้าทีม / Main Web)
 * เชื่อมต่อฐานข้อมูลกลาง EggifyDB (SQLite API + LocalStorage) ร่วมกับสมาชิก B, C, D, E
 */

function renderProducts(filterCategory = 'all', searchKeyword = '') {
  const grid = document.getElementById('productGrid');
  if (!grid || !window.EggifyDB) return;

  const products = window.EggifyDB.getProducts();
  const allCountBtn = document.querySelector('.cat-pill[data-cat="all"]');
  if (allCountBtn) {
    allCountBtn.textContent = `ทั้งหมด (${products.length})`;
  }

  const kw = searchKeyword.trim().toLowerCase();
  const filtered = products.filter((item) => {
    const matchCat =
      filterCategory === 'all' ||
      item.categoryKey === filterCategory ||
      item.category === filterCategory;
    const matchSearch =
      !kw ||
      item.name.toLowerCase().includes(kw) ||
      item.category.toLowerCase().includes(kw) ||
      (item.description && item.description.toLowerCase().includes(kw));
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
      <article class="product-card" data-category="${item.categoryKey}">
        <div class="product-thumb" onclick="openProductDetail('${item.id}')" style="cursor:pointer;" title="คลิกเพื่อดูรายละเอียดสินค้า">
          <span class="product-badge">${item.badge}</span>
          ${window.EggifyDB.renderEggGraphic(item.eggType)}
        </div>
        <div>
          <span class="product-cat">${item.category} • ${item.unit} (คงเหลือ ${item.stock})</span>
          <h3 class="product-name">${item.name}</h3>
          <p class="product-meta">${item.description}</p>
        </div>
        <div class="product-bottom">
          <div>
            <span class="product-price">฿${item.price}</span>
            <span class="price-unit">/ ${item.unit}</span>
          </div>
          <div class="product-action-row">
            <button type="button" class="btn-detail-view" onclick="openProductDetail('${item.id}')">
              ดูรายละเอียด
            </button>
            <button type="button" class="btn-add-cart" onclick="addToCart('${item.id}')">
              <span>+ ใส่ตะกร้า</span>
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

function openProductDetail(productRef) {
  const modal = document.getElementById('productDetailModal');
  const visualEl = document.getElementById('detailModalVisual');
  const infoEl = document.getElementById('detailModalInfo');
  if (!modal || !visualEl || !infoEl || !window.EggifyDB) return;

  const product = window.EggifyDB.getProducts().find(
    (p) => String(p.id) === String(productRef) || String(p.code) === String(productRef)
  );
  if (!product) return;

  visualEl.innerHTML = `
    <span class="badge-fresh" style="background:#FFF;color:var(--brand-orange);">${product.badge}</span>
    <div style="transform:scale(1.32);margin:18px 0;">
      ${window.EggifyDB.renderEggGraphic(product.eggType)}
    </div>
    <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;">📍 ${product.farmOrigin}</span>
  `;

  infoEl.innerHTML = `
    <div>
      <span class="section-eyebrow">${product.category} • รหัส ${product.code.toUpperCase()}</span>
      <h2 id="detailModalTitle" style="font-size:1.38rem;font-weight:700;line-height:1.3;margin-top:4px;">${product.name}</h2>
    </div>
    <p style="font-size:0.92rem;color:var(--text-secondary);">${product.description}</p>
    <div class="spec-grid">
      <div class="spec-box">
        <small>ขนาด / น้ำหนัก</small>
        <strong>${product.weight}</strong>
      </div>
      <div class="spec-box">
        <small>ขนาดบรรจุ</small>
        <strong>${product.unit}</strong>
      </div>
      <div class="spec-box" style="grid-column:1 / -1;">
        <small>คุณค่าทางโภชนาการ & มาตรฐาน</small>
        <strong>${product.nutrition}</strong>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border-subtle);margin-top:auto;">
      <div>
        <span style="font-size:1.6rem;font-weight:800;color:var(--brand-orange);">฿${product.price}</span>
        <span class="price-unit">/ ${product.unit}</span>
        <div style="font-size:0.78rem;color:var(--brand-green);font-weight:600;">มีสินค้าพร้อมส่ง (${product.stock} ชิ้น)</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button type="button" class="btn-add-cart" style="padding:11px 22px;font-size:0.92rem;" onclick="addToCart('${product.id}'); closeProductDetail();">
          + หยิบใส่ตะกร้าทันที
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeProductDetail() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.remove('open');
}

function addToCart(productRef, qty = 1) {
  if (!window.EggifyDB) return;
  const added = window.EggifyDB.addToCart(productRef, qty);
  if (added) {
    updateCartUI();
    showToast(`เพิ่ม "${added.name}" ลงตะกร้าแล้ว`);
  }
}

function changeCartQty(productRef, delta) {
  if (!window.EggifyDB) return;
  window.EggifyDB.updateCartQty(productRef, delta);
  updateCartUI();
}

function updateCartUI() {
  if (!window.EggifyDB) return;
  const { cart, totalCount, subtotal } = window.EggifyDB.calculateCartTotals();

  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    badge.textContent = totalCount;
  }

  const cartList = document.getElementById('cartItemsContainer');
  const cartTotalEl = document.getElementById('cartTotalPrice');
  if (!cartList || !cartTotalEl) return;

  cartTotalEl.textContent = `฿${subtotal.toLocaleString()}`;

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

function toggleCartDrawer(forceOpen) {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer || !backdrop) return;

  const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  backdrop.classList.toggle('open', isOpen);
}

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

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  updateCartUI();
  startPromoCountdown();

  window.addEventListener('eggify:synced', () => {
    const activeCatBtn = document.querySelector('.cat-pill.active');
    const selectedCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';
    const searchInput = document.getElementById('quickSearchInput');
    renderProducts(selectedCat, searchInput ? searchInput.value : '');
    updateCartUI();
  });

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

  const searchInput = document.getElementById('quickSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeCatBtn = document.querySelector('.cat-pill.active');
      const selectedCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';
      renderProducts(selectedCat, e.target.value);
    });
  }

  const searchTriggerBtn = document.getElementById('navSearchBtn');
  if (searchTriggerBtn && searchInput) {
    searchTriggerBtn.addEventListener('click', () => {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInput.focus(), 400);
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }
});
