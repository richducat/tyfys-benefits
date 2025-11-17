import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const PORT = process.env.PORT || 4000;
const MOCK_ZOHO = (process.env.MOCK_ZOHO || 'true') === 'true';

const trackerConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../config/tracker-stages.json'), 'utf-8')
);

const trackers = new Map();

function recomputeTracker(tracker) {
  tracker.stages = trackerConfig.map((stage, index) => {
    const requirementsMet = (stage.requirements || []).every((req) => tracker.events.has(req));
    const previousComplete = index === 0 || tracker.events.has(`${trackerConfig[index - 1].id}:complete`);
    let status = 'locked';
    if (index === 0 || (requirementsMet && previousComplete)) {
      status = tracker.events.has(`${stage.id}:complete`) ? 'complete' : 'current';
    }
    return { ...stage, status, requirementsMet };
  });
  const active = tracker.stages.find((s) => s.status === 'current') || tracker.stages[tracker.stages.length - 1];
  tracker.currentStage = active?.id;
  tracker.percentComplete = Math.round(
    (tracker.stages.filter((s) => s.status === 'complete').length / tracker.stages.length) * 100
  );
  tracker.updatedAt = new Date().toISOString();
  return tracker;
}

function serializeTracker(tracker) {
  return {
    ...tracker,
    events: Array.from(tracker.events),
  };
}

function createTracker() {
  const dealId = nanoid(8);
  const tracker = {
    dealId,
    events: new Set(),
    stages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  trackers.set(dealId, tracker);
  return recomputeTracker(tracker);
}

function markEvent(dealId, event) {
  const tracker = trackers.get(dealId);
  if (!tracker) return null;
  tracker.events.add(event);
  return recomputeTracker(tracker);
}

app.post('/api/signup', (_req, res) => {
  const tracker = createTracker();
  res.json(serializeTracker(tracker));
});

app.get('/api/tracker/:dealId', (req, res) => {
  const tracker = trackers.get(req.params.dealId);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json(serializeTracker(tracker));
});

app.post('/api/contracts/:templateId/create', (req, res) => {
  const { templateId } = req.params;
  const { dealId } = req.body || {};
  const signingUrl = MOCK_ZOHO
    ? `https://mock.zoho-sign/embedded/${templateId}/${dealId || 'demo'}`
    : 'https://zoho.com/sign';
  if (dealId) {
    markEvent(dealId, 'offer:contract_signed');
  }
  res.json({ signingUrl, mock: MOCK_ZOHO });
});

app.post('/api/webhooks/zoho-sign', (req, res) => {
  const { dealId, event = 'offer:contract_signed' } = req.body || {};
  if (!dealId) return res.status(400).json({ error: 'dealId required' });
  const tracker = markEvent(dealId, event);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/webhooks/zoho-forms', (req, res) => {
  const { dealId, event = 'mdbq:completed' } = req.body || {};
  if (!dealId) return res.status(400).json({ error: 'dealId required' });
  const tracker = markEvent(dealId, event);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/appointments/:dealId/schedule', (req, res) => {
  const { dealId } = req.params;
  const { attended = false } = req.body || {};
  const tracker = markEvent(dealId, attended ? 'provider:attended' : 'provider:scheduled');
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/mock/:dealId/complete', (req, res) => {
  const { dealId } = req.params;
  const { stage } = req.body || {};
  if (!stage) return res.status(400).json({ error: 'stage required' });
  const tracker = markEvent(dealId, `${stage}:complete`);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`TYFYS backend listening on ${PORT} (mock Zoho: ${MOCK_ZOHO})`);
});
