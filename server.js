const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'endre-dette-til-noe-hemmelig';
const STATE_FILE = path.join(__dirname, 'state.json');
const VISITS_FILE = path.join(__dirname, 'visits.json');

// --- State persistence ---

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (_) {}
  return { home: false, updatedAt: new Date().toISOString(), source: 'manual' };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

let state = loadState();

// --- Visit logging ---

function loadVisits() {
  try {
    if (fs.existsSync(VISITS_FILE)) {
      return JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function logVisit(ip) {
  const visits = loadVisits();
  const now = new Date();
  // Date key in Oslo timezone
  const dateKey = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  const time = now.toLocaleTimeString('sv-SE', { timeZone: 'Europe/Oslo' });

  if (!visits[dateKey]) visits[dateKey] = [];
  visits[dateKey].push({ time, ip: ip || 'ukjent' });
  fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
}

// --- Middleware ---

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes ---

// Public: get current status
app.get('/api/status', (req, res) => {
  // Log visit on first fetch (not polls) — client sends header on initial load
  if (req.headers['x-initial-load']) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    logVisit(ip);
  }

  res.json({
    home: state.home,
    updatedAt: state.updatedAt,
    source: state.source || 'manual',
  });
});

// Admin: get visit log
app.get('/api/visits', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Ugyldig token' });
  }
  res.json(loadVisits());
});

// Admin: update status (requires token)
app.post('/api/status', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Ugyldig token' });
  }

  const { home, source } = req.body;
  if (typeof home !== 'boolean') {
    return res.status(400).json({ error: 'Feltet "home" må være true eller false' });
  }

  state.home = home;
  state.updatedAt = new Date().toISOString();
  state.source = source === 'phone' ? 'phone' : 'manual';
  saveState(state);

  res.json({
    home: state.home,
    updatedAt: state.updatedAt,
    source: state.source,
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve admin page
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback to visitor page
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hjemme-server kjører på port ${PORT}`);
  console.log(`Admin-token: ${ADMIN_TOKEN}`);
});
