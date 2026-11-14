/**
 * EGGIFY – Online Full-Stack Web Server & SQLite Database Engine (server.js)
 * รันด้วยคำสั่ง: node server.js (ไม่พึ่งพาแพ็กเกจภายนอก ใช้ node:sqlite และ node:http ในตัว)
 * รองรับการ Deploy ออนไลน์บน Render, Railway, Fly.io, VPS หรือรันบนเครื่องทันที
 */

const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;
const SCHEMA_PATH = path.join(ROOT_DIR, 'database', 'schema.sql');
const DB_DIR =
  process.env.RAILWAY_VOLUME_MOUNT_PATH ||
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join(os.tmpdir(), 'eggify-data') : path.join(ROOT_DIR, 'database'));
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'eggify.db');

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// โหลด Schema และตั้งค่าเริ่มต้นของฐานข้อมูล
function initializeDatabase(forceReset = false) {
  if (forceReset) {
    db.exec(`
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;
    `);
  }

  const schemaSQL = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSQL);

  // Seed Users
  const userCount = db.prepare('SELECT COUNT(*) AS cnt FROM users').get().cnt;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, phone, address, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      'ผู้ดูแลระบบ EGGIFY (Admin)',
      'admin@eggify.com',
      'admin123',
      '02-123-4567',
      'สำนักงานใหญ่ ฟาร์มเอ้กอิฟาย อ.สามพราน จ.นครปฐม 73110',
      'admin',
      '2026-11-01'
    );
    insertUser.run(
      'สมชาย ใจดี',
      'customer@eggify.com',
      '123456',
      '081-234-5678',
      '88/12 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      'customer',
      '2026-11-05'
    );
  }

  // Seed Products (ไข่ไก่ ไข่เป็ด ไข่นกกระทา เซ็ตสุดคุ้ม)
  const productCount = db.prepare('SELECT COUNT(*) AS cnt FROM products').get().cnt;
  if (productCount === 0) {
    const seedProducts = [
      [1, 'egg-01', 'ไข่ไก่สดออร์แกนิค (Free-Range) แพ็ก 10 ฟอง', 'ไข่ไก่', 'chicken', 'ขายดีอันดับ 1', 89, 35, 'แพ็ก 10 ฟอง', 'brown', '65–70 กรัม/ฟอง', 'โปรตีน 6.8g • โอเมก้าสูง • ปลอดยาปฏิชีวนะ 100%', 'ฟาร์มระบบเปิด นครปฐม (GAP Certified)', 'แม่ไก่เลี้ยงปล่อยอิสระในโรงเรือนธรรมชาติ ไข่แดงกลมโตสีส้มสด เปลือกสะอาด ปลอดสารเร่งและยาปฏิชีวนะ 100%'],
      [2, 'egg-02', 'ไข่ไก่สดคัดพิเศษ เบอร์ 0 ยกแผง 30 ฟอง', 'ไข่ไก่', 'chicken', 'คุ้มค่าประจำบ้าน', 145, 45, 'แผง 30 ฟอง', 'brown', '70 กรัมขึ้นไป/ฟอง', 'โปรตีน 7.2g • วิตามิน A, B12, D สูง', 'ฟาร์มเอ้กอิฟาย นครปฐม', 'ฟองใหญ่พิเศษ เปลือกหนา ไข่แดงกลมโต เก็บใหม่จากฟาร์มทุกเช้า เหมาะสำหรับทุกเมนูในครอบครัวและร้านเบเกอรี่'],
      [3, 'egg-03', 'ไข่ไก่สด เบอร์ 1 คัดขนาดมาตรฐาน แพ็ก 10 ฟอง', 'ไข่ไก่', 'chicken', 'ยอดนิยม', 55, 60, 'แพ็ก 10 ฟอง', 'brown', '65–69 กรัม/ฟอง', 'โปรตีน 6.5g • สดสะอาดผ่านการฆ่าเชื้อ UV', 'ฟาร์มเอ้กอิฟาย นครปฐม', 'ไข่ไก่สด คัดขนาด เบอร์ 1 สดใหม่ทุกวัน เหมาะสำหรับทำอาหารเช้า ไข่เจียว ไข่ดาว และเมนูประจำบ้าน'],
      [4, 'egg-04', 'ไข่ไก่เสริม Omega-3 & Vitamin E แพ็ก 10 ฟอง', 'ไข่ไก่', 'chicken', 'เพื่อสุขภาพ', 99, 28, 'แพ็ก 10 ฟอง', 'mixed', '65–70 กรัม/ฟอง', 'DHA & Omega-3 สูงกว่าไข่ทั่วไป 3 เท่า • วิตามิน E สูง', 'ฟาร์มเอ้กอิฟาย ออร์แกนิค นครปฐม', 'แม่ไก่กินอาหารสูตรเมล็ดแฟลกซ์และสาหร่ายทะเล อุดมด้วยโอเมก้า 3 สูงกว่าไข่ทั่วไป 3 เท่า บำรุงสมองและหัวใจ'],
      [5, 'egg-05', 'ไข่เป็ดไล่ทุ่งสุพรรณบุรี สดใหม่ แพ็ก 10 ฟอง', 'ไข่เป็ด', 'duck', 'ไข่แดงมันเยิ้ม', 65, 30, 'แพ็ก 10 ฟอง', 'white', '70–75 กรัม/ฟอง', 'โปรตีน 8.2g • ไข่แดงเข้มข้นมันธรรมชาติ', 'ฟาร์มเป็ดไล่ทุ่ง สุพรรณบุรี', 'ไข่เป็ดสดใหม่จากฟาร์มไล่ทุ่งธรรมชาติ ไข่แดงสีส้มแดงมันเยิ้ม เหมาะสำหรับทำไข่ดาวกรอบ ไข่ต้มยางมะตูม และขนมไทย'],
      [6, 'egg-06', 'ไข่เป็ดคัดพิเศษ เบอร์ใหญ่ ยกแผง 30 ฟอง', 'ไข่เป็ด', 'duck', 'เกรดร้านขนมไทย', 175, 20, 'แผง 30 ฟอง', 'white', '75 กรัมขึ้นไป/ฟอง', 'โปรตีน 8.5g • วิตามิน B รวมและธาตุเหล็กสูง', 'ฟาร์มเป็ดไล่ทุ่ง สุพรรณบุรี', 'ไข่เป็ดเปลือกขาวฟองใหญ่พิเศษ คัดเกรดสำหรับทำฝอยทอง ทองหยิบ ทองหยอด สังขยา และเมนูอาหารคาวรสเข้มข้น'],
      [7, 'egg-07', 'ไข่เค็มไชยาพอกดินสอพอง สูตรดั้งเดิม 6 ฟอง', 'ไข่เป็ด', 'duck', 'OTOP คัดพิเศษ', 65, 25, 'กล่อง 6 ฟอง', 'white', '70 กรัม/ฟอง', 'พอกดินสอพองธรรมชาติ • ไร้สารกันบูด', 'กลุ่มแม่บ้านเกษตรกร ไชยา', 'เค็มกำลังดี ไข่แดงแดงสดมันเยิ้มเป็นทราย สามารถนำไปต้มเป็นไข่เค็มยำ หรือตอกทอดเป็นไข่ดาวเค็มได้ทันที'],
      [8, 'egg-08', 'ไข่นกกระทาสดปลอดสาร คัดพิเศษ แพ็ก 25 ฟอง', 'ไข่นกกระทา', 'quail', 'สดจากฟาร์มทุกเช้า', 40, 50, 'แพ็ก 25 ฟอง', 'quail', '11–13 กรัม/ฟอง', 'วิตามิน B12 และธาตุเหล็กสูง • ย่อยง่าย', 'ฟาร์มนกกระทาปลอดสาร ราชบุรี', 'ไข่นกกระทาคุณภาพดี เปลือกลายสวย สดใหม่ทุกวัน เหมาะสำหรับทำขนมครกไข่นกกระทา กระเพาะปลา และเมนูเด็ก'],
      [9, 'egg-09', 'ไข่นกกระทาต้มสุกพร้อมทาน ปอกเปลือกสะอาด 20 ฟอง', 'ไข่นกกระทา', 'quail', 'พร้อมปรุงทันที', 55, 32, 'แพ็ก 20 ฟอง', 'quail', '10–12 กรัม/ฟอง (ต้มสุก)', 'โปรตีนล้วน • บรรจุสูญญากาศสะอาดปลอดภัย', 'ฟาร์มนกกระทาปลอดสาร ราชบุรี', 'ไข่นกกระทาต้มสุกปอกเปลือกด้วยเครื่องจักรสะอาดมาตรฐาน อย. พร้อมนำไปทำพะโล้ สลัด หรือทานเล่นได้ทันที'],
      [10, 'egg-10', 'ชุดครอบครัวอิ่มคุ้ม Mixed Farm Pack (40 ฟอง)', 'เซ็ตสุดคุ้ม', 'special', 'ลดพิเศษ 15%', 215, 18, 'เซ็ต 40 ฟอง', 'mixed', 'รวม 40 ฟอง (คละไซส์พรีเมียม)', 'ครบคุณค่าโปรตีนสำหรับทุกคนในบ้าน', 'ฟาร์มเอ้กอิฟาย นครปฐม', 'จับคู่ความคุ้ม! ไข่ไก่เบอร์ 0 ยกแผง (30 ฟอง) + ไข่ไก่ออร์แกนิค Free-Range (10 ฟอง) ประหยัดทันที 15%']
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (id, code, name, category, category_key, badge, price, stock, unit, egg_type, weight, nutrition, farm_origin, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const row of seedProducts) {
      insertProd.run(...row);
    }
  }

  // Seed Orders
  const orderCount = db.prepare('SELECT COUNT(*) AS cnt FROM orders').get().cnt;
  if (orderCount === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer, email, phone, address, payment_method, subtotal, discount, shipping, total, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertOrder.run('EGG-1001', 'สมชาย ใจดี', 'customer@eggify.com', '081-234-5678', '88/12 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110', 'QR PromptPay', 165, 0, 0, 165, 'รอดำเนินการ', '2026-11-12 09:30');
    insertOrder.run('EGG-1002', 'สุดา รักไข่', 'suda@example.com', '089-555-1212', '45/9 หมู่ 4 ต.บางกระสอ อ.เมืองนนทบุรี จ.นนทบุรี 11000', 'โอนเงินผ่านธนาคาร', 210, 0, 10, 220, 'กำลังจัดส่ง', '2026-11-12 14:15');
    insertOrder.run('EGG-1003', 'มานะ ขยัน', 'mana@example.com', '092-111-2222', '199/3 ต.ประชาธิปัตย์ อ.ธัญบุรี จ.ปทุมธานี 12130', 'เก็บเงินปลายทาง (COD)', 95, 0, 15, 110, 'จัดส่งแล้ว', '2026-11-11 17:40');
  }
}

