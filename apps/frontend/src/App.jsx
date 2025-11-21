import React, { useState } from 'react';
import axios from 'axios';
import { copy, evidenceChecklists } from './data';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' });

const timeline = [
  'Zoho Sign triggers contract signed and ROI pack.',
  'Deposit received unlocks ITF filing tasks.',
  'Zoho Forms MDBQs advance automatically on submission.',
  'Provider attendance unlocks evidence packaging.',
  'Veteran files on VA.gov; TYFYS is not the VA or a VSO.'
];

export default function App() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const claimAssistantUrl = import.meta.env.VITE_CLAIM_ASSISTANT_URL || '/claim-assistant';

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/signup');
      setTracker(data);
    } catch (e) {
      setError('Could not start demo.');
    } finally {
      setLoading(false);
    }
  };

  const syncTracker = async (dealId) => {
    const { data } = await api.get(`/api/tracker/${dealId}`);
    setTracker(data);
  };

  const trigger = async (path, payload = {}) => {
    if (!tracker) return;
    setLoading(true);
    setError('');
    try {
      await api.post(path.replace(':dealId', tracker.dealId), payload);
      await syncTracker(tracker.dealId);
    } catch (e) {
      setError('Action failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const mockActions = tracker
    ? [
        { label: 'Mark Welcome complete', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'welcome' } },
        {
          label: 'Zoho Sign: Contract signed',
          path: '/api/webhooks/zoho-sign',
          payload: { dealId: tracker.dealId, event: 'offer:contract_signed' }
        },
        { label: 'Mark Offer complete', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'offer' } },
        { label: 'Mark Account setup complete', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'account' } },
        { label: 'Mark ITF verified', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'dd214' } },
        { label: 'Mark Records uploaded', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'records' } },
        { label: 'Mark Intake complete', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'intake' } },
        {
          label: 'Zoho Forms: MDBQs completed',
          path: '/api/webhooks/zoho-forms',
          payload: { dealId: tracker.dealId, event: 'mdbq:completed' }
        },
        { label: 'Mark Provider attended', path: `/api/appointments/${tracker.dealId}/schedule`, payload: { attended: true } },
        { label: 'Mark Evidence complete', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'evidence' } },
        { label: 'Mark Review approved', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'review' } },
        { label: 'Mark Submitted', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'submit' } },
        { label: 'Mark Decision captured', path: `/api/mock/${tracker.dealId}/complete`, payload: { stage: 'decision' } }
      ]
    : [];

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TYFYS</div>
          <span className="brand-sub">Guided medical documentation</span>
        </div>
        <div className="top-actions">
          <a
            className="button-link ghost"
            href={claimAssistantUrl}
            target="_blank"
            rel="noreferrer"
          >
            21-526EZ Form Filler
          </a>
          <button className="ghost">{copy.hero.ctaSecondary}</button>
          <button onClick={handleCreate} disabled={loading}>
            {copy.hero.ctaPrimary}
          </button>
        </div>
      </header>

      <div className="hero-panel">
        <div className="hero-copy">
          <span className="pill">Evidence-first. Tracker-driven.</span>
          <h1>{copy.hero.title}</h1>
          <p className="lead">{copy.hero.subtitle}</p>
          <p className="body">{copy.hero.description}</p>
          <div className="badges">
            {copy.badges.map((badge) => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
          </div>
          <div className="cta-row">
            <button onClick={handleCreate} disabled={loading}>
              {copy.hero.ctaPrimary}
            </button>
            <button className="ghost" disabled>
              {copy.hero.ctaSecondary}
            </button>
          </div>
          {error && <p className="inline-error">{error}</p>}
        </div>
        <div className="hero-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Live tracker snapshot</p>
              <h3>Every step gated and visible</h3>
            </div>
            <div className="progress-stat">{tracker ? `${tracker.percentComplete}%` : 'Start a demo'}</div>
          </div>
          <div className="progress">
            <span style={{ width: `${tracker?.percentComplete || 0}%` }}></span>
          </div>
          <p className="body" style={{ marginTop: 8 }}>
            {tracker ? 'Synced to Zoho Sign and Zoho Forms events.' : 'Launch a demo case to watch the tracker advance.'}
          </p>
          <div className="timeline-grid">
            {timeline.map((item) => (
              <div key={item} className="timeline-chip">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">The TYFYS flow</p>
            <h2>Clear, coordinated steps</h2>
            <p className="body">{copy.overview}</p>
          </div>
          <div className="pill note">Evidence-first. No skipped gates.</div>
        </div>
        <div className="step-grid">
          {copy.howItWorks.map((step, idx) => (
            <div key={step.title} className="step-card">
              <div className="step-index">{idx + 1}</div>
              <div>
                <strong>{step.title}</strong>
                <p className="body" style={{ marginTop: 6 }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="dual-grid">
          <div className="text-block">
            <p className="eyebrow">Your part</p>
            <h2>{copy.role.title}</h2>
            <p className="body">{copy.role.intro}</p>
          </div>
          <div className="text-block">
            <p className="eyebrow">Why veterans pick TYFYS</p>
            <h2>{copy.reasons.title}</h2>
            <div className="tiles">
              {copy.reasons.points.map((point) => (
                <div key={point.heading} className="tile">
                  <strong>{point.heading}</strong>
                  <p className="body" style={{ marginTop: 6 }}>
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="dual-grid">
          <div>
            <div className="panel-heading">
              <h2>{copy.deliverables.title}</h2>
              <p className="body">Everything organized for a confident submission.</p>
            </div>
            <ul className="checklist">
              {copy.deliverables.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="panel-heading">
              <h2>{copy.whoWeHelp.title}</h2>
              <p className="body">Wherever you are in the process, TYFYS keeps it moving.</p>
            </div>
            <ul className="checklist">
              {copy.whoWeHelp.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Focused conditions</p>
            <h2>{copy.conditions.title}</h2>
            <p className="body">{copy.conditions.note}</p>
          </div>
          <div className="pill note">Provider-led documentation</div>
        </div>
        <div className="chip-grid">
          {copy.conditions.items.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.quotes.title}</h2>
          <p className="body">Straight from veterans who used the tracker and portal.</p>
        </div>
        <div className="tiles three-up">
          {copy.quotes.list.map((quote) => (
            <div key={quote} className="tile">
              {quote}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="dual-grid align-start">
          <div className="faq-block">
            <div className="panel-heading">
              <p className="eyebrow">Answers before you start</p>
              <h2>{copy.faq.title}</h2>
            </div>
            <div className="accordion">
              {copy.faq.items.map((item) => (
                <div key={item.question} className="accordion-item">
                  <div className="accordion-title">{item.question}</div>
                  <p className="body">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="tracker-block">
            <div className="panel-heading">
              <p className="eyebrow">Pizza-tracker</p>
              <h2>Live stages</h2>
              <p className="body">Each stage is gated and synced to Zoho Sign and Zoho Forms.</p>
            </div>
            {tracker ? (
              <div className="stage-list">
                {tracker.stages.map((stage) => (
                  <div key={stage.id} className={`stage-card ${stage.status}`}>
                    <div className="stage-top">
                      <h4>{stage.name}</h4>
                      <span className="status-pill">{stage.status}</span>
                    </div>
                    <div className="stage-meta">
                      <span>Status: {stage.status}</span>
                      {stage.allowsSpecialist && <span>• Talk to a Specialist available</span>}
                    </div>
                    <p className="body" style={{ marginTop: 8 }}>
                      {stage.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body">Start a demo case to see the live tracker and gates.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Mock actions</h2>
          <p className="body">Simulate Zoho Sign/Forms events and provider attendance.</p>
        </div>
        <div className="action-grid">
          {mockActions.map((action) => (
            <button
              key={action.label}
              className="tile action"
              onClick={() => trigger(action.path, action.payload)}
              disabled={loading}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Education modules baked in</h2>
          <p className="body">Guides that keep veterans informed without slowing the process.</p>
        </div>
        <div className="chip-grid">
          {copy.education.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
        <p className="body" style={{ marginTop: 12, fontWeight: 600 }}>{copy.disclaimer}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Evidence by condition</h2>
          <p className="body">Structured checklists tailored to each condition.</p>
        </div>
        <div className="tiles two-up">
          {Object.entries(evidenceChecklists).map(([condition, tasks]) => (
            <div key={condition} className="tile">
              <strong>{condition}</strong>
              <ul className="checklist">
                {tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Pricing (transparent)</h2>
          <p className="body">{copy.pricing.summary}</p>
        </div>
        <div className="tiles four-up">
          {copy.pricing.tiers.map((tier) => (
            <div key={tier.name} className="tile pricing">
              <strong>{tier.name}</strong>
              <div className="price">{tier.price}</div>
              <small>{tier.detail}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
