const React = window.React;
const ReactDOM = window.ReactDOM;
const { useEffect, useMemo, useState } = React;

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function formatShortDate(value) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatRelative(value) {
  if (!value) return "No recent activity";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No recent activity";
  const diffMs = parsed.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffHours, "hour");
  }
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffDays, "day");
}

function formatStageId(value) {
  const directLabels = {
    totalCustomers: "Total Customers",
    activeCustomers: "Active Cases",
    paidCustomers: "Paid Customers",
    recordsInFlight: "Records In Flight",
    readyToSubmit: "Ready To Submit",
    dd214_itf: "DD214 / ITF",
    mdbqs: "MDBQs",
  };
  if (directLabels[value]) return directLabels[value];
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function asDateInput(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function joinList(items) {
  return Array.isArray(items) ? items.join(", ") : "";
}

function parseList(text) {
  return String(text || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function replaceCustomerRecord(customers, nextCustomer) {
  return customers.map((customer) => (customer.userId === nextCustomer.userId ? nextCustomer : customer));
}

function buildDraft(customer) {
  return {
    stage: customer?.stage || "welcome",
    owner: customer?.owner || "",
    priority: customer?.priority || "normal",
    status: customer?.status || "active",
    nextStep: customer?.nextStep || "",
    dueAt: asDateInput(customer?.dueAt),
    lastContactAt: asDateInput(customer?.lastContactAt),
    tagsText: joinList(customer?.tags),
    blockersText: Array.isArray(customer?.blockers) ? customer.blockers.join("\n") : "",
    tasks: Array.isArray(customer?.tasks)
      ? customer.tasks.map((task) => ({
          id: task.id,
          label: task.label,
          stageId: task.stageId,
          done: Boolean(task.done),
          completedAt: task.completedAt || "",
        }))
      : [],
  };
}

const PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function getTimeValue(value, fallback = Number.POSITIVE_INFINITY) {
  if (!value) return fallback;
  const parsed = new Date(value);
  const time = parsed.getTime();
  return Number.isNaN(time) ? fallback : time;
}

function isOverdue(value) {
  const dueAt = getTimeValue(value);
  if (!Number.isFinite(dueAt)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueAt < today.getTime();
}

function isDueSoon(value) {
  const dueAt = getTimeValue(value);
  if (!Number.isFinite(dueAt)) return false;
  const now = Date.now();
  const diffMs = dueAt - now;
  return diffMs >= 0 && diffMs <= 1000 * 60 * 60 * 24 * 7;
}

function getTaskSummary(customer) {
  const tasks = Array.isArray(customer?.tasks) ? customer.tasks : [];
  const completed = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const nextTask = tasks.find((task) => !task.done) || null;

  return {
    completed,
    total,
    percent,
    nextTask,
  };
}

function getLatestNote(customer) {
  if (!Array.isArray(customer?.notes) || !customer.notes.length) return null;
  return customer.notes[customer.notes.length - 1] || null;
}

function needsAttention(customer) {
  return (
    customer?.priority === "urgent" ||
    customer?.priority === "high" ||
    isOverdue(customer?.dueAt) ||
    (Array.isArray(customer?.blockers) && customer.blockers.length > 0)
  );
}

function matchesStageFilter(customer, stageFilter) {
  if (!stageFilter) return true;
  if (stageFilter === "attention") return needsAttention(customer);
  return customer.stage === stageFilter;
}

function getDueLabel(value) {
  if (!value) return "No due date";
  if (isOverdue(value)) return `Overdue ${formatShortDate(value)}`;
  if (isDueSoon(value)) return `Due soon ${formatShortDate(value)}`;
  return `Due ${formatShortDate(value)}`;
}

function compareByAttention(left, right) {
  const priorityDiff =
    (PRIORITY_ORDER[left.priority] ?? PRIORITY_ORDER.normal) -
    (PRIORITY_ORDER[right.priority] ?? PRIORITY_ORDER.normal);
  if (priorityDiff !== 0) return priorityDiff;

  const overdueDiff = Number(isOverdue(right.dueAt)) - Number(isOverdue(left.dueAt));
  if (overdueDiff !== 0) return overdueDiff;

  const blockerDiff =
    Number(Array.isArray(right.blockers) && right.blockers.length > 0) -
    Number(Array.isArray(left.blockers) && left.blockers.length > 0);
  if (blockerDiff !== 0) return blockerDiff;

  const leftDue = getTimeValue(left.dueAt);
  const rightDue = getTimeValue(right.dueAt);
  const duePresenceDiff = Number(Number.isFinite(rightDue)) - Number(Number.isFinite(leftDue));
  if (duePresenceDiff !== 0) return duePresenceDiff;
  if (Number.isFinite(leftDue) && Number.isFinite(rightDue) && leftDue !== rightDue) {
    return leftDue - rightDue;
  }

  const nextStepDiff = Number(Boolean(right.nextStep)) - Number(Boolean(left.nextStep));
  if (nextStepDiff !== 0) return nextStepDiff;

  return getTimeValue(right.updatedAt, 0) - getTimeValue(left.updatedAt, 0);
}

function compareCustomers(left, right, sortMode) {
  if (sortMode === "name") {
    return String(left.displayName || left.email || "").localeCompare(String(right.displayName || right.email || ""));
  }

  if (sortMode === "updated") {
    return getTimeValue(right.updatedAt, 0) - getTimeValue(left.updatedAt, 0);
  }

  if (sortMode === "due") {
    const leftDue = getTimeValue(left.dueAt);
    const rightDue = getTimeValue(right.dueAt);
    const duePresenceDiff = Number(Number.isFinite(rightDue)) - Number(Number.isFinite(leftDue));
    if (duePresenceDiff !== 0) return duePresenceDiff;
    if (Number.isFinite(leftDue) && Number.isFinite(rightDue) && leftDue !== rightDue) {
      return leftDue - rightDue;
    }
    return compareByAttention(left, right);
  }

  return compareByAttention(left, right);
}

function buildOverviewStats(customers, metrics) {
  return [
    {
      id: "totalCustomers",
      label: "Total customers",
      value: metrics?.totalCustomers ?? customers.length,
      note: "live customer records in the private queue",
    },
    {
      id: "attention",
      label: "Needs attention",
      value: customers.filter((customer) => needsAttention(customer)).length,
      note: "urgent, blocked, or overdue cases",
    },
    {
      id: "dueSoon",
      label: "Due this week",
      value: customers.filter((customer) => isOverdue(customer.dueAt) || isDueSoon(customer.dueAt)).length,
      note: "cases with upcoming deadlines",
    },
    {
      id: "recordsInFlight",
      label: "Records in flight",
      value: metrics?.recordsInFlight ?? 0,
      note: "customers already collecting records",
    },
    {
      id: "readyToSubmit",
      label: "Ready to submit",
      value: metrics?.readyToSubmit ?? customers.filter((customer) => customer.stage === "ready_to_submit").length,
      note: "files ready for the final handoff",
    },
  ];
}

function HeroPanel({ viewer, metrics, customers }) {
  const overview = buildOverviewStats(customers, metrics);

  return (
    <section className="crm-panel crm-panel-strong crm-summary">
      <div className="crm-summary-top">
        <div className="crm-summary-copy">
          <p className="crm-kicker">TYFYS CRM</p>
          <h1 className="crm-summary-title">One work queue for customers, SOP steps, and next actions.</h1>
          <p className="crm-summary-subtitle">
            The CRM now centers on who needs attention, what the next step is, and which SOP task
            is blocking the case from moving forward.
          </p>
        </div>

        <aside className="crm-session-card">
          <div>
            <p className="crm-kicker">Signed in</p>
            <h2 className="crm-login-title">{viewer?.displayName || viewer?.email || "TYFYS team"}</h2>
            <p className="crm-login-copy">{viewer?.email || "internal account"} can manage live CRM data.</p>
          </div>

          <div className="crm-badge-row">
            <span className="crm-badge">Private workspace</span>
            <span className="crm-badge crm-badge-ok">SOP tracking</span>
            <span className="crm-badge crm-badge-warm">Live app data</span>
          </div>
        </aside>
      </div>

      <div className="crm-summary-grid">
        {overview.map((item) => (
          <article className="crm-stat-card" key={item.id}>
            <span className="crm-caption">{item.label}</span>
            <strong className="crm-stat-value">{item.value}</strong>
            <p className="crm-stat-note">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StageStrip({ stages, customers, activeStage, onStageChange }) {
  const stageCounts = useMemo(() => {
    const counts = new Map(stages.map((stage) => [stage.id, 0]));
    customers.forEach((customer) => {
      counts.set(customer.stage, (counts.get(customer.stage) || 0) + 1);
    });
    return counts;
  }, [customers, stages]);

  const cards = [
    {
      id: "",
      label: "All visible",
      count: customers.length,
      note: "every result in the current queue",
    },
    {
      id: "attention",
      label: "Needs attention",
      count: customers.filter((customer) => needsAttention(customer)).length,
      note: "urgent, blocked, or overdue cases",
    },
    ...stages.map((stage) => ({
      id: stage.id,
      label: stage.label,
      count: stageCounts.get(stage.id) || 0,
      note: stage.description || "SOP pipeline stage",
    })),
  ];

  return (
    <section className="crm-panel crm-stage-strip">
      <div className="crm-stage-grid">
        {cards.map((card) => (
          <button
            key={card.id || "all"}
            type="button"
            className={`crm-stage-card${activeStage === card.id ? " active" : ""}`}
            onClick={() => onStageChange(card.id)}
          >
            <span className="crm-caption">{card.label}</span>
            <strong className="crm-stage-count">{card.count}</strong>
            <p className="crm-stage-note">{card.note}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function Filters({ filters, stages, owners, onChange }) {
  return (
    <div className="crm-filter-bar">
      <div className="crm-filter-item">
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>🔍</span>
        <input
          className="crm-filter-input"
          type="search"
          placeholder="Search cases..."
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </div>
      
      <div className="crm-filter-group">
        <select
          className="crm-filter-select"
          value={filters.stage}
          onChange={(event) => onChange({ ...filters, stage: event.target.value })}
        >
          <option value="">All stages</option>
          <option value="attention">Needs attention</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>{stage.label}</option>
          ))}
        </select>
        
        <select
          className="crm-filter-select"
          value={filters.owner}
          onChange={(event) => onChange({ ...filters, owner: event.target.value })}
        >
          <option value="">All owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>
        
        <select
          className="crm-filter-select"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        >
          <option value="">Status filter</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="crm-filter-select"
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value })}
        >
          <option value="attention">Needs attention first</option>
          <option value="due">Due date</option>
          <option value="updated">Recently updated</option>
          <option value="name">Customer name</option>
        </select>
      </div>
    </div>
  );
}

function CustomerRow({ customer, selected, onSelect, onDragStart }) {
  const taskSummary = getTaskSummary(customer);
  const latestNote = getLatestNote(customer);
  const dueLabel = getDueLabel(customer.dueAt);
  const priorityClass =
    customer.priority === "urgent" ? "urgent" : customer.priority === "high" ? "warn" : "";
  const nextFocus =
    customer.nextStep || taskSummary.nextTask?.label || "Add the next concrete step for this case.";

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, customer)}
      className={`crm-list-card${selected ? " active" : ""}`}
      onClick={() => onSelect(customer.userId)}
    >
      <div className="crm-list-head">
        <div>
          <h3 className="crm-card-name">{customer.displayName || customer.email || "Unnamed customer"}</h3>
          <p className="crm-card-meta">
            {customer.email || "No email on file"} · {customer.owner || "Unassigned"}
          </p>
        </div>

        <div className="crm-badge-row" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className="crm-token primary">{customer.stageLabel}</span>
          <span className={`crm-token ${priorityClass}`}>{formatStageId(customer.priority)}</span>
        </div>
      </div>

      <div className="crm-meta-list" style={{ gap: '6px' }}>
        <span className="crm-token">{formatStageId(customer.status)}</span>
        <span className={`crm-token${isOverdue(customer.dueAt) ? " danger" : isDueSoon(customer.dueAt) ? " secondary" : ""}`}>
          {dueLabel}
        </span>
        {customer.paymentCompleted ? <span className="crm-token ok">Paid</span> : null}
        {customer.dossierCount ? <span className="crm-token">{customer.dossierCount} records</span> : null}
      </div>

      <p className="crm-list-focus">{nextFocus}</p>

      <div className="crm-progress-row">
        <div className="crm-progress-track">
          <span style={{ width: `${taskSummary.percent}%` }} />
        </div>
        <span className="crm-mini-copy">
          SOP {taskSummary.completed}/{taskSummary.total}
        </span>
      </div>

      <div className="crm-row-between">
        <span className="crm-mini-copy">
          {taskSummary.nextTask ? `Next SOP: ${taskSummary.nextTask.label}` : "SOP checklist complete"}
        </span>
        <span className="crm-mini-copy">
          {customer.lastContactAt
            ? `Last contact ${formatShortDate(customer.lastContactAt)}`
            : `Updated ${formatRelative(customer.updatedAt)}`}
        </span>
      </div>

      {Array.isArray(customer.blockers) && customer.blockers.length ? (
        <div className="crm-chip-row">
          {customer.blockers.slice(0, 2).map((blocker) => (
            <span className="crm-token warn" key={blocker}>
              {blocker}
            </span>
          ))}
        </div>
      ) : null}

      {latestNote?.text ? <p className="crm-list-note">{latestNote.text}</p> : null}
    </div>
  );
}

function CustomerQueue({ customers, selectedUserId, onSelect, hasActiveFilters, onClearFilters }) {
  return (
    <section className="crm-panel crm-queue">
      <div className="crm-queue-head">
        <div>
          <p className="crm-kicker">Customer queue</p>
          <h2 className="crm-section-title">Action list</h2>
          <p className="crm-status-copy">
            The queue surfaces urgent, blocked, and due cases first so the team can work from top
            to bottom.
          </p>
        </div>

        <div className="crm-chip-row">
          <span className="crm-chip">{customers.length} in queue</span>
          {hasActiveFilters ? (
            <button className="crm-button secondary crm-button-small" type="button" onClick={onClearFilters}>
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="crm-queue-list">
        {customers.length ? (
          customers.map((customer) => (
            <CustomerRow
              key={customer.userId}
              customer={customer}
              selected={customer.userId === selectedUserId}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="crm-list-card">
            <p className="crm-empty-copy">No customers match the current filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DetailPanel({
  customer,
  draft,
  noteDraft,
  stages,
  onDraftChange,
  onToggleTask,
  onNoteChange,
  onSave,
  saveState,
}) {
  if (!customer || !draft) {
    return (
      <aside className="crm-panel crm-detail">
        <div className="crm-section">
          <p className="crm-kicker">Customer detail</p>
          <h2 className="crm-detail-title">Select a customer</h2>
          <p className="crm-detail-meta">
            Pick a customer from the queue to update ownership, next step, blockers, SOP progress,
            and private notes.
          </p>
        </div>
      </aside>
    );
  }

  const taskSummary = getTaskSummary(draft);
  const currentStage = stages.find((stage) => stage.id === draft.stage) || null;
  const draftBlockers = parseList(draft.blockersText);
  const priorityClass = draft.priority === "urgent" ? "urgent" : draft.priority === "high" ? "warn" : "";

  return (
    <aside className="crm-panel crm-panel-strong crm-detail">
      <section className="crm-section">
        <div className="crm-detail-top">
          <div>
            <p className="crm-kicker">Customer detail</p>
            <h2 className="crm-detail-title">{customer.displayName}</h2>
            <p className="crm-detail-meta">{customer.email || "No email on file"}</p>
          </div>

          <div className="crm-chip-row">
            <span className="crm-badge">{currentStage?.label || customer.stageLabel}</span>
            <span className={`crm-token ${priorityClass}`}>{formatStageId(draft.priority)}</span>
          </div>
        </div>

        <div className="crm-highlight-grid">
          <article className="crm-spotlight">
            <span className="crm-caption">Next action</span>
            <h3 className="crm-spotlight-title">{draft.nextStep || "No next step captured yet"}</h3>
            <p className="crm-stat-note">Every case should have one clear move the team can take next.</p>
          </article>

          <article className="crm-spotlight">
            <span className="crm-caption">SOP focus</span>
            <h3 className="crm-spotlight-title">
              {taskSummary.nextTask ? taskSummary.nextTask.label : "Checklist complete"}
            </h3>
            <p className="crm-stat-note">
              {taskSummary.completed}/{taskSummary.total} steps complete
              {currentStage?.description ? ` · ${currentStage.description}` : ""}
            </p>
          </article>

          <article className="crm-spotlight">
            <span className="crm-caption">Case health</span>
            <h3 className="crm-spotlight-title">{draft.owner || "Unassigned owner"}</h3>
            <p className="crm-stat-note">
              {getDueLabel(draft.dueAt || customer.dueAt)} · {formatStageId(draft.status)}
              {draftBlockers.length ? ` · ${draftBlockers.length} blocker${draftBlockers.length === 1 ? "" : "s"}` : ""}
            </p>
          </article>
        </div>

        <div className="crm-detail-grid">
          <article className="crm-fact-card">
            <span className="crm-caption">Lead ID</span>
            <strong className="crm-fact-value">{customer.leadId || "None"}</strong>
            <p className="crm-stat-note">Created {formatShortDate(customer.createdAt)}</p>
          </article>

          <article className="crm-fact-card">
            <span className="crm-caption">Records synced</span>
            <strong className="crm-fact-value">
              {customer.syncedRecordCount}/{customer.dossierCount}
            </strong>
            <p className="crm-stat-note">Synced to the TYFYS member file</p>
          </article>
        </div>

        <div className="crm-chip-row">
          {customer.phone ? <span className="crm-token">{customer.phone}</span> : null}
          {customer.paymentCompleted ? <span className="crm-token ok">Paid access</span> : <span className="crm-token">No payment recorded</span>}
          {customer.currentRating !== null ? <span className="crm-token primary">{customer.currentRating}% rating</span> : null}
          {customer.claimType ? <span className="crm-token secondary">{customer.claimType}</span> : null}
        </div>
      </section>

      <section className="crm-section">
        <h3 className="crm-section-title">Pipeline controls</h3>
        <p className="crm-section-copy">
          Update ownership, stage, deadlines, and blockers so the queue stays accurate for the next
          person who opens this case.
        </p>

        <div className="crm-detail-grid">
          <label className="crm-field">
            <span className="crm-field-label">Stage</span>
            <select
              className="crm-select"
              value={draft.stage}
              onChange={(event) => onDraftChange({ ...draft, stage: event.target.value })}
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>

          <label className="crm-field">
            <span className="crm-field-label">Owner</span>
            <input
              className="crm-input"
              value={draft.owner}
              onChange={(event) => onDraftChange({ ...draft, owner: event.target.value })}
              placeholder="Assign a team owner"
            />
          </label>

          <label className="crm-field">
            <span className="crm-field-label">Priority</span>
            <select
              className="crm-select"
              value={draft.priority}
              onChange={(event) => onDraftChange({ ...draft, priority: event.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="crm-field">
            <span className="crm-field-label">Status</span>
            <select
              className="crm-select"
              value={draft.status}
              onChange={(event) => onDraftChange({ ...draft, status: event.target.value })}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label className="crm-field">
            <span className="crm-field-label">Due date</span>
            <input
              className="crm-input"
              type="date"
              value={draft.dueAt}
              onChange={(event) => onDraftChange({ ...draft, dueAt: event.target.value })}
            />
          </label>

          <label className="crm-field">
            <span className="crm-field-label">Last contact</span>
            <input
              className="crm-input"
              type="date"
              value={draft.lastContactAt}
              onChange={(event) => onDraftChange({ ...draft, lastContactAt: event.target.value })}
            />
          </label>
        </div>

        <label className="crm-field-stack">
          <span className="crm-field-label">Next step</span>
          <textarea
            className="crm-textarea"
            value={draft.nextStep}
            onChange={(event) => onDraftChange({ ...draft, nextStep: event.target.value })}
            placeholder="Write one concrete next action for the team."
          />
        </label>

        <div className="crm-detail-grid">
          <label className="crm-field-stack">
            <span className="crm-field-label">Tags</span>
            <input
              className="crm-input"
              value={draft.tagsText}
              onChange={(event) => onDraftChange({ ...draft, tagsText: event.target.value })}
              placeholder="records, priority, consult"
            />
          </label>

          <label className="crm-field-stack">
            <span className="crm-field-label">Blockers</span>
            <textarea
              className="crm-textarea"
              value={draft.blockersText}
              onChange={(event) => onDraftChange({ ...draft, blockersText: event.target.value })}
              placeholder="One blocker per line"
            />
          </label>
        </div>
      </section>

      <section className="crm-section">
        <div className="crm-row-between">
          <div>
            <h3 className="crm-section-title">SOP checklist</h3>
            <p className="crm-section-copy">The current stage is highlighted so the next required task stands out.</p>
          </div>
          <span className="crm-mini-copy">
            {taskSummary.completed}/{taskSummary.total} complete
          </span>
        </div>

        <div className="crm-task-list">
          {draft.tasks.map((task, index) => {
            const isCurrentStage = task.stageId === draft.stage;
            return (
              <label className={`crm-task${task.done ? " done" : ""}${isCurrentStage ? " current" : ""}`} key={task.id}>
                <div className="crm-task-indicator">{task.done ? "✓" : ""}</div>
                <input type="checkbox" checked={task.done} onChange={() => onToggleTask(index)} />
                <div>
                  <p className="crm-task-title">{task.label}</p>
                  <p className="crm-mini-copy">{formatStageId(task.stageId)}</p>
                </div>
                <span className="crm-token" style={task.done ? { background: 'transparent', border: 'none', color: 'var(--crm-ink-soft)' } : {}}>
                  {task.done ? formatShortDate(task.completedAt) : isCurrentStage ? "Current stage" : "Open"}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="crm-section">
        <div className="crm-row-between">
          <h3 className="crm-section-title">Internal notes</h3>
          <span className="crm-mini-copy">
            Updated {formatRelative(customer.updatedAt)} · Last login {formatRelative(customer.lastLoginAt)}
          </span>
        </div>

        <label className="crm-field-stack">
          <span className="crm-field-label">Add note</span>
          <textarea
            className="crm-textarea"
            value={noteDraft}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Capture the latest call, blocker, decision, or handoff note."
          />
        </label>

        <div className="crm-notes">
          {(customer.notes || []).length ? (
            customer.notes
              .slice()
              .reverse()
              .map((note) => (
                <article className="crm-note" key={note.id}>
                  <div className="crm-note-avatar">
                    {(note.author || "T").charAt(0).toUpperCase()}
                  </div>
                  <div className="crm-note-content">
                    <div className="crm-note-head">
                      <strong>{note.author}</strong>
                      <span className="crm-mini-copy">{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="crm-note-text">{note.text}</p>
                  </div>
                </article>
              ))
          ) : (
            <div className="crm-note" style={{ paddingLeft: '48px', opacity: 0.6 }}>
              <p className="crm-note-text">No private notes yet for this customer.</p>
            </div>
          )}
        </div>
      </section>

      <div className="crm-detail-actions">
        <button className="crm-button warm" type="button" disabled={saveState.saving} onClick={onSave} style={{ width: '100%' }}>
          {saveState.saving ? "Saving..." : "Save CRM changes"}
        </button>
      </div>
    </aside>
  );
}

function LoginGate({ loginForm, onChange, onSubmit, busy, error }) {
  return (
    <main className="crm-page crm-login-shell">
      <section className="crm-panel crm-panel-strong crm-login-card">
        <p className="crm-kicker">TYFYS Internal CRM</p>
        <h1 className="crm-login-title">Sign in to access the private CRM.</h1>
        <p className="crm-login-copy">
          Use the same TYFYS account credentials you use for the member app. CRM access is still
          restricted server-side after sign-in.
        </p>

        <div className="crm-field-stack" style={{ marginTop: 18 }}>
          <label className="crm-field">
            <span className="crm-field-label">Email</span>
            <input
              className="crm-input"
              type="email"
              value={loginForm.email}
              onChange={(event) => onChange({ ...loginForm, email: event.target.value })}
              placeholder="team@tyfys.net"
            />
          </label>
          <label className="crm-field">
            <span className="crm-field-label">Password</span>
            <input
              className="crm-input"
              type="password"
              value={loginForm.password}
              onChange={(event) => onChange({ ...loginForm, password: event.target.value })}
              placeholder="Your TYFYS account password"
            />
          </label>
        </div>

        {error ? <div className="crm-error" style={{ marginTop: 16 }}>{error}</div> : null}

        <div className="crm-login-actions" style={{ marginTop: 18 }}>
          <button className="crm-button" type="button" disabled={busy} onClick={onSubmit}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
          <a className="crm-link" href="/">
            Open the member app
          </a>
        </div>
      </section>
    </main>
  );
}

function StateMessage({ title, body, actionLabel, actionHref }) {
  return (
    <main className="crm-page crm-state-card">
      <section className="crm-panel crm-panel-strong crm-state-panel">
        <p className="crm-kicker">TYFYS CRM</p>
        <h1 className="crm-login-title">{title}</h1>
        <p className="crm-login-copy">{body}</p>
        {actionLabel && actionHref ? (
          <div style={{ marginTop: 18 }}>
            <a className="crm-link" href={actionHref}>
              {actionLabel}
            </a>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Sidebar({ viewer, activeView, onNavigate }) {
  const items = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "pipeline", icon: "🗺️", label: "Pipeline" },
    { id: "checklists", icon: "📋", label: "SOP Checklists" },
    { id: "cases", icon: "📁", label: "Cases" },
    { id: "reports", icon: "📈", label: "Reports" },
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "help", icon: "❓", label: "Help" },
  ];

  return (
    <aside className="crm-sidebar">
      <div className="crm-sidebar-brand">
        <img src="/logo.png" alt="TYFYS Logo" className="crm-brand-logo" />
        <span className="crm-brand-name">TYFYS CRM</span>
      </div>

      <nav className="crm-nav-list">
        <div className="crm-field-label" style={{ marginBottom: '8px', paddingLeft: '8px' }}>Navigation</div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`crm-nav-item${activeView === item.id ? " active" : ""}`}
            style={{ background: 'transparent', textAlign: 'left', width: '100%' }}
            onClick={() => onNavigate(item.id)}
          >
            <span className="crm-nav-icon">{item.icon}</span> 
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="crm-sidebar-footer">
        <div className="crm-nav-item" style={{ padding: '4px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--crm-primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold' }}>
            {(viewer?.displayName || viewer?.email || "T")[0].toUpperCase()}
          </div>
          <div style={{ display: 'grid' }}>
            <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{viewer?.displayName || "TYFYS Agent"}</span>
             <span className="crm-mini-copy" style={{ fontSize: '0.75rem' }}>{viewer?.email || "team@tyfys"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PipelineBoard({ stages, customers, selectedUserId, onSelect, onStageDrop }) {
  const [activeDragId, setActiveDragId] = useState(null);

  const customersByStage = useMemo(() => {
    const map = new Map();
    stages.forEach(stage => map.set(stage.id, []));
    customers.forEach(customer => {
      const stageList = map.get(customer.stage);
      if (stageList) {
        stageList.push(customer);
      } else {
        const fallback = map.get(stages[0]?.id);
        if (fallback) fallback.push(customer);
      }
    });
    return map;
  }, [stages, customers]);

  const handleDragStart = (e, customer) => {
    e.dataTransfer.setData("application/json", JSON.stringify(customer));
    e.dataTransfer.effectAllowed = "move";
    setActiveDragId(customer.userId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setActiveDragId(null);
    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      const customer = JSON.parse(data);
      if (customer.stage !== stageId) {
        onStageDrop(customer, stageId);
      }
    } catch (err) {
      console.error("Drop parsing error", err);
    }
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
  };

  return (
    <div className="crm-pipeline-scroll">
      {stages.map(stage => {
        const stageCustomers = customersByStage.get(stage.id) || [];
        return (
          <div 
            className="crm-pipeline-column" 
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragEnter={(e) => e.target.classList.add("crm-drag-over")}
            onDragLeave={(e) => e.target.classList.remove("crm-drag-over")}
          >
            <div className="crm-pipeline-header">
              <h3>{stage.label} <span className="crm-caption">({stageCustomers.length})</span></h3>
            </div>
            <div className="crm-pipeline-cards">
              {stageCustomers.map(customer => (
                <div 
                  key={customer.userId} 
                  style={{ opacity: activeDragId === customer.userId ? 0.5 : 1 }}
                  onDragEnd={handleDragEnd}
                >
                  <CustomerRow
                    customer={customer}
                    selected={customer.userId === selectedUserId}
                    onSelect={onSelect}
                    onDragStart={handleDragStart}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlaceholderView({ title, description, icon }) {
  return (
    <div className="crm-shell" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%' }}>
      <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.8 }}>{icon}</div>
      <h1 className="crm-summary-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{title}</h1>
      <p className="crm-status-copy" style={{ maxWidth: '400px', fontSize: '1.1rem' }}>
        {description}
      </p>
      <div style={{ marginTop: '32px' }}>
        <span className="crm-token" style={{ fontSize: '0.9rem', padding: '10px 16px' }}>Coming in Phase 2</span>
      </div>
    </div>
  );
}

function DashboardView({ customers, stages }) {
  const activeCases = customers.filter((c) => c.status === "active").length;
  const paidCases = customers.filter((c) => c.paymentCompleted).length;
  const overdueCases = customers.filter((c) => isOverdue(c.dueAt)).length;

  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: customers.filter((c) => c.stage === stage.id && c.status === "active").length,
  })).sort((a, b) => b.count - a.count);

  const points = "0,80 40,65 80,75 120,40 160,50 200,20 240,30 280,10 300,10";
  const areaPoints = `${points} 300,100 0,100`;

  return (
    <div className="crm-shell" style={{ overflowY: "auto" }}>
      <header className="crm-header" style={{ position: "sticky", top: 0 }}>
        <div>
          <h1 className="crm-summary-title" style={{ fontSize: "2rem" }}>Dashboard Analytics</h1>
          <p className="crm-status-copy">Velocity metrics and pipeline performance.</p>
        </div>
      </header>

      <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          <div className="crm-fact-card">
            <span className="crm-field-label">Active Claims</span>
            <strong className="crm-stat-value" style={{ color: "var(--crm-primary)" }}>{activeCases}</strong>
            <span className="crm-mini-copy">Currently in pipeline</span>
          </div>
          <div className="crm-fact-card">
            <span className="crm-field-label">Paid & Verified</span>
            <strong className="crm-stat-value" style={{ color: "var(--crm-ok)" }}>{paidCases}</strong>
            <span className="crm-mini-copy">Revenue generating</span>
          </div>
          <div className="crm-fact-card">
            <span className="crm-field-label">Critical Alerts</span>
            <strong className="crm-stat-value" style={{ color: "var(--crm-danger)" }}>{overdueCases}</strong>
            <span className="crm-mini-copy">Cases past due date</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="crm-fact-card" style={{ padding: "32px", display: "block" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 className="crm-section-title">Case Velocity (Last 7 Days)</h3>
            <p className="crm-status-copy">Number of internal tasks completed by agents.</p>
          </div>

          <div style={{ width: "100%", height: "240px", backgroundColor: "var(--crm-bg)", borderRadius: "12px", padding: "24px", position: "relative", border: "1px solid rgba(0, 242, 255, 0.1)" }}>
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="neonGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--crm-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--crm-primary)" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="var(--crm-line)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="var(--crm-line)" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="var(--crm-line)" strokeWidth="0.5" />

              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#neonGlow)" />

              {/* Stroke */}
              <polyline points={points} fill="none" stroke="var(--crm-primary)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Bottlenecks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="crm-fact-card">
            <h3 className="crm-section-title">Bottlenecked Stages</h3>
            <p className="crm-status-copy">Stages with the most active users.</p>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {stageCounts.slice(0, 3).map((sc, i) => (
                <div key={sc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  <span style={{ fontWeight: 600 }}>{sc.label}</span>
                  <span className={`crm-token ${i === 0 ? "warn" : ""}`}>{sc.count} cases</span>
                </div>
              ))}
            </div>
          </div>

          <div className="crm-fact-card">
            <h3 className="crm-section-title">Quick Case Alerts</h3>
            <p className="crm-status-copy">Cases that require immediate attention.</p>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {customers.filter((c) => isOverdue(c.dueAt) && c.status === "active").slice(0, 3).map((c) => (
                <div key={c.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600 }}>{c.displayName || c.email}</span>
                    <span className="crm-mini-copy" style={{ opacity: 0.6 }}>{c.stageLabel}</span>
                  </div>
                  <span className="crm-token danger">Overdue</span>
                </div>
              ))}
              {customers.filter((c) => isOverdue(c.dueAt)).length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--crm-ink-soft)" }}>
                  All clear! No overdue cases.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [payload, setPayload] = useState(null);
  const [loadState, setLoadState] = useState({ loading: true, error: "", unauthenticated: false, forbidden: false });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginState, setLoginState] = useState({ busy: false, error: "" });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [filters, setFilters] = useState({ query: "", stage: "", owner: "", status: "", sort: "attention" });
  const [draft, setDraft] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saveState, setSaveState] = useState({ saving: false });
  const [toast, setToast] = useState(null); 
  const [activeView, setActiveView] = useState("pipeline");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCrm = async () => {
    setLoadState({ loading: true, error: "", unauthenticated: false, forbidden: false });
    try {
      const nextPayload = await requestJson("/api/crm");
      setPayload(nextPayload);
      setSelectedUserId((current) => {
        const hasCurrent = nextPayload.customers?.some((customer) => customer.userId === current);
        if (hasCurrent) return current;
        return nextPayload.customers?.[0]?.userId || "";
      });
      setLoadState({ loading: false, error: "", unauthenticated: false, forbidden: false });
    } catch (error) {
      setLoadState({
        loading: false,
        error: error.message || "Unable to load CRM.",
        unauthenticated: error.status === 401,
        forbidden: error.status === 403,
      });
    }
  };

  useEffect(() => { loadCrm(); }, []);

  const allCustomers = payload?.customers || [];

  const scopedCustomers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return allCustomers.filter((customer) => {
      if (filters.owner && customer.owner !== filters.owner) return false;
      if (filters.status && customer.status !== filters.status) return false;
      if (!query) return true;
      const haystack = [
        customer.displayName, customer.email, customer.leadId, customer.nextStep, customer.owner, customer.claimType,
        ...(customer.tags || []), ...(customer.blockers || []), ...(customer.addedClaims || []),
        ...((customer.notes || []).map((note) => note.text)),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [allCustomers, filters.owner, filters.query, filters.status]);

  const visibleCustomers = useMemo(() => {
    return scopedCustomers
      .filter((customer) => matchesStageFilter(customer, filters.stage))
      .slice()
      .sort((left, right) => compareCustomers(left, right, filters.sort));
  }, [filters.sort, filters.stage, scopedCustomers]);

  useEffect(() => {
    if (!visibleCustomers.length) {
      if (selectedUserId) setSelectedUserId("");
      return;
    }
    const hasSelected = visibleCustomers.some((customer) => customer.userId === selectedUserId);
    if (!hasSelected) {
      setSelectedUserId(visibleCustomers[0].userId);
    }
  }, [selectedUserId, visibleCustomers]);

  const selectedCustomer = useMemo(() => {
    return allCustomers.find((customer) => customer.userId === selectedUserId) || null;
  }, [allCustomers, selectedUserId]);

  const owners = useMemo(() => {
    return Array.from(new Set(allCustomers.map(c => c.owner).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [allCustomers]);

  useEffect(() => {
    if (selectedCustomer) {
      setDraft(buildDraft(selectedCustomer));
      setNoteDraft("");
      setSaveState({ saving: false });
    } else {
      setDraft(null);
      setNoteDraft("");
    }
  }, [selectedCustomer]);

  const handleLogin = async () => {
    setLoginState({ busy: true, error: "" });
    try {
      await requestJson("/api/crm-login", { method: "POST", body: JSON.stringify(loginForm) });
      setLoginState({ busy: false, error: "" });
      await loadCrm();
    } catch (error) {
      setLoginState({ busy: false, error: error.message || "Unable to sign in." });
    }
  };

  const handleToggleTask = (taskIndex) => {
    setDraft((current) => {
      if (!current) return current;
      const nextTasks = current.tasks.map((task, index) => {
        if (index !== taskIndex) return task;
        const nextDone = !task.done;
        return {
          ...task,
          done: nextDone,
          completedAt: nextDone ? task.completedAt || new Date().toISOString() : "",
        };
      });
      return { ...current, tasks: nextTasks };
    });
  };

  const handleSave = async () => {
    if (!selectedCustomer || !draft) return;
    setSaveState({ saving: true });
    try {
      const response = await requestJson("/api/crm", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedCustomer.userId, stage: draft.stage, owner: draft.owner, priority: draft.priority,
          status: draft.status, nextStep: draft.nextStep, dueAt: draft.dueAt || "", lastContactAt: draft.lastContactAt || "",
          tags: parseList(draft.tagsText), blockers: parseList(draft.blockersText), tasks: draft.tasks, addNote: noteDraft,
        }),
      });
      setPayload((current) => ({
        ...current, customers: replaceCustomerRecord(current.customers || [], response.customer), metrics: current.metrics,
      }));
      setNoteDraft("");
      setDraft(buildDraft(response.customer));
      setSaveState({ saving: false });
      showToast(`Saved ${response.customer.displayName}.`, "success");
    } catch (error) {
      setSaveState({ saving: false });
      showToast(error.message || "Unable to save CRM changes.", "error");
    }
  };

  const handleStageDrop = async (customer, newStageId) => {
    setPayload((current) => {
      if (!current) return current;
      const idx = current.customers.findIndex(c => c.userId === customer.userId);
      if (idx === -1) return current;
      const nextCustomers = [...current.customers];
      nextCustomers[idx] = { ...nextCustomers[idx], stage: newStageId };
      return { ...current, customers: nextCustomers };
    });
    if (draft && selectedCustomer?.userId === customer.userId) {
      setDraft(current => ({ ...current, stage: newStageId }));
    }
    const dropDraft = buildDraft(customer);
    try {
      const response = await requestJson("/api/crm", {
        method: "POST",
        body: JSON.stringify({
          userId: customer.userId, stage: newStageId, owner: dropDraft.owner, priority: dropDraft.priority,
          status: dropDraft.status, nextStep: dropDraft.nextStep, dueAt: dropDraft.dueAt || "", lastContactAt: dropDraft.lastContactAt || "",
          tags: parseList(dropDraft.tagsText), blockers: parseList(dropDraft.blockersText), tasks: dropDraft.tasks, addNote: "",
        }),
      });
      setPayload((current) => ({
        ...current, customers: replaceCustomerRecord(current.customers || [], response.customer), metrics: current.metrics,
      }));
      showToast(`Moved ${customer.displayName} to new stage.`, "success");
    } catch (error) {
      showToast(`Failed to move ${customer.displayName}: ${error.message}`, "error");
      await loadCrm();
    }
  };

  const handleResetFilters = () => {
    setFilters((current) => ({ ...current, query: "", stage: "", owner: "", status: "" }));
  };

  if (loadState.loading) return <StateMessage title="Loading private CRM" body="Pulling customer accounts from the app store." />;
  if (loadState.unauthenticated) return <LoginGate loginForm={loginForm} onChange={setLoginForm} onSubmit={handleLogin} busy={loginState.busy} error={loginState.error} />;
  if (loadState.forbidden) return <StateMessage title="CRM access denied" body="Not on the allowlist." actionLabel="Return to app" actionHref="/" />;
  if (loadState.error) return <StateMessage title="CRM temporarily unavailable" body={loadState.error} actionLabel="Retry" actionHref="/crm" />;

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView customers={allCustomers} stages={payload?.stages || []} />;
      case "checklists":
        return <PlaceholderView title="SOP Templates" icon="📋" description="Manage and edit the internal standard operating procedures assigned to each pipeline stage." />;
      case "cases":
        return <PlaceholderView title="All Cases Directory" icon="📁" description="A dense, highly filterable table view to quickly manage hundreds of customers outside of the visual Kanban board." />;
      case "reports":
        return <PlaceholderView title="Reporting & Export" icon="📈" description="Generate CSV exports and cross-filter data for leadership reports." />;
      case "settings":
        return <PlaceholderView title="CRM Settings" icon="⚙️" description="Configure global CRM toggles, team member permissions, and billing integrations." />;
      case "help":
        return <PlaceholderView title="Agent Help Center" icon="❓" description="Documentation on how to use the CRM effectively." />;
      case "pipeline":
      default:
        return (
          <>
            <header className="crm-header" style={{ paddingBottom: '16px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <h1 className="crm-summary-title" style={{ fontSize: '2rem' }}>Customer Pipeline</h1>
                <p className="crm-status-copy">Manage active cases and pipeline progression.</p>
              </div>
              <div className="crm-chip-row">
                <span className="crm-token">{visibleCustomers.length} visible</span>
                {Boolean(filters.query || filters.stage || filters.owner || filters.status) && (
                  <button className="crm-button secondary crm-button-small" type="button" onClick={handleResetFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            </header>
            <div style={{ padding: '16px 24px 0 24px' }}>
              <Filters filters={filters} stages={payload?.stages || []} onChange={setFilters} onReset={handleResetFilters} owners={owners} resultCount={visibleCustomers.length} />
            </div>
            <div className="crm-board">
              <PipelineBoard stages={payload?.stages || []} customers={scopedCustomers} selectedUserId={selectedUserId} onSelect={setSelectedUserId} onStageDrop={handleStageDrop} />
              <DetailPanel customer={selectedCustomer} draft={draft} noteDraft={noteDraft} stages={payload?.stages || []} onDraftChange={setDraft} onToggleTask={handleToggleTask} onNoteChange={setNoteDraft} onSave={handleSave} saveState={saveState} />
            </div>
          </>
        );
    }
  };

  return (
    <main className="crm-page">
      <Sidebar viewer={payload?.viewer} activeView={activeView} onNavigate={setActiveView} />
      <div className="crm-shell">
        {renderContent()}
      </div>
      {toast && (
        <div className={`crm-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
