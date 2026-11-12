// EGGIFY Admin Dashboard
// ข้อมูลตัวอย่างจะถูกเก็บไว้ใน localStorage ของเบราว์เซอร์เครื่องนี้

const STORAGE = {
  products: "eggify_admin_products",
  orders: "eggify_admin_orders"
};

const starterProducts = [
  { id: 1, name: "ไข่ไก่ เบอร์ 1", category: "ไข่ไก่", price: 55, stock: 30, description: "ไข่ไก่สด คัดขนาด เบอร์ 1" },
  { id: 2, name: "ไข่เป็ด สดใหม่", category: "ไข่เป็ด", price: 65, stock: 18, description: "ไข่เป็ดสดใหม่ เหมาะสำหรับทำอาหาร" },
  { id: 3, name: "ไข่นกกระทา", category: "ไข่นกกระทา", price: 40, stock: 25, description: "ไข่นกกระทาคุณภาพดี" }
];

const starterOrders = [
  { id: "EGG-1001", customer: "สมชาย ใจดี", phone: "081-234-5678", address: "กรุงเทพมหานคร", total: 165, status: "รอดำเนินการ" },
  { id: "EGG-1002", customer: "สุดา รักไข่", phone: "089-555-1212", address: "นนทบุรี", total: 220, status: "กำลังจัดส่ง" },
  { id: "EGG-1003", customer: "มานะ ขยัน", phone: "092-111-2222", address: "ปทุมธานี", total: 110, status: "จัดส่งแล้ว" }
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return [...fallback];
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error("อ่านข้อมูลไม่สำเร็จ:", error);
    return [...fallback];
  }
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let products = loadData(STORAGE.products, starterProducts);
let orders = loadData(STORAGE.orders, starterOrders);

const $ = (id) => document.getElementById(id);
const money = (amount) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(amount) || 0);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderDashboard() {
  $("statProducts").textContent = products.length;
  $("statOrders").textContent = orders.length;
  const sales = orders.filter(o => o.status === "จัดส่งแล้ว").reduce((sum, o) => sum + Number(o.total || 0), 0);
  $("statSales").textContent = money(sales);
  $("statPending").textContent = orders.filter(o => o.status !== "จัดส่งแล้ว").length;

  const latest = [...orders].slice(-5).reverse();
  $("recentOrders").innerHTML = latest.length ? latest.map(order => `
    <tr><td><strong>${escapeHTML(order.id)}</strong></td><td>${escapeHTML(order.customer)}</td>
    <td>${money(order.total)}</td><td>${statusBadge(order.status)}</td></tr>`).join("") :
    '<tr><td colspan="4" class="muted">ยังไม่มีคำสั่งซื้อ</td></tr>';
}

function statusBadge(status) {
  const cls = status === "จัดส่งแล้ว" ? "done" : status === "กำลังจัดส่ง" ? "shipping" : "pending";
  return `<span class="status ${cls}">${escapeHTML(status)}</span>`;
}

