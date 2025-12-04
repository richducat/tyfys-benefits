import React, { useEffect, useMemo, useState } from 'react';
import { copy } from './data';
import {
  loadAccountState,
  loadOnboardingState,
  saveAccountState,
  saveOnboardingState
} from './accountStorage';

function generateRandomState() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(4);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, (num) => num.toString(16).padStart(8, '0')).join('');
  }

  return Math.random().toString(36).slice(2);
}

const defaultAccountState = {
  email: '',
  password: '',
  displayName: '',
  phone: '',
  loggedIn: false
};

const defaultOnboardingState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  contactPreference: 'Call or text',
  notes: '',
  completed: false
};

function OnboardingForm({ onboarding, onSubmit, saving, feedback }) {
  const [formState, setFormState] = useState(onboarding);

  useEffect(() => {
    setFormState(onboarding);
  }, [onboarding]);

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <form className="onboarding-form" onSubmit={handleSubmit}>
      <div className="panel-heading" style={{ padding: 0 }}>
        <div>
          <p className="eyebrow">Contact & login</p>
          <h3>Save your TYFYS access</h3>
          <p className="body" style={{ color: '#415276' }}>
            We keep this on your device so you stay logged in and can pick up claim prep without retyping details.
          </p>
        </div>
        <span className="status-pill">Required</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            required
            value={formState.fullName}
            placeholder="Your name"
            onChange={(event) => updateField('fullName', event.target.value)}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            value={formState.email}
            placeholder="you@service.com"
            onChange={(event) => updateField('email', event.target.value)}
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            type="tel"
            required
            value={formState.phone}
            placeholder="(555) 123-4567"
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </label>
        <label className="field">
          <span>Password (saved locally)</span>
          <input
            type="password"
            required
            value={formState.password}
            placeholder="Create a password to store on this device"
            onChange={(event) => updateField('password', event.target.value)}
          />
        </label>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Contact preference</span>
          <select
            value={formState.contactPreference}
            onChange={(event) => updateField('contactPreference', event.target.value)}
          >
            <option>Call or text</option>
            <option>Text only</option>
            <option>Call only</option>
            <option>Email follow-up</option>
          </select>
        </label>
        <label className="field">
          <span>Notes for your specialist (optional)</span>
          <textarea
            value={formState.notes}
            placeholder="Add context about your claim goals or schedule."
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </label>
      </div>

      <div className="form-footer">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving and keeping you logged in...' : 'Submit & stay logged in'}
        </button>
        <p className="microcopy">
          Completing this contact step sets your login and saves onboarding details locally so returning visits remember you.
        </p>
        {feedback && <p className="note microcopy">{feedback}</p>}
      </div>
    </form>
  );
}

function OnboardingSummary({ onboarding }) {
  return (
    <div className="summary-card">
      <div className="panel-heading" style={{ padding: 0 }}>
        <div>
          <p className="eyebrow">Saved onboarding</p>
          <h3>You are ready to resume</h3>
          <p className="body" style={{ color: '#415276' }}>
            We kept your login active and stored your latest contact details for your TYFYS specialist.
          </p>
        </div>
        <span className="status-pill">Complete</span>
      </div>
      <ul className="checklist">
        <li>
          <strong>Contact:</strong> {onboarding.fullName || 'Name on file'} · {onboarding.email}
        </li>
        <li>
          <strong>Phone:</strong> {onboarding.phone || 'Pending'} ({onboarding.contactPreference})
        </li>
        <li>
          <strong>Secure access:</strong> Password saved for this device
        </li>
      </ul>
      <p className="microcopy">Need a change? Log out to switch accounts, or update your saved info below.</p>
    </div>
  );
}

