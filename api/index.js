import express from 'express';
import {
  checkDatabaseHealth,
  getWorksCollection,
  getDocumentationCollection,
  getScriptsCollection,
  getExperienceCollection,
  getEducationCollection,
  getContactCollection,
  getOptionsCollection,
  getWorkCategoriesCollection,
  getExperienceCategoriesCollection,
  getRoleFiltersCollection
} from './lib/db.js';
import {
  verifyPinServer,
  createSessionToken,
  verifySessionToken,
  requireAuth
} from './lib/auth.js';
import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deletePdfFromCloudinary
} from './lib/cloudinary.js';
import { normalizeScriptPayload } from './lib/scriptSchema.js';
import {
  defaultWorkCategories,
  defaultExpCategories,
  defaultRoleFilters,
  defaultContact
} from './lib/defaults.js';

const app = express();

// 20 MiB binary PDF becomes roughly 26.7 MiB when represented as a data URL.
app.use(express.json({ limit: '28mb' }));

// Strip /api prefix on Vercel — routes are defined without it (e.g. /auth/login not /api/auth/login).
// In Vite dev mode the prefix is already stripped by server.middlewares.use('/api', ...).
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') || req.url === '/api') {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'GET' && (req.path === '/scripts' || req.path.startsWith('/scripts/'))) {
    res.set('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

// Helper to parse cookie string manually if cookie-parser middleware is not attached
app.use((req, res, next) => {
  req.cookies = req.cookies || {};
  if (req.headers.cookie) {
    const pairs = req.headers.cookie.split(';');
    for (const pair of pairs) {
      const [key, value] = pair.trim().split('=');
      if (key && value) {
        req.cookies[key] = decodeURIComponent(value);
      }
    }
  }
  next();
});

// ── 1. HEALTH CHECK ENDPOINT ──────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = await checkDatabaseHealth();
  if (health.connected) {
    return res.json({
      success: true,
      database: 'MongoDB',
      dbName: health.dbName,
      status: 'connected',
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(503).json({
    success: false,
    database: 'MongoDB',
    status: 'disconnected',
    error: health.error,
    timestamp: new Date().toISOString(),
  });
});

// ── 2. AUTHENTICATION ENDPOINTS ───────────────────────────────────
app.post('/auth/login', (req, res) => {
  const { pin } = req.body || {};
  if (!verifyPinServer(pin)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'PIN salah. Akses ditolak.' },
    });
  }

  const token = createSessionToken();
  const maxAge = 4 * 60 * 60 * 1000; // 4 Hours

  res.cookie('zeze_cms_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge,
  });

  return res.json({
    success: true,
    message: 'Otentikasi berhasil. Sesi diaktifkan.',
  });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('zeze_cms_session');
  return res.json({ success: true, message: 'Logout berhasil.' });
});

app.get('/auth/me', (req, res) => {
  const token = req.cookies.zeze_cms_session || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  const isValid = verifySessionToken(token);
  return res.json({ authenticated: isValid });
});

// ── 3. WORKS REST API ─────────────────────────────────────────────
app.get('/works', async (req, res) => {
  try {
    const col = await getWorksCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).sort({ endDate: -1 }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('[API /works] GET error:', err);
    return res.json({ success: true, data: [], fallback: true, error: err.message });
  }
});

