const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'endre-dette-til-noe-hemmelig';
const STATE_FILE = path.join(__dirname, 'state.json');

// --- State persistence ---

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (_) {}
  return { home: false, updatedAt: new Date().toISOString() };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

let state = loadState();

// --- Middleware ---

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes ---

// Public: get current status
app.get('/api/status', (_req, res) => {
  res.json({
    home: state.home,
    updatedAt: state.updatedAt,
  });
});

// Admin: update status (requires token)
app.post('/api/status', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Ugyldig token' });
  }

  const { home } = req.body;
  if (typeof home !== 'boolean') {
    return res.status(400).json({ error: 'Feltet "home" må være true eller false' });
  }

  state.home = home;
  state.updatedAt = new Date().toISOString();
  saveState(state);

  res.json({
    home: state.home,
    updatedAt: state.updatedAt,
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