initializeDatabase(false);

function fetchAllProducts() {
  const rows = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  return rows.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    categoryKey: r.category_key,
    badge: r.badge,
    price: r.price,
    stock: r.stock,
    unit: r.unit,
    eggType: r.egg_type,
    weight: r.weight,
    nutrition: r.nutrition,
    farmOrigin: r.farm_origin,
    description: r.description
  }));
}

function fetchAllOrders(filterEmail = null) {
  const orders = filterEmail
    ? db.prepare('SELECT * FROM orders WHERE lower(email) = lower(?) ORDER BY rowid ASC').all(filterEmail)
    : db.prepare('SELECT * FROM orders ORDER BY rowid ASC').all();
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  return orders.map(o => ({
    id: o.id,
    customer: o.customer,
    email: o.email,
    phone: o.phone,
    address: o.address,
    deliverySlot: o.delivery_slot,
    note: o.note,
    paymentMethod: o.payment_method,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
    items: itemsStmt.all(o.id)
  }));
}

function fetchSafeUsers() {
  return db
    .prepare('SELECT id, name, email, phone, address, role, created_at AS createdAt FROM users')
    .all();
}

function getSessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  return (
    db
      .prepare(`
        SELECT u.id, u.name, u.email, u.phone, u.address, u.role
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
      `)
      .get(token) || null
  );
}

