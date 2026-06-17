# MiWill Admin — What You Can Do

This document describes the **Admin** role in the MiWill web portal: who admins are, how they access the app, and what they can do in the dashboard.

---

## Role overview

Admins are MiWill portal users who oversee staff access and use the full dashboard alongside agents. They are distinct from **Agents**, who focus on assigned clients, leads, and follow-up work.

| Capability | Admin | Agent |
|------------|:-----:|:-----:|
| Sign in to the portal | Yes | Yes |
| Access `/dashboard` | Yes | Yes |
| Overview, My Users, Leads | Yes | Yes |
| Engagement | Yes | Yes |
| Notes | Yes | Yes |
| Notifications | Yes | Yes |
| **Admin Panel** (sidebar) | Yes | No |
| Create new accounts via `/signup` | Yes* | No* |

\* Account creation is intended for admins. The sign-up page is public while logged out; see [Creating new accounts](#creating-new-accounts) for routing details.

**Demo admin (mock mode):**

| Field | Value |
|-------|-------|
| Name | Mpumelelo Dube |
| Email | `testaccount@gmail.com` |
| Password | `Admin3@123` |

---

## Getting access

1. **Sign in** — Use `/login` with email and password.
2. **Routing** — After login, admins are sent to `/dashboard` (same route as agents). Legacy paths `/admin-dashboard` and `/agent-dashboard` redirect to `/dashboard`.
3. **Account status** — Disabled accounts (`isActive: false`) are blocked at login with an error.
4. **Protection** — Unauthenticated users cannot open the dashboard; they are redirected to `/login`.

Authentication uses Firebase when configured; otherwise local mock auth is used for development (`src/auth/users.ts`).

---

## Dashboard sections

Admins see **seven** sidebar items. Agents see six (everything except Admin Panel).

| Section | Purpose |
|---------|---------|
| **Overview** | High-level snapshot of workload and activity |
| **My Users** | List of assigned clients |
| **Leads** | Kanban-style lead pipeline |
| **Engagement** | Log calls and emails per client |
| **Notes** | Add and edit notes per client |
| **Notifications** | Alerts scoped to users and leads |
| **Admin Panel** | Portal administration (admin role only) |

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

View and browse **assigned clients** in a card-style list with:

- Name, email, and phone
- **Will status** — Draft, In review, Submitted, or Complete
- **Profile completeness** — Percentage with a visual progress bar

**Tap or click a row** to open a **read-only client details drawer** showing:

- Profile completeness and section progress
- Contact details
- Assets, policies, and beneficiaries summaries

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

For each lead card you can see name, email, phone, and notes. Use the stage picker on a card to move a lead between stages.

---

## Engagement

Track **user engagement and follow-up** for each assigned client:

- View client name, email, and phone.
- See a warning when profile completeness is below 60%.
- **Log call** — Records a call touchpoint in the activity log.
- **Log email** — Opens `mailto:` and records an email touchpoint.
- View the **interaction log** — Recent touchpoints per client.

---

## Notes

Keep **per-client notes** for your team:

1. Select a client from the selector.
2. Choose a note type (call, email, meeting, note).
3. Write a note and save.
4. Browse a timeline feed with filters.
5. **Edit inline** — Update existing notes; edited notes are marked as edited.

---

## Notifications

Stay on top of alerts related to assigned users and leads:

- View notifications with title, body, timestamp, and scope (`user` or `lead`).
- **Mark as read** on individual items.
- **Mark all read** from the notifications section or the header bell menu.
- Unread count appears on the bell icon in the header (badge up to 9+).

---

## Admin Panel

**Admin-only** section in the sidebar. It provides:

### Create new account

- Link to **`/signup`** to register a new **Admin** or **Agent**.
- Collects full registration details (name, DOB, SA ID, email, password, role, POPIA acceptance).
- After creation, the new user signs in separately at `/login`.

### Portal access

- Confirms that admins have full dashboard access, including Engagement, Notifications, and this panel.

**Note:** `/signup` is a public route. If you are already signed in, visiting `/signup` redirects back to `/dashboard`. Open sign-up in a logged-out session or new tab when creating accounts on behalf of others.

---

## Creating new accounts

The sign-up form at **`/signup`** supports:

| Field | Required |
|-------|----------|
| First name, surname | Yes |
| Date of birth | Yes |
| South African ID (13 digits) | Yes |
| Email | Yes |
| Phone | Optional |
| Password + confirm | Yes (strength rules) |
| Role | **Agent** or **Admin** |
| POPIA / Terms | Yes |

On success:

- Firebase Auth + Firestore `users/{uid}` profile is created (or mock registration in dev).
- The new account is signed out immediately so the creator’s session is not replaced.
- User is redirected to `/login` with a success message.

Backend also supports **`createManagedUserAccount`** (secondary Firebase Auth for creating users without ending the admin session); the current sign-up UI uses the self-service flow.

---

## Header & account

From the top bar you can:

- See the current section title (including **Admin panel** when active).
- Open the **notifications** dropdown (preview of up to six alerts).
- Open the **account menu** (avatar):
  - View name, email, and **ADMIN** role badge
  - **Profile** — Open profile modal
  - **Sign out** — End session and return to login

---

## Profile

In the profile modal admins can:

- View full name, email, role (Admin), and phone (if set).
- **Upload photo** — Choose an image for the session avatar (displayed in header and profile).

Profile photo is held in the current browser session for the dashboard UI.

---

## What admins cannot do (yet)

- **User management console** — No UI to list all portal users, disable accounts, or reset passwords.
- **Firestore admin rules** — Rules allow each user to read/create only their own `users/{uid}` document; admins cannot update or delete other profiles in Firestore.
- **Persist dashboard data** — Leads, notes, activities, and notifications use **in-memory mock data** for the session; changes are not saved to the backend yet.
- **Edit client wills** — Client drawer is read-only.
- **Sign up while logged in** — Authenticated users are redirected from `/signup` to `/dashboard`.

---

## Technical reference

| Item | Detail |
|------|--------|
| Route | `/dashboard` |
| Required role | `admin` (for Admin Panel nav item) |
| Login | `/login` |
| Sign up | `/signup` |
| Firestore | User profiles in `users/{uid}` |
| Dashboard data | `src/pages/agent-dashboard/` (mock data in `mockData.ts`) |
| Demo users | `src/auth/users.ts` |

---

## Related files

- `src/pages/agent-dashboard/AgentDashboardPage.tsx` — Main dashboard shell
- `src/pages/agent-dashboard/sections/AdminPanelSection.tsx` — Admin panel UI
- `src/pages/agent-dashboard/components/Sidebar.tsx` — Role-aware navigation
- `src/pages/SignUpPage.tsx` — Account registration
- `src/router/AppRouter.tsx` — Auth route protection
- `src/auth/AuthContext.tsx` — Auth state and roles
- `src/auth/users.ts` — Demo login accounts