function renderProducts() {
  const keyword = $("productSearch").value.trim().toLowerCase();
  const filtered = products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(keyword));
  $("productCount").textContent = `${filtered.length} รายการ`;
  $("emptyProducts").classList.toggle("hidden", filtered.length !== 0);
  $("productGrid").innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-visual">${p.category === "ไข่เป็ด" ? "🦆🥚" : p.category === "ไข่นกกระทา" ? "🐣" : "🥚"}</div>
      <h3>${escapeHTML(p.name)}</h3>
      <p>${escapeHTML(p.category)} · ${escapeHTML(p.description || "ไม่มีรายละเอียด")}</p>
      <div class="product-meta"><span class="product-price">${money(p.price)}</span><span class="stock">คงเหลือ ${Number(p.stock)} ชิ้น</span></div>
      <div class="card-actions">
        <button class="edit-btn" data-edit="${p.id}">แก้ไข</button>
        <button class="delete-btn" data-delete="${p.id}">ลบสินค้า</button>
      </div>
    </article>`).join("");
  renderDashboard();
}

function renderOrders() {
  const keyword = $("orderSearch").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const filtered = orders.filter(o => {
    const matchesText = `${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(keyword);
    return matchesText && (status === "all" || o.status === status);
  });
  $("emptyOrders").classList.toggle("hidden", filtered.length !== 0);
  $("ordersTable").innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${escapeHTML(o.id)}</strong></td><td>${escapeHTML(o.customer)}</td>
      <td>${escapeHTML(o.phone || "-")}</td><td>${escapeHTML(o.address || "-")}</td>
      <td>${money(o.total)}</td><td>${statusBadge(o.status)}</td>
      <td><select class="order-status-select" data-order-status="${escapeHTML(o.id)}" aria-label="เปลี่ยนสถานะคำสั่งซื้อ">
        ${["รอดำเนินการ","กำลังจัดส่ง","จัดส่งแล้ว"].map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select></td>
    </tr>`).join("");
  renderDashboard();
}

function openProductModal(product = null) {
  $("productForm").reset();
  $("productId").value = product ? product.id : "";
  $("modalTitle").textContent = product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่";
  if (product) {
    $("productName").value = product.name;
    $("productPrice").value = product.price;
    $("productStock").value = product.stock;
    $("productCategory").value = product.category;
    $("productDescription").value = product.description || "";
  }
  $("productModal").classList.remove("hidden");
  $("productName").focus();
}
function closeProductModal() { $("productModal").classList.add("hidden"); }

function navigate(section) {
  document.querySelectorAll(".page-section").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-link[data-section]").forEach(el => el.classList.toggle("active", el.dataset.section === section));
  $(`${section}Section`).classList.add("active");
  $("pageTitle").textContent = section === "dashboard" ? "ภาพรวมร้านค้า" : section === "products" ? "จัดการสินค้า" : "คำสั่งซื้อ";
  $("sidebar").classList.remove("open");
  if (section === "dashboard") renderDashboard();
  if (section === "products") renderProducts();
  if (section === "orders") renderOrders();
}

document.querySelectorAll(".nav-link[data-section]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.section)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.go)));
$("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("addProductBtn").addEventListener("click", () => openProductModal());
$("closeModal").addEventListener("click", closeProductModal);
$("cancelModal").addEventListener("click", closeProductModal);
$("productModal").addEventListener("click", e => { if (e.target === $("productModal")) closeProductModal(); });
$("productSearch").addEventListener("input", renderProducts);
$("orderSearch").addEventListener("input", renderOrders);
$("statusFilter").addEventListener("change", renderOrders);

$("productForm").addEventListener("submit", e => {
  e.preventDefault();
  const id = $("productId").value;
  const product = {
    id: id ? Number(id) : Date.now(),
    name: $("productName").value.trim(),
    price: Number($("productPrice").value),
    stock: Number($("productStock").value),
    category: $("productCategory").value,
    description: $("productDescription").value.trim()
  };
  if (!product.name || product.price < 0 || product.stock < 0) {
    showToast("กรุณาตรวจสอบข้อมูลสินค้า");
    return;
  }
  if (id) {
    products = products.map(p => p.id === Number(id) ? product : p);
    showToast("แก้ไขสินค้าเรียบร้อยแล้ว");
  } else {
    products.push(product);
    showToast("เพิ่มสินค้าเรียบร้อยแล้ว");
  }
  saveData(STORAGE.products, products);
  closeProductModal();
  renderProducts();
});

$("productGrid").addEventListener("click", e => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;
  if (editId) {
    const product = products.find(p => p.id === Number(editId));
    if (product) openProductModal(product);
  }
  if (deleteId) {
    const product = products.find(p => p.id === Number(deleteId));
    if (product && confirm(`ต้องการลบ "${product.name}" ใช่หรือไม่?`)) {
      products = products.filter(p => p.id !== Number(deleteId));
      saveData(STORAGE.products, products);
      renderProducts();
      showToast("ลบสินค้าเรียบร้อยแล้ว");
    }
  }
});

$("ordersTable").addEventListener("change", e => {
  const id = e.target.dataset.orderStatus;
  if (!id) return;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = e.target.value;
    saveData(STORAGE.orders, orders);
    renderOrders();
    showToast("อัปเดตสถานะคำสั่งซื้อแล้ว");
  }
});

// เริ่มต้นระบบ
renderDashboard();
renderProducts();
renderOrders();

