import React from 'react';
import { copy } from './data';

export default function App() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TYFYS</div>
          <span className="brand-sub">Evidence & prep for VA claims</span>
        </div>
        <div className="top-actions">
          <button className="ghost">Talk to a Specialist</button>
          <button>Open claim prep assistant</button>
        </div>
      </header>

      <div className="hero-panel">
        <div className="hero-copy">
          {copy.hero.eyebrow && <span className="pill">{copy.hero.eyebrow}</span>}
          <h1>{copy.hero.title}</h1>
          <p className="lead">{copy.hero.body}</p>
          <p className="compliance-line">{copy.hero.compliance}</p>
          <div className="cta-row wrap">
            {copy.hero.actions.map((action) => (
              <div key={action.label} className="cta-tile">
                <button className={action.primary ? '' : 'ghost'}>{action.label}</button>
                <p className="body">{action.description}</p>
              </div>
            ))}
          </div>
          <div className="badges">
            {copy.hero.pills.map((pill) => (
              <span key={pill} className="badge">
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Important information</p>
              <h3>TYFYS keeps you organized</h3>
            </div>
            <div className="progress-stat">Evidence + prep</div>
          </div>
          <ul className="checklist">
            {copy.complianceBlock.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.keepMoving.title}</h2>
          <p className="body" style={{ color: '#415276' }}>
            {copy.keepMoving.body}
          </p>
        </div>
        <div className="tiles three-up">
          {copy.keepMoving.projects.map((project) => (
            <div key={project.id} className="tile">
              <div className="panel-heading" style={{ padding: 0, marginBottom: 10 }}>
                <div>
                  <p className="eyebrow">{project.id}</p>
                  <h3 style={{ margin: '4px 0' }}>{project.title}</h3>
                </div>
                <span className="status-pill">{project.stage}</span>
              </div>
              <p className="body" style={{ color: '#415276' }}>{project.summary}</p>
              <p className="body" style={{ marginTop: 8, fontWeight: 600, color: '#0b172a' }}>
                Next up: {project.nextStep}
              </p>
            </div>
          ))}
        </div>
        <p className="microcopy">{copy.keepMoving.microcopy}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.tracker.title}</h2>
          <p className="body" style={{ color: '#415276' }}>
            {copy.tracker.body}
          </p>
        </div>
        <div className="stage-list">
          {copy.tracker.stages.map((stage) => (
            <div key={stage.name} className="stage-card ready">
              <div className="stage-top">
                <h4>{stage.name}</h4>
                <span className="status-pill">{stage.tag}</span>
              </div>
              <p className="body" style={{ color: '#415276' }}>
                {stage.description}
              </p>
            </div>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <button>{copy.tracker.ctas.addEvidence}</button>
          <button className="ghost">{copy.tracker.ctas.viewAppointments}</button>
        </div>
        <p className="microcopy">{copy.tracker.note}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.claimAssistant.title}</h2>
          <p className="body" style={{ color: '#415276' }}>
            {copy.claimAssistant.body}
          </p>
        </div>
        <p className="microcopy">{copy.claimAssistant.disclaimer}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.tools.title}</h2>
        </div>
        <div className="tiles three-up">
          {copy.tools.items.map((item) => (
            <div key={item.title} className="tile">
              <strong>{item.title}</strong>
              <p className="body" style={{ marginTop: 8, color: '#415276' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.resources.title}</h2>
        </div>
        <div className="tiles two-up">
          {copy.resources.items.map((item) => (
            <div key={item.title} className="tile">
              <strong>{item.title}</strong>
              <p className="body" style={{ marginTop: 8, color: '#415276' }}>
                {item.body}
              </p>
              {item.list && (
                <ul className="checklist">
                  {item.list.map((listItem) => (
                    <li key={listItem}>{listItem}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.forms.title}</h2>
        </div>
        <div className="tiles two-up">
          {copy.forms.items.map((item) => (
            <div key={item.title} className="tile">
              <strong>{item.title}</strong>
              <p className="body" style={{ marginTop: 8, color: '#415276' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{copy.updates.title}</h2>
          <p className="body" style={{ color: '#415276' }}>{copy.updates.body}</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <p className="eyebrow">{copy.complianceBlock.title}</p>
          <h2>Always know what TYFYS does (and doesn’t) do</h2>
        </div>
        <ul className="checklist">
          {copy.complianceBlock.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
