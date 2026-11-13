/**
 * EGGIFY – Product Web JavaScript (js/products.js)
 * ผู้รับผิดชอบ: นาย B (ระบบสินค้า - แสดงไข่ไก่ ไข่เป็ด ไข่นกกระทา, ดูรายละเอียดสินค้า, ค้นหาและกรองหมวดหมู่)
 */

let activeCategory = 'all';
let modalSelectedQty = 1;

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function copyCouponOnProducts(code, btn) {
  if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
  localStorage.setItem('eggify_active_coupon', code);
  showToast(`คัดลอกโค้ดส่วนลด "${code}" แล้ว!`);
  if (btn) {
    const old = btn.textContent;
    btn.textContent = 'คัดลอกแล้ว ✓';
    setTimeout(() => (btn.textContent = old), 1800);
  }
}

function updateCategoryCounts() {
  const products = window.EggifyDB.getProducts();
  const heroTotal = document.getElementById('heroTotalProducts');
  if (heroTotal) heroTotal.textContent = `${products.length} รายการ`;

  const counts = {
    all: products.length,
    'ไข่ไก่': products.filter(p => p.category === 'ไข่ไก่' || p.categoryKey === 'chicken').length,
    'ไข่เป็ด': products.filter(p => p.category === 'ไข่เป็ด' || p.categoryKey === 'duck').length,
    'ไข่นกกระทา': products.filter(p => p.category === 'ไข่นกกระทา' || p.categoryKey === 'quail').length,
    'เซ็ตสุดคุ้ม': products.filter(p => p.category === 'เซ็ตสุดคุ้ม' || p.categoryKey === 'special').length
  };

  document.querySelectorAll('#categoryFilterBar .cat-pill').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    const icon = cat === 'ไข่ไก่' ? '🥚 ' : cat === 'ไข่เป็ด' ? '🦆 ' : cat === 'ไข่นกกระทา' ? '🐣 ' : cat === 'เซ็ตสุดคุ้ม' ? '🎁 ' : '';
    const label = cat === 'all' ? 'ทั้งหมด' : cat;
    if (counts[cat] !== undefined) {
      btn.textContent = `${icon}${label} (${counts[cat]})`;
    }
  });
}

function renderCatalog() {
  const grid = document.getElementById('catalogProductGrid');
  const searchInput = document.getElementById('catalogSearchInput');
  const sortSelect = document.getElementById('catalogSortSelect');
  const resultLabel = document.getElementById('catalogResultLabel');
  if (!grid || !window.EggifyDB) return;

  updateCategoryCounts();

  const keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const sortBy = sortSelect ? sortSelect.value : 'default';

  let list = window.EggifyDB.getProducts().filter(item => {
    const matchCat =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      item.categoryKey === activeCategory;
    const matchKeyword =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword) ||
      (item.description && item.description.toLowerCase().includes(keyword));
    return matchCat && matchKeyword;
  });

  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'stock-desc') {
    list.sort((a, b) => b.stock - a.stock);
  }

  if (resultLabel) {
    resultLabel.textContent = `แสดงสินค้า ${list.length} รายการ ${activeCategory !== 'all' ? `ในหมวดหมู่ "${activeCategory}"` : '(ทุกหมวดหมู่)'}`;
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 56px 20px; background: #fff; border-radius: 24px; border: 1px dashed var(--border-subtle);">
        <p style="font-size: 1.15rem; font-weight: 700;">ไม่พบรายการไข่ที่ค้นหา</p>
        <p style="color: var(--text-secondary); font-size: 0.92rem; margin-top: 6px;">ลองเปลี่ยนคำค้นหา หรือกดเลือกหมวดหมู่ "ทั้งหมด"</p>
        <button type="button" class="btn-sage-pill" style="margin-top:16px;" onclick="resetCatalogFilters()">แสดงสินค้าทั้งหมด</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list
    .map(item => {
      const stock = Number(item.stock ?? 0);
      const stockClass = stock <= 0 ? 'out' : stock <= 5 ? 'low' : '';
      const stockLabel = stock <= 0 ? 'สินค้าหมด' : stock <= 5 ? `ใกล้หมด (${stock})` : `พร้อมส่ง (${stock})`;
      return `
      <article class="product-card">
        <div class="product-thumb" onclick="openCatalogModal('${item.id}')" style="cursor:pointer;" title="คลิกเพื่อดูรายละเอียดสินค้า">
          <span class="product-badge">${item.badge}</span>
          ${window.EggifyDB.renderEggGraphic(item.eggType)}
        </div>
        <div>
          <span class="product-cat">${item.category} • ${item.unit}</span>
          <h3 class="product-name">${item.name}</h3>
          <p class="product-meta">${item.description}</p>
        </div>
        <div class="product-bottom">
          <div class="product-price-row">
            <div>
              <span class="product-price">฿${item.price}</span>
              <span class="price-unit">/ ${item.unit}</span>
            </div>
            <span class="stock-pill ${stockClass}">${stockLabel}</span>
          </div>
          <div class="product-action-row">
            <button type="button" class="btn-detail-view" onclick="openCatalogModal('${item.id}')">
              🔍 ดูรายละเอียด
            </button>
            <button type="button" class="btn-add-cart" ${stock <= 0 ? 'disabled' : ''} onclick="handleAddToCart('${item.id}', 1)">
              <span>${stock <= 0 ? 'สินค้าหมด' : '+ ใส่ตะกร้า'}</span>
            </button>
          </div>
        </div>
      </article>
    `;
    })
    .join('');
}

