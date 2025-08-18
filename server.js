// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'pins.json');

function readPins() {
  try { return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')); }
  catch { return []; }
}
function writePins(pins) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(pins, null, 2));
}

app.post('/save-pin', (req, res) => {
  const { pin, ts, ua } = req.body || {};
  if (!pin) return res.status(400).json({ error: 'pin required' });
  const pins = readPins();
  pins.push({ pin, ts: ts || new Date().toISOString(), ua: ua || '' });
  writePins(pins);
  res.json({ status: 'ok' });
});

app.get('/get-pins', (req, res) => {
  res.json(readPins());
});

app.get('/export-pins.csv', (req, res) => {
  const pins = readPins();
  const header = ['pin','timestamp','user_agent'];
  const rows = pins.map(p => [`"${String(p.pin).replace(/"/g,'""')}"`, p.ts || '', `"${String(p.ua||'').replace(/"/g,'""')}"`]);
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="kxguard_pins_export.csv"');
  res.send(csv);
});

app.get('/', (req, res) => res.send('KXGuard API running'));

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
