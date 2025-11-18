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
    <div className="app-shell">
      <div className="hero">
        <div>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.subtitle}</p>
          <div className="badges">
            {copy.badges.map((badge) => (
              <span key={badge} className="badge">{badge}</span>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button onClick={handleCreate} disabled={loading}> {copy.hero.ctaPrimary} </button>
            <button className="secondary" disabled> {copy.hero.ctaSecondary} </button>
          </div>
          {error && <p style={{ color: '#ffb4b4', marginTop: 12 }}>{error}</p>}
        </div>
        <div>
          <h3 style={{ marginTop: 0 }}>TYFYS Tracker Snapshot</h3>
          <p style={{ marginBottom: 12 }}>Every step is gated so nothing is skipped. Zoho Sign and Zoho Forms are the sources of truth.</p>
          <div className="progress">
            <span style={{ width: `${tracker?.percentComplete || 0}%` }}></span>
          </div>
          <p style={{ marginTop: 8, fontWeight: 700 }}>{tracker ? `${tracker.percentComplete}% complete` : 'Start a demo to view progress'}</p>
          <ul className="timeline">
            {timeline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section">
        <h2>How TYFYS Works</h2>
        <p style={{ marginTop: 0 }}>{copy.overview}</p>
        <div className="tools-grid">
          {copy.howItWorks.map((step) => (
            <div key={step.title} className="tool-card">
              <strong>{step.title}</strong>
              <p style={{ marginTop: 8 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{copy.role.title}</h2>
        <p style={{ marginTop: 0 }}>{copy.role.intro}</p>
      </div>

      <div className="section">
        <h2>{copy.reasons.title}</h2>
        <div className="tools-grid">
          {copy.reasons.points.map((point) => (
            <div key={point.heading} className="tool-card">
              <strong>{point.heading}</strong>
              <p style={{ marginTop: 8 }}>{point.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="tracker-grid">
          <div>
            <h2>{copy.deliverables.title}</h2>
            <ul className="checklist">
              {copy.deliverables.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{copy.whoWeHelp.title}</h2>
            <ul className="checklist">
              {copy.whoWeHelp.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>{copy.conditions.title}</h2>
        <div className="tools-grid">
          {copy.conditions.items.map((item) => (
            <div key={item} className="tool-card">{item}</div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontWeight: 600 }}>{copy.conditions.note}</p>
      </div>

      <div className="section">
        <h2>{copy.quotes.title}</h2>
        <div className="tools-grid">
          {copy.quotes.list.map((quote) => (
            <div key={quote} className="tool-card">{quote}</div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{copy.faq.title}</h2>
        <div className="tools-grid">
          {copy.faq.items.map((item) => (
            <div key={item.question} className="tool-card">
              <strong>{item.question}</strong>
              <p style={{ marginTop: 8 }}>{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="tracker-grid">
          <div>
            <h2>Pizza-tracker</h2>
            {tracker ? (
              <div>
                {tracker.stages.map((stage) => (
                  <div key={stage.id} className={`stage-card ${stage.status}`}>
                    <h4>{stage.name}</h4>
                    <div className="stage-meta">
                      <span>Status: {stage.status}</span>
                      {stage.allowsSpecialist && <span>• Talk to a Specialist available</span>}
                    </div>
                    <p style={{ marginTop: 8 }}>{stage.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Start a demo case to see the live tracker and gates.</p>
            )}
          </div>
          <div>
            <h2>Mock actions</h2>
            <p style={{ marginTop: 0 }}>Use these to simulate Zoho Sign/Forms webhooks and provider attendance.</p>
            <div className="tools-grid">
              {mockActions.map((action) => (
                <button
                  key={action.label}
                  className="tool-card"
                  onClick={() => trigger(action.path, action.payload)}
                  disabled={loading}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Education modules baked in</h2>
        <div className="tools-grid">
          {copy.education.map((item) => (
            <div key={item} className="tool-card">{item}</div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontWeight: 600 }}>{copy.disclaimer}</p>
      </div>

      <div className="section">
        <h2>Evidence by condition</h2>
        <div className="tools-grid">
          {Object.entries(evidenceChecklists).map(([condition, tasks]) => (
            <div key={condition} className="tool-card">
              <strong>{condition}</strong>
              <ul className="checklist">
                {tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Pricing (transparent)</h2>
        <p>{copy.pricing.summary}</p>
        <div className="tools-grid">
          {copy.pricing.tiers.map((tier) => (
            <div key={tier.name} className="tool-card">
              <strong>{tier.name}</strong>
              <div>{tier.price}</div>
              <small>{tier.detail}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