function AccountAccessPanel({ account, onboardingComplete, loggedIn, onLogin, onLogout }) {
  const [loginEmail, setLoginEmail] = useState(account.email);
  const [loginPassword, setLoginPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoginEmail(account.email);
  }, [account.email]);

  const hasSavedCredentials = useMemo(
    () => Boolean(account.email && account.password),
    [account.email, account.password]
  );

  const handleLogin = (event) => {
    event.preventDefault();
    if (!hasSavedCredentials) {
      setStatus('No saved login yet. Complete the contact step to create one.');
      return;
    }

    if (loginEmail === account.email && loginPassword === account.password) {
      onLogin();
      setStatus('Welcome back—your saved TYFYS login is active.');
      setLoginPassword('');
    } else {
      setStatus('Email or password does not match your saved login.');
    }
  };

  const handleLogout = () => {
    onLogout();
    setStatus('You signed out. Your saved details stay on this device until you clear them.');
    setLoginPassword('');
  };

  return (
    <div className="account-panel">
      <div className="panel-heading" style={{ padding: 0, marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Account access</p>
          <h3>{loggedIn ? 'You are signed in' : 'Use your saved login'}</h3>
        </div>
        {loggedIn && <span className="status-pill">Logged in</span>}
      </div>

      {loggedIn ? (
        <div className="account-summary">
          <p className="body" style={{ color: '#0b172a' }}>
            Thanks, {account.displayName || 'TYFYS veteran'}. Your onboarding info stays active here.
          </p>
          <p className="microcopy">We remember your saved credentials on this device so you can jump straight into TYFYS.</p>
          <div className="cta-row">
            <button type="button" className="ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-grid">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={loginEmail}
                placeholder="you@service.com"
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={loginPassword}
                placeholder="Saved password"
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </label>
          </div>
          <div className="form-footer">
            <button type="submit">Sign in with saved account</button>
            <p className="microcopy">
              {hasSavedCredentials
                ? 'We store your credentials locally so the hero form stays hidden once you are done onboarding.'
                : 'Complete the contact step to set up your saved login for this device.'}
            </p>
          </div>
        </form>
      )}

      {status && <p className="note microcopy">{status}</p>}
      {onboardingComplete && !loggedIn && (
        <p className="microcopy" style={{ marginTop: 8 }}>
          We found completed onboarding details. Sign in with your saved password to continue.
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [accountState, setAccountState] = useState(() => loadAccountState() || defaultAccountState);
  const [onboardingState, setOnboardingState] = useState(
    () => loadOnboardingState() || defaultOnboardingState
  );
  const [saving, setSaving] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState('');

  const onboardingComplete = onboardingState?.completed;
  const loggedIn = accountState?.loggedIn && onboardingComplete;

  useEffect(() => {
    saveAccountState(accountState);
  }, [accountState]);

  useEffect(() => {
    saveOnboardingState(onboardingState);
  }, [onboardingState]);

  useEffect(() => {
    if (onboardingComplete && !accountState.loggedIn && accountState.email && accountState.password) {
      setAccountState((prev) => ({ ...prev, loggedIn: true }));
    }
    // We only hydrate login on the initial mount to respect manual sign-outs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingSubmit = (payload) => {
    setSubmissionFeedback('');
    setSaving(true);
    const completedOnboarding = {
      ...payload,
      completed: true
    };

    setOnboardingState(completedOnboarding);
    setAccountState({
      email: payload.email,
      password: payload.password,
      displayName: payload.fullName,
      phone: payload.phone,
      loggedIn: true
    });
    setSubmissionFeedback('Saved your login and onboarding details for this device.');
    setSaving(false);
  };

  const handleLogin = () => {
    setAccountState((prev) => ({ ...prev, loggedIn: true }));
  };

  const handleLogout = () => {
    setAccountState((prev) => ({ ...prev, loggedIn: false }));
  };

  const handleTeslaConnect = () => {
    const clientId =
      process.env.NEXT_PUBLIC_TESLA_CLIENT_ID ||
      (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_TESLA_CLIENT_ID) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TESLA_CLIENT_ID);

    if (!clientId) {
      alert('Tesla client ID is not configured.');
      return;
    }

    const authUrl =
      'https://auth.tesla.com/oauth2/v3/authorize' +
      '?response_type=code' +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent('https://teslahelper.app/auth/callback')}` +
      '&scope=openid offline_access user_data vehicle_device_data vehicle_cmds vehicle_charging_cmds' +
      `&state=${generateRandomState()}`;

    window.location.href = authUrl;
  };

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
          <button onClick={handleTeslaConnect}>Connect</button>
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
        <div className="hero-card" style={{ gap: 16 }}>
          <AccountAccessPanel
            account={accountState}
            onboardingComplete={onboardingComplete}
            loggedIn={loggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          {loggedIn && onboardingComplete ? (
            <OnboardingSummary onboarding={onboardingState} />
          ) : (
            <OnboardingForm
              onboarding={onboardingState}
              onSubmit={handleOnboardingSubmit}
              saving={saving}
              feedback={submissionFeedback}
            />
          )}
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