function resetCatalogFilters() {
  activeCategory = 'all';
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('#categoryFilterBar .cat-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === 'all');
  });
  renderCatalog();
}

function handleAddToCart(productId, qty = 1) {
  const added = window.EggifyDB.addToCart(productId, qty);
  if (added) {
    window.EggifyDB.syncHeaderStatus();
    showToast(`เพิ่ม "${added.name}" (${qty} ชิ้น) ลงตะกร้าแล้ว!`);
  }
}

function changeModalQty(delta) {
  modalSelectedQty = Math.max(1, modalSelectedQty + delta);
  const el = document.getElementById('modalQtyValue');
  if (el) el.textContent = modalSelectedQty;
}

function openCatalogModal(productId) {
  const modal = document.getElementById('productDetailModal');
  const visualEl = document.getElementById('catalogModalVisual');
  const infoEl = document.getElementById('catalogModalInfo');
  if (!modal || !visualEl || !infoEl) return;

  const product = window.EggifyDB.getProducts().find(p => String(p.id) === String(productId));
  if (!product) return;

  modalSelectedQty = 1;

  visualEl.innerHTML = `
    <span class="badge-fresh" style="background:#FFF;color:var(--brand-orange);">${product.badge}</span>
    <div style="transform:scale(1.35);margin:20px 0;">
      ${window.EggifyDB.renderEggGraphic(product.eggType)}
    </div>
    <span style="font-size:0.82rem;color:var(--text-primary);font-weight:600;">📍 ${product.farmOrigin}</span>
  `;

  infoEl.innerHTML = `
    <div>
      <span class="section-eyebrow">${product.category} • รหัสสินค้า ${product.code.toUpperCase()}</span>
      <h2 id="catalogModalTitle" style="font-size:1.38rem;font-weight:700;line-height:1.3;margin-top:4px;">${product.name}</h2>
    </div>
    <p style="font-size:0.92rem;color:var(--text-secondary);">${product.description}</p>
    <div class="spec-grid">
      <div class="spec-box">
        <small>น้ำหนักต่อฟอง</small>
        <strong>${product.weight}</strong>
      </div>
      <div class="spec-box">
        <small>หน่วยบรรจุ</small>
        <strong>${product.unit}</strong>
      </div>
      <div class="spec-box" style="grid-column: 1 / -1;">
        <small>ข้อมูลโภชนาการและมาตรฐานฟาร์ม</small>
        <strong>${product.nutrition}</strong>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:1px solid var(--border-subtle);margin-top:auto;flex-wrap:wrap;">
      <div>
        <span style="font-size:1.6rem;font-weight:800;color:var(--brand-orange);">฿${product.price}</span>
        <span class="price-unit">/ ${product.unit}</span>
        <div style="font-size:0.78rem;color:var(--brand-green);font-weight:600;">คงเหลือในคลัง ${product.stock} ชิ้น</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="qty-pill-group">
          <button type="button" class="qty-btn" onclick="changeModalQty(-1)" aria-label="ลดจำนวน">-</button>
          <span id="modalQtyValue" style="font-weight:700;min-width:22px;text-align:center;">1</span>
          <button type="button" class="qty-btn" onclick="changeModalQty(1)" aria-label="เพิ่มจำนวน">+</button>
        </div>
        <button type="button" class="btn-add-cart" style="padding:10px 20px;" onclick="handleAddToCart('${product.id}', modalSelectedQty); closeCatalogModal();">
          + ใส่ตะกร้า
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeCatalogModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    activeCategory = catParam;
    document.querySelectorAll('#categoryFilterBar .cat-pill').forEach(btn => {
      const btnCat = btn.getAttribute('data-cat');
      const isMatch =
        btnCat === catParam ||
        (catParam === 'chicken' && btnCat === 'ไข่ไก่') ||
        (catParam === 'duck' && btnCat === 'ไข่เป็ด') ||
        (catParam === 'quail' && btnCat === 'ไข่นกกระทา') ||
        (catParam === 'special' && btnCat === 'เซ็ตสุดคุ้ม');
      if (isMatch) {
        activeCategory = btnCat;
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  renderCatalog();

  window.addEventListener('eggify:synced', renderCatalog);

  document.querySelectorAll('#categoryFilterBar .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryFilterBar .cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat') || 'all';
      renderCatalog();
    });
  });

  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderCatalog);
  }

  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', renderCatalog);
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
  }
});

