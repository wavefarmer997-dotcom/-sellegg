/**
 * EGGIFY – Authentication & Member Profile JavaScript (js/auth.js)
 * รองรับการเข้าสู่ระบบ สมัครสมาชิก และตรวจสอบประวัติคำสั่งซื้อออนไลน์
 */

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function switchAuthTab(mode) {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabReg = document.getElementById('tabRegisterBtn');

  if (mode === 'register') {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
  } else {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  }
}

async function quickDemoLogin(email, password) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = password;
  const result = await window.EggifyDB.login(email, password);
  if (result.ok) {
    window.EggifyDB.syncHeaderStatus();
    renderAuthState();
    showToast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${result.user.name}`);
  } else {
    showToast(result.message);
  }
}

function handleLogout() {
  window.EggifyDB.logout();
  window.EggifyDB.syncHeaderStatus();
  renderAuthState();
  showToast('ออกจากระบบเรียบร้อยแล้ว');
}

function renderAuthState() {
  if (!window.EggifyDB) return;
  const user = window.EggifyDB.getCurrentUser();
  const guestEl = document.getElementById('guestAuthSection');
  const memberEl = document.getElementById('memberProfileSection');

  if (!user) {
    guestEl.style.display = 'grid';
    memberEl.style.display = 'none';
    return;
  }

  guestEl.style.display = 'none';
  memberEl.style.display = 'block';

  document.getElementById('profileRoleBadge').textContent =
    user.role === 'admin' ? 'ADMINISTRATOR ACCOUNT (ผู้ดูแลระบบ)' : 'VERIFIED MEMBER (สมาชิกทั่วไป)';
  document.getElementById('profileWelcomeName').textContent = `สวัสดี, ${user.name}`;
  document.getElementById('profileContactInfo').textContent =
    `อีเมล: ${user.email} • โทร: ${user.phone || '-'} • ที่อยู่: ${user.address || 'ยังไม่ได้ระบุ'}`;

  const adminBtn = document.getElementById('profileAdminBtn');
  if (adminBtn) {
    adminBtn.style.display = user.role === 'admin' ? 'inline-flex' : 'none';
  }

  const orders = window.EggifyDB.getOrders();
  const container = document.getElementById('memberOrdersContainer');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);">ยังไม่มีประวัติคำสั่งซื้อ</p>`;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-subtle);text-align:left;color:var(--text-muted);">
            <th style="padding:12px 10px;">เลขที่คำสั่งซื้อ</th>
            <th style="padding:12px 10px;">ผู้รับสินค้า</th>
            <th style="padding:12px 10px;">วิธีชำระเงิน</th>
            <th style="padding:12px 10px;">ยอดสุทธิ</th>
            <th style="padding:12px 10px;">สถานะจัดส่ง</th>
          </tr>
        </thead>
        <tbody>
          ${[...orders]
            .reverse()
            .map(
              o => `
            <tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:12px 10px;font-weight:700;color:var(--brand-orange);">${o.id}</td>
              <td style="padding:12px 10px;">${o.customer}<br/><small style="color:var(--text-secondary);">${o.address || ''}</small></td>
              <td style="padding:12px 10px;">${o.paymentMethod || 'QR PromptPay'}</td>
              <td style="padding:12px 10px;font-weight:700;">฿${Number(o.total).toLocaleString()}</td>
              <td style="padding:12px 10px;">
                <span class="bento-tag" style="background:${
                  o.status === 'จัดส่งแล้ว' ? '#DCF2E3;color:#2A6F4E' : o.status === 'กำลังจัดส่ง' ? '#EAF1FB;color:#3B669E' : '#FFF0C2;color:#9A6B1D'
                };">${o.status}</span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthState();
  window.addEventListener('eggify:synced', renderAuthState);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;
      const res = await window.EggifyDB.login(email, pass);
      if (res.ok) {
        window.EggifyDB.syncHeaderStatus();
        renderAuthState();
        showToast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${res.user.name}`);
      } else {
        showToast(res.message);
      }
    });
  }

  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        address: document.getElementById('regAddress').value,
        password: document.getElementById('regPassword').value
      };
      const res = await window.EggifyDB.register(payload);
      if (res.ok) {
        window.EggifyDB.syncHeaderStatus();
        renderAuthState();
        showToast(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${res.user.name}`);
      } else {
        showToast(res.message);
      }
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('mainNavMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('mobile-open'));
  }
});

