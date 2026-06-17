# MiWill Agent — What You Can Do

This document describes the **Agent** role in the MiWill web portal: who agents are, how they access the app, and what they can do in the agent dashboard.

---

## Role overview

Agents are MiWill portal users who manage assigned clients, leads, and follow-up work. They are distinct from **Admins**, who create accounts and manage the portal at a higher level.

| Capability | Agent | Admin |
|------------|:-----:|:-----:|
| Sign in to the portal | Yes | Yes |
| Access `/agent-dashboard` | Yes | No |
| Access `/admin-dashboard` | No | Yes |
| Create new accounts (sign up) | No* | Yes |
| Manage assigned users & leads | Yes | No |

\* Agents sign in with credentials created by an admin (or via self-service signup if they register as an agent). They cannot open the admin dashboard.

---

## Getting access

1. **Sign up** — An account can be created at `/signup` with role **Agent** (or by an admin creating one).
2. **Sign in** — Use `/login` with email and password.
3. **Routing** — After login, agents are sent to `/agent-dashboard`. Admins go to `/admin-dashboard`.
4. **Account status** — Disabled accounts (`isActive: false`) are redirected to login with an error.

Authentication is backed by Firebase when configured; otherwise a local mock auth mode is used for development.

---

## Agent dashboard sections

The dashboard has six sections, available from the left sidebar:

| Section | Purpose |
|---------|---------|
| **Overview** | High-level snapshot of workload and activity |
| **My Users** | List of assigned clients |
| **Leads** | Kanban-style lead pipeline |
| **Engagement** | Log calls and emails per client |
| **Notes** | Add and edit notes per client |
| **Notifications** | Alerts scoped to your users and leads |

---

## Overview

The overview is the default home screen. It shows:

- **Total assigned users** — Count of clients assigned to you.
- **Leads by stage (active)** — New, Contacted, and In Progress leads (excludes Closed).
- **Incomplete profiles** — Clients with profile completeness below 80%.
- **Recent touchpoints** — Activity count from the activity log.

It also includes:

- **Lead pipeline** — Breakdown by stage: New, Contacted, In progress, Closed.
- **Activity log** — The five most recent events (calls, emails, meetings, status updates).

---

## My Users

View and browse **assigned clients** in a table with:

- Name, email, and phone
- **Will status** — Draft, In review, Submitted, or Complete
- **Profile completeness** — Percentage with a visual progress bar

**Tap or click a row** to open a **read-only detail drawer** showing:

- Profile completeness
- Contact details
- Assets summary
- Policies summary
- Beneficiaries summary

Client data in the drawer is a snapshot; updates sync from the MiWill app (not edited in the portal).

---

## Leads

Manage prospects in a **four-column Kanban board**:

| Stage | Meaning |
|-------|---------|
| **New** | Newly added lead |
| **Contacted** | Initial outreach done |
| **In progress** | Active follow-up |
| **Closed** | Lead resolved or no longer active |

For each lead card you can see name, email, phone, and notes. Use the **Update status** dropdown on a card to move a lead between stages.

---

## Engagement

Track **user engagement and follow-up** for each assigned client:

- View client name, email, and phone.
- See a warning when profile completeness is below 60% (prioritize follow-up).
- **Log call** — Records a call touchpoint in the activity log.
- **Log email** — Records an email touchpoint in the activity log.
- View the **interaction log** — Up to four recent touchpoints per client.

---

## Notes

Keep **per-client notes** for your team:

1. Select a client from the dropdown.
2. Write a note and click **Save note**.
3. View notes in a chronological feed for that client.
4. **Edit inline** — Update existing notes; edited notes are marked as edited.

---

## Notifications

Stay on top of alerts related to your assigned users and leads:

- View notifications with title, body, timestamp, and scope (`user` or `lead`).
- **Mark as read** on individual items.
- **Mark all read** from the notifications section or the header bell menu.
- Unread count appears on the bell icon in the header (badge up to 9+).

---

## Header & account

From the top bar you can:

- See the current section title.
- Open the **notifications** dropdown (quick preview of up to six alerts).
- Open the **account menu** (avatar):
  - View name, email, and **AGENT** role badge
  - **Profile** — Open profile modal
  - **Sign out** — End session and return to login

---

## Profile

In the profile modal agents can:

- View full name, email, role (Agent), and phone (if set).
- **Upload photo** — Choose an image for the session avatar (displayed in header and profile).

Profile photo is held in the current browser session for the dashboard UI.

---

## What agents cannot do

- Access the admin dashboard or create accounts from there.
- Edit client will data, assets, policies, or beneficiaries in the portal (read-only drawer).
- Persist dashboard changes to Firestore yet — leads, notes, activities, and notifications currently use **in-memory mock data** for the dashboard UI. Changes apply for the session but are not saved to the backend until that integration is built.

---

## Technical reference

| Item | Detail |
|------|--------|
| Route | `/agent-dashboard` |
| Required role | `agent` |
| Firestore | User profiles in `users/{uid}`; agents can create/read their own profile per security rules |
| Dashboard data | `src/pages/agent-dashboard/` (mock data in `mockData.ts`) |

---

## Related files

- `src/pages/agent-dashboard/AgentDashboardPage.tsx` — Main dashboard shell
- `src/pages/agent-dashboard/components/Sidebar.tsx` — Navigation
- `src/router/AppRouter.tsx` — Role-based route protection
- `src/auth/AuthContext.tsx` — Auth state and roles
