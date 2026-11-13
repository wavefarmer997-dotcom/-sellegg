/**
 * EGGIFY – Cart Web JavaScript (js/cart.js)
 * ผู้รับผิดชอบ: นาย C (ระบบตะกร้าสินค้า - เพิ่มสินค้า, เพิ่ม/ลดจำนวน, ลบสินค้า, คำนวณยอดรวมอัตโนมัติ)
 */

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function renderCartPage() {
  if (!window.EggifyDB) return;
  const couponInput = document.getElementById('couponInput');
  const savedCoupon = localStorage.getItem('eggify_active_coupon') || '';
  if (couponInput && !couponInput.value && savedCoupon) {
    couponInput.value = savedCoupon;
  }

  const {
    cart,
    totalCount,
    subtotal,
    discount,
    shipping,
    total,
    couponDescription
  } = window.EggifyDB.calculateCartTotals(couponInput ? couponInput.value : savedCoupon);

  window.EggifyDB.syncHeaderStatus();

  const countLabel = document.getElementById('cartItemCountLabel');
  if (countLabel) countLabel.textContent = totalCount;

  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) clearBtn.style.display = cart.length > 0 ? 'inline-flex' : 'none';

  // อัปเดตแถบส่งฟรี
  const pct = Math.min(100, Math.round((subtotal / 299) * 100));
  const progEl = document.getElementById('freeShipProgress');
  const pctEl = document.getElementById('freeShipPercent');
  const statusEl = document.getElementById('freeShipStatusText');
  if (progEl) progEl.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (statusEl) {
    statusEl.innerHTML =
      subtotal >= 299
        ? '🎉 ยินดีด้วย! คุณได้รับสิทธิ์ <strong>จัดส่งด่วนฟรี ฿0</strong> เรียบร้อยแล้ว'
        : `🚚 เลือกซื้อเพิ่มอีกเพียง <strong>฿${(299 - subtotal).toLocaleString()}</strong> เพื่อรับสิทธิ์ส่งด่วนฟรี!`;
  }

  // แสดงรายการในตะกร้า
  const container = document.getElementById('cartPageItemsContainer');
  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;border:1px dashed var(--border-subtle);border-radius:18px;background:var(--bg-page);">
          <div style="font-size:3rem;margin-bottom:8px;">🛒</div>
          <h3 style="font-size:1.15rem;font-weight:700;">ยังไม่มีสินค้าในตะกร้าของคุณ</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px;">กดเลือกสินค้าจากด้านล่าง หรือไปที่หน้าสินค้าทั้งหมดเพื่อเลือกไข่สดเข้าตะกร้า</p>
          <a href="products.html" class="btn-sage-pill" style="margin-top:16px;">เลือกซื้อไข่สดเลย →</a>
        </div>
      `;
    } else {
      container.innerHTML = cart
        .map(
          item => `
          <div class="cart-table-row">
            <div class="cart-thumb-mini">
              ${window.EggifyDB.renderEggGraphic(item.eggType || 'brown')}
            </div>
            <div>
              <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">${item.category || 'ไข่สดคัดพิเศษ'}</span>
              <h3 style="font-size:1rem;font-weight:700;line-height:1.3;">${item.name}</h3>
              <span style="font-size:0.84rem;color:var(--text-secondary);">ราคาต่อหน่วย: ฿${item.price} / ${item.unit || 'แพ็ก'}</span>
            </div>
            <div>
              <div class="qty-pill-group">
                <button type="button" class="qty-btn" onclick="handleStepQty('${item.id}', -1)" aria-label="ลดจำนวน">−</button>
                <span style="font-weight:700;min-width:26px;text-align:center;">${item.qty}</span>
                <button type="button" class="qty-btn" onclick="handleStepQty('${item.id}', 1)" aria-label="เพิ่มจำนวน">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <strong style="font-size:1.08rem;color:var(--brand-orange);">฿${(item.price * item.qty).toLocaleString()}</strong>
            </div>
            <div style="text-align:right;">
              <button type="button" class="btn-remove-item" onclick="handleRemoveItem('${item.id}')">
                ลบ
              </button>
            </div>
          </div>
        `
        )
        .join('');
    }
  }

  // สรุปยอดคำนวณราคาอัตโนมัติ
  document.getElementById('sumTotalQty').textContent = `${totalCount} ชิ้น`;
  document.getElementById('sumSubtotal').textContent = `฿${subtotal.toLocaleString()}`;
  document.getElementById('sumDiscount').textContent = `-฿${discount.toLocaleString()}`;
  document.getElementById('sumShipping').textContent = shipping === 0 && subtotal > 0 ? 'ฟรี (฿0)' : `฿${shipping.toLocaleString()}`;
  document.getElementById('sumGrandTotal').textContent = `฿${total.toLocaleString()}`;

  const feedbackEl = document.getElementById('couponFeedback');
  if (feedbackEl) {
    feedbackEl.textContent = couponDescription ? `✓ ใช้คูปอง: ${couponDescription}` : '';
  }
}

function renderQuickAddProducts() {
  const grid = document.getElementById('quickAddGrid');
  if (!grid || !window.EggifyDB) return;

  const picks = window.EggifyDB.getProducts().slice(0, 3);
  grid.innerHTML = picks
    .map(
      p => `
      <article class="product-card" style="padding:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <span class="bento-tag">${p.category}</span>
          <strong style="color:var(--brand-orange);">฿${p.price}</strong>
        </div>
        <h4 style="font-size:0.95rem;font-weight:700;line-height:1.3;">${p.name}</h4>
        <button type="button" class="btn-add-cart" style="justify-content:center;width:100%;margin-top:auto;" onclick="handleQuickAdd('${p.id}')">
          + เพิ่มลงตะกร้า
        </button>
      </article>
    `
    )
    .join('');
}

function handleQuickAdd(productId) {
  const added = window.EggifyDB.addToCart(productId, 1);
  if (added) {
    renderCartPage();
    showToast(`เพิ่ม "${added.name}" ลงตะกร้าแล้ว`);
  }
}

function handleStepQty(productId, delta) {
  window.EggifyDB.updateCartQty(productId, delta);
  renderCartPage();
}

function handleRemoveItem(productId) {
  window.EggifyDB.removeFromCart(productId);
  renderCartPage();
  showToast('ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว');
}

function handleClearCart() {
  window.EggifyDB.clearCart();
  renderCartPage();
  showToast('ล้างตะกร้าสินค้าทั้งหมดเรียบร้อยแล้ว');
}

function applyCouponCode() {
  const input = document.getElementById('couponInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (!code) {
    localStorage.removeItem('eggify_active_coupon');
    renderCartPage();
    showToast('ยกเลิกการใช้คูปองแล้ว');
    return;
  }
  localStorage.setItem('eggify_active_coupon', code);
  renderCartPage();
  showToast(`อัปเดตคูปอง "${code}" เรียบร้อยแล้ว`);
}

function quickSelectCoupon(code) {
  const input = document.getElementById('couponInput');
  if (input) input.value = code;
  localStorage.setItem('eggify_active_coupon', code);
  renderCartPage();
  showToast(`เลือกใช้คูปอง "${code}" แล้ว`);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  renderQuickAddProducts();

  window.addEventListener('eggify:synced', () => {
    renderCartPage();
    renderQuickAddProducts();
  });

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
  }
});