function createSessionToken(user) {
  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, role) VALUES (?, ?, ?)').run(
    token,
    user.id,
    user.role
  );
  return token;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.end(JSON.stringify(payload));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

async function requestHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, { ok: true });
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  try {
    // 1. Bootstrap & Health API
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, 200, { ok: true, database: 'SQLite (database/eggify.db)', timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/bootstrap' && req.method === 'GET') {
      const sessionUser = getSessionUser(req);
      const isAdmin = sessionUser && sessionUser.role === 'admin';
      const orders = isAdmin
        ? fetchAllOrders()
        : sessionUser
        ? fetchAllOrders(sessionUser.email)
        : [];
      return sendJSON(res, 200, {
        ok: true,
        user: sessionUser,
        products: fetchAllProducts(),
        orders,
        users: isAdmin ? fetchSafeUsers() : []
      });
    }

    // 2. Authentication API
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return sendJSON(res, 401, { ok: false, message: 'ยังไม่ได้เข้าสู่ระบบ' });
      }
      return sendJSON(res, 200, { ok: true, user: sessionUser });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
      if (token) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      }
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await readBody(req);
      const user = db
        .prepare('SELECT id, name, email, phone, address, role FROM users WHERE lower(email) = lower(?) AND password = ?')
        .get(String(email || '').trim(), String(password || ''));

      if (!user) {
        return sendJSON(res, 401, { ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }
      const token = createSessionToken(user);
      return sendJSON(res, 200, { ok: true, user, token });
    }

    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const { name, email, phone, address, password } = await readBody(req);
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!name || !cleanEmail || !password) {
        return sendJSON(res, 400, { ok: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      }
      const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(cleanEmail);
      if (existing) {
        return sendJSON(res, 409, { ok: false, message: 'อีเมลนี้มีในระบบแล้ว' });
      }
      const result = db
        .prepare('INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)')
        .run(name, cleanEmail, password, phone || '', address || '', 'customer');

      const user = {
        id: Number(result.lastInsertRowid),
        name,
        email: cleanEmail,
        phone: phone || '',
        address: address || '',
        role: 'customer'
      };
      const token = createSessionToken(user);
      return sendJSON(res, 201, { ok: true, user, token });
    }

    // 3. Products CRUD API (Read = Public, Write = Admin Only)
    if (pathname === '/api/products' && req.method === 'GET') {
      return sendJSON(res, 200, fetchAllProducts());
    }

    if (pathname === '/api/products' && req.method === 'POST') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser || sessionUser.role !== 'admin') {
        return sendJSON(res, 403, { ok: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
      }
      const p = await readBody(req);
      const id = Number(p.id) || Date.now();
      db.prepare(`
        INSERT OR REPLACE INTO products (id, code, name, category, category_key, badge, price, stock, unit, egg_type, weight, nutrition, farm_origin, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        p.code || `egg-${id}`,
        p.name,
        p.category || 'ไข่ไก่',
        p.categoryKey || 'chicken',
        p.badge || `คงเหลือ ${p.stock} ชิ้น`,
        Number(p.price) || 0,
        Number(p.stock) || 0,
        p.unit || 'แพ็กมาตรฐาน',
        p.eggType || 'brown',
        p.weight || 'ขนาดคัดพิเศษ',
        p.nutrition || 'โปรตีนสูง สดจากฟาร์ม',
        p.farmOrigin || 'ฟาร์มเอ้กอิฟาย นครปฐม',
        p.description || ''
      );
      return sendJSON(res, 201, { ok: true, id });
    }

    if (pathname.startsWith('/api/products/') && req.method === 'PUT') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser || sessionUser.role !== 'admin') {
        return sendJSON(res, 403, { ok: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
      }
      const id = Number(pathname.split('/').pop());
      const p = await readBody(req);
      db.prepare(`
        UPDATE products
        SET name = ?, category = ?, category_key = ?, price = ?, stock = ?, description = ?
        WHERE id = ?
      `).run(
        p.name,
        p.category || 'ไข่ไก่',
        p.categoryKey || 'chicken',
        Number(p.price) || 0,
        Number(p.stock) || 0,
        p.description || '',
        id
      );
      return sendJSON(res, 200, { ok: true, id });
    }

    if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser || sessionUser.role !== 'admin') {
        return sendJSON(res, 403, { ok: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
      }
      const id = Number(pathname.split('/').pop());
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return sendJSON(res, 200, { ok: true, id });
    }

    // 4. Orders API
    if (pathname === '/api/orders' && req.method === 'GET') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return sendJSON(res, 401, { ok: false, message: 'กรุณาเข้าสู่ระบบ' });
      }
      if (sessionUser.role === 'admin') {
        return sendJSON(res, 200, fetchAllOrders());
      }
      return sendJSON(res, 200, fetchAllOrders(sessionUser.email));
    }

    if (pathname === '/api/orders' && req.method === 'POST') {
      const o = await readBody(req);
      db.prepare(`
        INSERT OR REPLACE INTO orders (id, customer, email, phone, address, delivery_slot, note, payment_method, subtotal, discount, shipping, total, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        o.id,
        o.customer,
        o.email || '',
        o.phone,
        o.address,
        o.deliverySlot || '',
        o.note || '',
        o.paymentMethod || 'QR PromptPay',
        Number(o.subtotal) || 0,
        Number(o.discount) || 0,
        Number(o.shipping) || 0,
        Number(o.total) || 0,
        o.status || 'รอดำเนินการ',
        o.createdAt || new Date().toISOString()
      );

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, name, price, qty)
        VALUES (?, ?, ?, ?, ?)
      `);
      const decStock = db.prepare(`
        UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
      `);

      for (const item of o.items || []) {
        insertItem.run(o.id, Number(item.id) || null, item.name, Number(item.price) || 0, Number(item.qty) || 1);
        if (item.id) {
          decStock.run(Number(item.qty) || 1, Number(item.id));
        }
      }

      return sendJSON(res, 201, { ok: true, id: o.id });
    }

    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && req.method === 'PATCH') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser || sessionUser.role !== 'admin') {
        return sendJSON(res, 403, { ok: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
      }
      const parts = pathname.split('/');
      const orderId = parts[parts.length - 2];
      const { status } = await readBody(req);
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
      return sendJSON(res, 200, { ok: true, id: orderId, status });
    }

    if (pathname === '/api/reset' && req.method === 'POST') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser || sessionUser.role !== 'admin') {
        return sendJSON(res, 403, { ok: false, message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' });
      }
      initializeDatabase(true);
      return sendJSON(res, 200, { ok: true });
    }

    if ((pathname === '/health' || pathname === '/api/health') && req.method === 'GET') {
      return sendJSON(res, 200, { ok: true, status: 'healthy', uptime: Math.floor(process.uptime()) });
    }

    // 5. Static File Server
    let safeRelPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(ROOT_DIR, safeRelPath);
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { ok: false, message: err.message });
  }
}

const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log('==============================================================');
    console.log(`🥚 EGGIFY Online Web Server & SQLite DB is running!`);
    console.log(`🌐 URL: http://localhost:${PORT} (host ${HOST})`);
    console.log(`🗄️  SQLite Database: ${DB_PATH}`);
    console.log('==============================================================');
  });
}

module.exports = requestHandler;