app.get('/works/:id', async (req, res) => {
  try {
    const col = await getWorksCollection();
    const item = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Karya tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/works', requireAuth, async (req, res) => {
  try {
    const col = await getWorksCollection();
    const workData = req.body;

    if (!workData.id || !workData.title) {
      return res.status(400).json({ success: false, error: 'Judul dan ID Karya wajib diisi.' });
    }

    const existing = await col.findOne({ id: workData.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Karya dengan ID "${workData.id}" sudah ada.` });
    }

    const document = {
      ...workData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/works/:id', requireAuth, async (req, res) => {
  try {
    const col = await getWorksCollection();
    const workData = req.body;
    const targetId = req.params.id;

    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Karya tidak ditemukan.' });
    }

    const updatedDocument = {
      ...existing,
      ...workData,
      id: targetId,
      updatedAt: new Date().toISOString(),
    };
    delete updatedDocument._id;

    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/works/:id', requireAuth, async (req, res) => {
  try {
    const col = await getWorksCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Karya tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Karya berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. DOCUMENTATION REST API ─────────────────────────────────────
app.get('/documentation', async (req, res) => {
  try {
    const col = await getDocumentationCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('[API /documentation] GET error:', err);
    return res.json({ success: true, data: [], fallback: true, error: err.message });
  }
});

app.get('/documentation/:id', async (req, res) => {
  try {
    const col = await getDocumentationCollection();
    const item = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Dokumentasi tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/documentation', requireAuth, async (req, res) => {
  try {
    const col = await getDocumentationCollection();
    const docData = req.body;

    if (!docData.id || !docData.title) {
      return res.status(400).json({ success: false, error: 'Judul dan ID Dokumentasi wajib diisi.' });
    }

    const existing = await col.findOne({ id: docData.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Dokumentasi dengan ID "${docData.id}" sudah ada.` });
    }

    const document = {
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/documentation/:id', requireAuth, async (req, res) => {
  try {
    const col = await getDocumentationCollection();
    const docData = req.body;
    const targetId = req.params.id;

    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Dokumentasi tidak ditemukan.' });
    }

    const updatedDocument = {
      ...existing,
      ...docData,
      id: targetId,
      updatedAt: new Date().toISOString(),
    };
    delete updatedDocument._id;

    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/documentation/:id', requireAuth, async (req, res) => {
  try {
    const col = await getDocumentationCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Dokumentasi tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Dokumentasi berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. SCRIPTS FULL CRUD ──────────────────────────────────────────
app.get('/scripts', async (req, res) => {
  try {
    const col = await getScriptsCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.json({ success: true, data: [], fallback: true });
  }
});

app.get('/scripts/:id', async (req, res) => {
  try {
    const col = await getScriptsCollection();
    const item = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Naskah tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/scripts', requireAuth, async (req, res) => {
  try {
    const col = await getScriptsCollection();
    const data = normalizeScriptPayload(req.body);
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Naskah dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    try { await col.insertOne(document); } catch (error) {
      if (document.pdfPublicId) await deletePdfFromCloudinary(document.pdfPublicId).catch(() => { });
      throw error;
    }
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/scripts/:id', requireAuth, async (req, res) => {
  try {
    const col = await getScriptsCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Naskah tidak ditemukan.' });
    }
    const incoming = normalizeScriptPayload(req.body, { id: targetId });
    const updatedDocument = { ...existing, ...incoming, id: targetId, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    if (existing.pdfPublicId && existing.pdfPublicId !== updatedDocument.pdfPublicId) {
      await deletePdfFromCloudinary(existing.pdfPublicId).catch((error) => console.warn('[API scripts] old PDF cleanup failed:', error.message));
    }
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/scripts/:id', requireAuth, async (req, res) => {
  try {
    const col = await getScriptsCollection();
    const existing = await col.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Naskah tidak ditemukan.' });
    }

    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Naskah tidak ditemukan.' });
    }
    let cleanupWarning = null;
    if (existing.pdfPublicId) {
      try { await deletePdfFromCloudinary(existing.pdfPublicId); } catch (error) { cleanupWarning = 'Dokumen dihapus dari MongoDB, tetapi cleanup Cloudinary perlu ditinjau.'; }
    }
    return res.json({ success: true, message: 'Naskah berhasil dihapus.', cleanupWarning });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.1 EXPERIENCE FULL CRUD ──────────────────────────────────────
app.get('/experience', async (req, res) => {
  try {
    const col = await getExperienceCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.json({ success: true, data: [], fallback: true });
  }
});

app.get('/experience/:id', async (req, res) => {
  try {
    const col = await getExperienceCollection();
    const item = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Pengalaman tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/experience', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCollection();
    const data = req.body;
    if (!data.id || !data.position) {
      return res.status(400).json({ success: false, error: 'ID dan Posisi wajib diisi.' });
    }
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Pengalaman dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/experience/:id', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Pengalaman tidak ditemukan.' });
    }
    const updatedDocument = { ...existing, ...req.body, id: targetId, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/experience/:id', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Pengalaman tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Pengalaman berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.2 EDUCATION FULL CRUD ───────────────────────────────────────
app.get('/education', async (req, res) => {
  try {
    const col = await getEducationCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.json({ success: true, data: [], fallback: true });
  }
});

app.get('/education/:id', async (req, res) => {
  try {
    const col = await getEducationCollection();
    const item = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Pendidikan tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/education', requireAuth, async (req, res) => {
  try {
    const col = await getEducationCollection();
    const data = req.body;
    if (!data.id || !data.institution) {
      return res.status(400).json({ success: false, error: 'ID dan Institusi wajib diisi.' });
    }
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Pendidikan dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/education/:id', requireAuth, async (req, res) => {
  try {
    const col = await getEducationCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Pendidikan tidak ditemukan.' });
    }
    const updatedDocument = { ...existing, ...req.body, id: targetId, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/education/:id', requireAuth, async (req, res) => {
  try {
    const col = await getEducationCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Pendidikan tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Pendidikan berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.4 WORK CATEGORIES CRUD ──────────────────────────────────────
// ── 5.4 WORK CATEGORIES CRUD ──────────────────────────────────────
app.get('/work-categories', async (req, res) => {
  try {
    const col = await getWorkCategoriesCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return res.json({ success: true, data: items.length > 0 ? items : defaultWorkCategories });
  } catch (err) {
    return res.json({ success: true, data: defaultWorkCategories, fallback: true });
  }
});

app.post('/work-categories', requireAuth, async (req, res) => {
  try {
    const col = await getWorkCategoriesCollection();
    const data = req.body;
    if (!data.id || !data.label) {
      return res.status(400).json({ success: false, error: 'ID (slug) dan Label Kategori Karya wajib diisi.' });
    }
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Kategori karya dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/work-categories/:id', requireAuth, async (req, res) => {
  try {
    const col = await getWorkCategoriesCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kategori karya tidak ditemukan.' });
    }
    const updatedDocument = { ...existing, ...req.body, id: targetId, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/work-categories/:id', requireAuth, async (req, res) => {
  try {
    const col = await getWorkCategoriesCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Kategori karya tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Kategori karya berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.5 EXPERIENCE CATEGORIES CRUD ───────────────────────────────
app.get('/experience-categories', async (req, res) => {
  try {
    const col = await getExperienceCategoriesCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return res.json({ success: true, data: items.length > 0 ? items : defaultExpCategories });
  } catch (err) {
    return res.json({ success: true, data: defaultExpCategories, fallback: true });
  }
});

app.post('/experience-categories', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCategoriesCollection();
    const data = req.body;
    if (!data.id || !data.label) {
      return res.status(400).json({ success: false, error: 'ID (slug) dan Label Kategori Pengalaman wajib diisi.' });
    }
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Kategori pengalaman dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/experience-categories/:id', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCategoriesCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kategori pengalaman tidak ditemukan.' });
    }
    const updatedDocument = { ...existing, ...req.body, id: targetId, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/experience-categories/:id', requireAuth, async (req, res) => {
  try {
    const col = await getExperienceCategoriesCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Kategori pengalaman tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Kategori pengalaman berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.6 ROLE FILTERS CRUD ─────────────────────────────────────────
app.get('/role-filters', async (req, res) => {
  try {
    const col = await getRoleFiltersCollection();
    const items = await col.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    return res.json({ success: true, data: items.length > 0 ? items : defaultRoleFilters });
  } catch (err) {
    return res.json({ success: true, data: defaultRoleFilters, fallback: true });
  }
});

app.post('/role-filters', requireAuth, async (req, res) => {
  try {
    const col = await getRoleFiltersCollection();
    const data = req.body;
    if (!data.id || !data.label) {
      return res.status(400).json({ success: false, error: 'ID dan Label Role Filter wajib diisi.' });
    }
    const existing = await col.findOne({ id: data.id });
    if (existing) {
      return res.status(409).json({ success: false, error: `Role filter dengan ID "${data.id}" sudah ada.` });
    }
    const document = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await col.insertOne(document);
    delete document._id;
    return res.status(201).json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/role-filters/:id', requireAuth, async (req, res) => {
  try {
    const col = await getRoleFiltersCollection();
    const targetId = req.params.id;
    const existing = await col.findOne({ id: targetId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Role filter tidak ditemukan.' });
    }
    const updatedDocument = { ...existing, ...req.body, id: targetId, updatedAt: new Date().toISOString() };
    delete updatedDocument._id;
    await col.replaceOne({ id: targetId }, updatedDocument);
    return res.json({ success: true, data: updatedDocument });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/role-filters/:id', requireAuth, async (req, res) => {
  try {
    const col = await getRoleFiltersCollection();
    const result = await col.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Role filter tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Role filter berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/contact', async (req, res) => {
  try {
    const col = await getContactCollection();
    const item = await col.findOne({ _type: 'contact' }, { projection: { _id: 0, _type: 0 } });
    return res.json({ success: true, data: item || defaultContact });
  } catch (err) {
    return res.json({ success: true, data: defaultContact, fallback: true });
  }
});

app.put('/contact', requireAuth, async (req, res) => {
  try {
    const col = await getContactCollection();
    const data = req.body;
    const document = { ...data, _type: 'contact', updatedAt: new Date().toISOString() };
    await col.replaceOne({ _type: 'contact' }, document, { upsert: true });
    delete document._id;
    delete document._type;
    return res.json({ success: true, data: document });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5.5. DYNAMIC TAXONOMY OPTIONS ENDPOINTS ───────────────────────
app.get('/options', async (req, res) => {
  try {
    const { type, search } = req.query || {};
    if (!type) {
      return res.status(400).json({ success: false, error: 'Query parameter "type" wajib diisi.' });
    }

    const col = await getOptionsCollection();
    const query = { type };
    if (search && typeof search === 'string' && search.trim()) {
      const normSearch = search.trim().toLowerCase();
      query.normalizedValue = { $regex: normSearch, $options: 'i' };
    }

    const items = await col.find(query, { projection: { _id: 0 } }).sort({ value: 1 }).toArray();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('[API /options GET] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/options', requireAuth, async (req, res) => {
  try {
    const { type, value } = req.body || {};
    const validTypes = [
      'production_category', 'institution', 'distribution_platform',
      'script_category', 'script_format', 'script_role',
    ];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Type tidak valid. Harus salah satu dari: ' + validTypes.join(', ') });
    }

    if (!value || typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ success: false, error: 'Value option tidak boleh kosong.' });
    }

    const trimmedValue = value.trim();
    const normalizedValue = trimmedValue.toLowerCase().replace(/\s+/g, ' ');
    const col = await getOptionsCollection();
    const now = new Date().toISOString();

    await col.updateOne(
      { type, normalizedValue },
      {
        $setOnInsert: {
          type,
          value: trimmedValue,
          normalizedValue,
          createdAt: now,
        },
        $set: { updatedAt: now }
      },
      { upsert: true }
    );

    const createdOption = await col.findOne({ type, normalizedValue }, { projection: { _id: 0 } });
    return res.json({ success: true, data: createdOption });
  } catch (err) {
    console.error('[API /options POST] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. CLOUDINARY MEDIA UPLOAD ────────────────────────────────────
app.post('/upload', requireAuth, async (req, res) => {
  try {
    const { file, customPublicId } = req.body || {};
    if (!file) {
      return res.status(400).json({ success: false, error: 'File gambar wajib disertakan.' });
    }

    const uploaded = await uploadImageToCloudinary(file, customPublicId);
    return res.json({ success: true, data: uploaded });
  } catch (err) {
    console.error('[API /upload] Error:', err);
    return res.status(500).json({ success: false, error: `Gagal upload ke Cloudinary: ${err.message}` });
  }
});

// ── 6.1 CLOUDINARY SCRIPT PDF UPLOAD ─────────────────────────────
app.post('/upload/script', requireAuth, async (req, res) => {
  try {
    const { file, customPublicId } = req.body || {};
    if (!file) {
      return res.status(400).json({ success: false, error: 'File PDF wajib disertakan.' });
    }

    try { validatePdfDataUrl(file); } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    const uploaded = await uploadPdfToCloudinary(file, customPublicId);
    return res.json({ success: true, data: uploaded });
  } catch (err) {
    console.error('[API /upload/script] Error:', err);
    return res.status(500).json({ success: false, error: `Gagal upload PDF ke Cloudinary: ${err.message}` });
  }
});

app.post('/upload/script/cleanup', requireAuth, async (req, res) => {
  const { pdfPublicId } = req.body || {};
  if (!pdfPublicId || typeof pdfPublicId !== 'string' || !pdfPublicId.startsWith('porto-zeze/scripts/')) {
    return res.status(400).json({ success: false, error: 'pdfPublicId tidak valid.' });
  }
  await deletePdfFromCloudinary(pdfPublicId);
  return res.json({ success: true });
});

function validatePdfDataUrl(file) {
  if (typeof file !== 'string' || !file.startsWith('data:application/pdf;base64,')) throw new Error('File harus berupa data URL PDF.');
  const encoded = file.slice(file.indexOf(',') + 1);
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error('Ukuran PDF harus di bawah atau sama dengan 20MB.');
  if (bytes.subarray(0, 5).toString() !== '%PDF-' || !bytes.subarray(Math.max(0, bytes.length - 2048)).toString().includes('%%EOF')) {
    throw new Error('File PDF rusak atau tidak valid.');
  }
}

// ── 7. SEED DATA MIGRATION ────────────────────────────────────────
app.post('/migrate', requireAuth, async (req, res) => {
  try {
    const contactCol = await getContactCollection();
    const workCatCol = await getWorkCategoriesCollection();
    const expCatCol = await getExperienceCategoriesCollection();
    const roleFiltersCol = await getRoleFiltersCollection();

    // Contact singleton seed
    await contactCol.replaceOne(
      { _type: 'contact' },
      { ...defaultContact, _type: 'contact', updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    // Configuration seeds
    let workCatMigrated = 0;
    for (const wc of defaultWorkCategories) {
      await workCatCol.updateOne({ id: wc.id }, { $set: wc }, { upsert: true });
      workCatMigrated++;
    }

    let expCatMigrated = 0;
    for (const ec of defaultExpCategories) {
      await expCatCol.updateOne({ id: ec.id }, { $set: ec }, { upsert: true });
      expCatMigrated++;
    }

    let roleFiltersMigrated = 0;
    for (const rf of defaultRoleFilters) {
      await roleFiltersCol.updateOne({ id: rf.id }, { $set: rf }, { upsert: true });
      roleFiltersMigrated++;
    }

    return res.json({
      success: true,
      message: 'Reseed konfigurasi default ke MongoDB berhasil.',
      counts: {
        contact: 1,
        work_categories: workCatMigrated,
        experience_categories: expCatMigrated,
        role_filters: roleFiltersMigrated,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: `Gagal reseed: ${err.message}` });
  }
});

// ── 8. EXPORT DATABASE BACKUP ─────────────────────────────────────
app.get('/export', requireAuth, async (req, res) => {
  try {
    const worksCol = await getWorksCollection();
    const docsCol = await getDocumentationCollection();
    const scriptsCol = await getScriptsCollection();
    const expCol = await getExperienceCollection();
    const eduCol = await getEducationCollection();
    const contactCol = await getContactCollection();
    const optionsCol = await getOptionsCollection();
    const workCatCol = await getWorkCategoriesCollection();
    const expCatCol = await getExperienceCategoriesCollection();
    const roleFiltersCol = await getRoleFiltersCollection();

    const works = await worksCol.find({}, { projection: { _id: 0 } }).toArray();
    const docs = await docsCol.find({}, { projection: { _id: 0 } }).toArray();
    const scripts = await scriptsCol.find({}, { projection: { _id: 0 } }).toArray();
    const exp = await expCol.find({}, { projection: { _id: 0 } }).toArray();
    const edu = await eduCol.find({}, { projection: { _id: 0 } }).toArray();
    const contactDoc = await contactCol.findOne({ _type: 'contact' }, { projection: { _id: 0, _type: 0 } });
    const options = await optionsCol.find({}, { projection: { _id: 0 } }).toArray();
    const workCat = await workCatCol.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    const expCat = await expCatCol.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
    const roleFiltersData = await roleFiltersCol.find({}, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();

    return res.json({
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      source: 'MongoDB PortoZeze',
      works,
      documentation: docs,
      scripts,
      experience: exp,
      education: edu,
      contact: contactDoc || null,
      cms_options: options,
      work_categories: workCat,
      experience_categories: expCat,
      role_filters: roleFiltersData,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
