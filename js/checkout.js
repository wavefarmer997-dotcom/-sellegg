/**
 * EGGIFY – Checkout Web JavaScript (js/checkout.js)
 * ผู้รับผิดชอบ: นาย D (ระบบสั่งซื้อ - แบบฟอร์มชื่อและเบอร์โทร, ที่อยู่จัดส่ง, เลือกวิธีชำระเงิน, สรุปรายการสั่งซื้อ)
 */

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function prefillFromLoggedInUser() {
  if (!window.EggifyDB) return;
  const user = window.EggifyDB.getCurrentUser();
  const banner = document.getElementById('checkoutUserBanner');
  if (user) {
    if (banner) {
      banner.innerHTML = `
        <div class="spec-box" style="background:#FFF;">
          <small>สั่งซื้อในชื่อสมาชิก</small>
          <strong style="color:var(--brand-green);">👤 ${user.name}</strong>
        </div>
      `;
    }
    const nameEl = document.getElementById('custName');
    const phoneEl = document.getElementById('custPhone');
    const emailEl = document.getElementById('custEmail');
    const addrEl = document.getElementById('custAddress');
    if (nameEl && !nameEl.value) nameEl.value = user.name || '';
    if (phoneEl && !phoneEl.value) phoneEl.value = user.phone || '';
    if (emailEl && !emailEl.value) emailEl.value = user.email || '';
    if (addrEl && !addrEl.value && user.address) {
      addrEl.value = user.address;
      document.getElementById('custDistrict').value = 'เขตคลองเตย';
      document.getElementById('custProvince').value = 'กรุงเทพมหานคร 10110';
    }
  } else if (banner) {
    banner.innerHTML = `
      <a href="login.html" class="btn-outline-pill">🔐 เข้าสู่ระบบเพื่อดึงที่อยู่อัตโนมัติ</a>
    `;
  }
}

function fillSampleCustomer() {
  document.getElementById('custName').value = 'คุณพิมพ์ชนก รักสุขภาพ';
  document.getElementById('custPhone').value = '089-999-8888';
  document.getElementById('custEmail').value = 'pimchanok@eggify.com';
  document.getElementById('custAddress').value = '128/45 หมู่บ้านกรีนการ์เด้น ถนนพระราม 9';
  document.getElementById('custDistrict').value = 'แขวงห้วยขวาง เขตห้วยขวาง';
  document.getElementById('custProvince').value = 'กรุงเทพมหานคร 10310';
  document.getElementById('custNote').value = 'วางไว้ที่โต๊ะรับพัสดุหน้าบ้านได้เลยค่ะ';
  showToast('กรอกข้อมูลลูกค้าตัวอย่างเรียบร้อยแล้ว!');
}

function addSampleBundleForCheckout() {
  window.EggifyDB.addToCart(2, 1); // ไข่ไก่เบอร์ 0 ยกแผง
  window.EggifyDB.addToCart(5, 1); // ไข่เป็ดไล่ทุ่ง
  window.EggifyDB.addToCart(8, 1); // ไข่นกกระทา
  renderCheckoutSummary();
  showToast('เพิ่มชุดสินค้าตัวอย่างลงในรายการสั่งซื้อแล้ว!');
}

