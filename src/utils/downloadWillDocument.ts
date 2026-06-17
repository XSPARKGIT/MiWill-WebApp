import type {AssignedUser} from '../pages/agent-dashboard/types';

function slugifyName(name: string) {
  return name.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function formatStatus(status: AssignedUser['willStatus']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildWillHtml(user: AssignedUser) {
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const lastUpdated = new Date(user.lastUpdated).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const sections = user.profileSections
    .map(
      (section) =>
        `<li class="${section.complete ? 'done' : 'pending'}">${section.complete ? '&#10003;' : '&#9675;'} ${section.label}</li>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>MiWill — ${user.name} — Will (Read-only)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1E2D3D;
      line-height: 1.6;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 32px;
      background: #fff;
    }
    .banner {
      background: #f0f7f7;
      border: 1px solid #5097A4;
      color: #3E8491;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-align: center;
      text-transform: uppercase;
      padding: 10px 16px;
      margin-bottom: 32px;
      border-radius: 8px;
    }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .meta { font-family: system-ui, sans-serif; font-size: 13px; color: #6B7C93; margin-bottom: 32px; }
    h2 {
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6B7C93;
      margin: 28px 0 12px;
      border-bottom: 1px solid #E5E9EE;
      padding-bottom: 6px;
    }
    dl { margin: 0; }
    dt { font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7C93; margin-top: 12px; }
    dd { margin: 4px 0 0; font-size: 15px; }
    p { margin: 0 0 12px; }
    ul { list-style: none; padding: 0; margin: 0; font-family: system-ui, sans-serif; font-size: 14px; }
    li { padding: 6px 0; border-bottom: 1px solid #EEF1F4; }
    li.done { color: #15803d; }
    li.pending { color: #6B7C93; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E9EE;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #6B7C93;
      text-align: center;
    }
    @media print {
      .banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="banner">Read-only copy — not editable · Generated ${generatedAt}</div>
  <h1>Last Will and Testament</h1>
  <p class="meta">${user.name} · Status: ${formatStatus(user.willStatus)} · ${user.completeness}% complete · Last updated ${lastUpdated}</p>

  <h2>Testator</h2>
  <dl>
    <dt>Full name</dt><dd>${user.name}</dd>
    <dt>Email</dt><dd>${user.email}</dd>
    <dt>Phone</dt><dd>${user.phone}</dd>
    <dt>Date of birth</dt><dd>${user.dateOfBirth ?? '—'}</dd>
    <dt>ID number</dt><dd>${user.idNumber ?? '—'}</dd>
  </dl>

  <h2>Will sections</h2>
  <ul>${sections}</ul>

  <h2>Assets</h2>
  <p>${user.assetsSummary}</p>

  <h2>Policies</h2>
  <p>${user.policiesSummary}</p>

  <h2>Beneficiaries</h2>
  <p>${user.beneficiariesSummary}</p>

  <div class="footer">
    MiWill platform · This document is a read-only export for administrative review.<br />
    Official signed will records are maintained in the MiWill app.
  </div>
</body>
</html>`;
}

export function downloadWillDocument(user: AssignedUser) {
  const html = buildWillHtml(user);
  const blob = new Blob([html], {type: 'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MiWill-${slugifyName(user.name)}-Will.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function canDownloadWill(user: AssignedUser) {
  return user.willStatus === 'complete' || user.willStatus === 'submitted';
}