function renderPaymentInstruction(method, totalAmount) {
  const box = document.getElementById('paymentInstructionBox');
  if (!box) return;

  if (method === 'QR PromptPay') {
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
        <div style="width:92px;height:92px;background:#FFF;border:2px solid #2B1E16;border-radius:12px;display:grid;place-items:center;padding:8px;flex-shrink:0;">
          <svg viewBox="0 0 64 64" width="72" height="72" fill="#2B1E16">
            <rect x="4" y="4" width="20" height="20" rx="2"/><rect x="8" y="8" width="12" height="12" fill="#FFF"/><rect x="11" y="11" width="6" height="6"/>
            <rect x="40" y="4" width="20" height="20" rx="2"/><rect x="44" y="8" width="12" height="12" fill="#FFF"/><rect x="47" y="11" width="6" height="6"/>
            <rect x="4" y="40" width="20" height="20" rx="2"/><rect x="8" y="44" width="12" height="12" fill="#FFF"/><rect x="11" y="47" width="6" height="6"/>
            <rect x="28" y="8" width="6" height="6"/><rect x="28" y="20" width="6" height="12"/><rect x="12" y="28" width="12" height="6"/>
            <rect x="36" y="28" width="14" height="6"/><rect x="28" y="40" width="10" height="6"/><rect x="44" y="40" width="8" height="16"/><rect x="28" y="52" width="12" height="8"/>
          </svg>
        </div>
        <div>
          <span class="bento-tag" style="background:#FFF;color:var(--brand-green);">THAI QR PROMPTPAY</span>
          <h4 style="font-size:1rem;font-weight:700;margin-top:6px;">สแกนจ่ายยอด ฿${totalAmount.toLocaleString()} (บจก. เอ้กอิฟาย มาร์เก็ต)</h4>
          <p style="font-size:0.84rem;color:var(--text-secondary);">สแกนด้วยแอปธนาคารใดก็ได้ ระบบตรวจสอบยอดอัตโนมัติทันทีที่กดยืนยันคำสั่งซื้อ</p>
        </div>
      </div>
    `;
  } else if (method === 'โอนเงินผ่านธนาคาร') {
    box.innerHTML = `
      <div>
        <strong style="font-size:0.95rem;">🏦 ธนาคารกสิกรไทย (KBank) • สาขานครปฐม</strong>
        <p style="font-size:0.9rem;margin-top:4px;">เลขที่บัญชี: <strong>123-4-56789-0</strong> (ชื่อบัญชี: บจก. เอ้กอิฟาย ฟาร์ม)</p>
        <small style="color:var(--text-secondary);">ยอดโอนสุทธิ: ฿${totalAmount.toLocaleString()}</small>
      </div>
    `;
  } else if (method === 'บัตรเครดิต / เดบิต') {
    box.innerHTML = `
      <div class="form-grid-2" style="margin-top:4px;">
        <div>
          <label style="font-size:0.78rem;font-weight:600;">หมายเลขบัตร 16 หลัก</label>
          <input type="text" class="form-control" value="4532 •••• •••• 8899" readonly style="margin-top:4px;background:#FFF;" />
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:600;">วันหมดอายุ / CVV</label>
          <input type="text" class="form-control" value="12/29 • CVV 888" readonly style="margin-top:4px;background:#FFF;" />
        </div>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div>
        <strong style="font-size:0.95rem;">🚚 ชำระเงินสดหรือสแกนจ่ายกับพนักงานเมื่อได้รับไข่สดหน้าบ้าน</strong>
        <p style="font-size:0.84rem;color:var(--text-secondary);margin-top:4px;">คุณสามารถตรวจเช็คสภาพแผงไข่ก่อนชำระเงินได้ 100% ยอดชำระปลายทาง: <strong>฿${totalAmount.toLocaleString()}</strong></p>
      </div>
    `;
  }
}

function renderCheckoutSummary() {
  if (!window.EggifyDB) return;
  const { cart, subtotal, discount, shipping, total } = window.EggifyDB.calculateCartTotals();
  window.EggifyDB.syncHeaderStatus();

  const listEl = document.getElementById('checkoutItemsList');
  if (listEl) {
    if (cart.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px 14px;background:var(--bg-page);border-radius:16px;border:1px dashed var(--border-subtle);">
          <p style="font-weight:600;font-size:0.92rem;">ยังไม่มีสินค้าในรายการสั่งซื้อ</p>
          <button type="button" class="btn-detail-view" style="margin-top:10px;" onclick="addSampleBundleForCheckout()">
            + เพิ่มชุดไข่ตัวอย่างเพื่อทดสอบสั่งซื้อ
          </button>
        </div>
      `;
    } else {
      listEl.innerHTML = cart
        .map(
          item => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-page);border-radius:12px;">
            <div>
              <div style="font-weight:600;font-size:0.88rem;line-height:1.3;">${item.name}</div>
              <small style="color:var(--text-secondary);">จำนวน ${item.qty} × ฿${item.price}</small>
            </div>
            <strong style="color:var(--text-primary);font-size:0.92rem;">฿${(item.price * item.qty).toLocaleString()}</strong>
          </div>
        `
        )
        .join('');
    }
  }

  document.getElementById('chkSubtotal').textContent = `฿${subtotal.toLocaleString()}`;
  document.getElementById('chkDiscount').textContent = `-฿${discount.toLocaleString()}`;
  document.getElementById('chkShipping').textContent = shipping === 0 && subtotal > 0 ? 'ฟรี (฿0)' : `฿${shipping.toLocaleString()}`;
  document.getElementById('chkGrandTotal').textContent = `฿${total.toLocaleString()}`;

  const checkedRadio = document.querySelector('input[name="paymentMethod"]:checked');
  renderPaymentInstruction(checkedRadio ? checkedRadio.value : 'QR PromptPay', total);
}

document.addEventListener('DOMContentLoaded', () => {
  prefillFromLoggedInUser();
  renderCheckoutSummary();

  window.addEventListener('eggify:synced', renderCheckoutSummary);

  document.querySelectorAll('#paymentMethodsGrid .payment-option').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('#paymentMethodsGrid .payment-option').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      renderCheckoutSummary();
    });
  });

  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const { cart, subtotal, discount, shipping, total } = window.EggifyDB.calculateCartTotals();
      if (cart.length === 0) {
        showToast('กรุณาเลือกสินค้าเข้าตะกร้าก่อนยืนยันคำสั่งซื้อ');
        return;
      }

      const customer = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const email = document.getElementById('custEmail').value.trim();
      const street = document.getElementById('custAddress').value.trim();
      const district = document.getElementById('custDistrict').value.trim();
      const province = document.getElementById('custProvince').value.trim();
      const deliverySlot = document.getElementById('deliverySlot').value;
      const note = document.getElementById('custNote').value.trim();
      const checkedRadio = document.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = checkedRadio ? checkedRadio.value : 'QR PromptPay';

      const fullAddress = `${street} ${district} ${province}`.trim();

      const createdOrder = await window.EggifyDB.createOrder({
        customer,
        email,
        phone,
        address: fullAddress,
        deliverySlot,
        note,
        paymentMethod,
        items: cart,
        subtotal,
        discount,
        shipping,
        total
      });

      const receiptEl = document.getElementById('orderReceiptDetails');
      if (receiptEl) {
        receiptEl.innerHTML = `
          <div style="display:grid;gap:6px;">
            <div><strong>เลขที่คำสั่งซื้อ:</strong> <span style="color:var(--brand-orange);font-weight:800;">${createdOrder.id}</span></div>
            <div><strong>ชื่อผู้รับ:</strong> ${createdOrder.customer} (${createdOrder.phone})</div>
            <div><strong>ที่อยู่จัดส่ง:</strong> ${createdOrder.address}</div>
            <div><strong>รอบจัดส่ง:</strong> ${createdOrder.deliverySlot}</div>
            <div><strong>วิธีชำระเงิน:</strong> ${createdOrder.paymentMethod}</div>
            <div><strong>ยอดชำระสุทธิ:</strong> <span style="color:var(--brand-green);font-weight:800;">฿${createdOrder.total.toLocaleString()}</span></div>
          </div>
        `;
      }

      const modal = document.getElementById('orderSuccessModal');
      if (modal) modal.classList.add('open');
      renderCheckoutSummary();
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
  }
});

