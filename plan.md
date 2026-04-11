# E-Judiciary Case Scheduling System — Implementation Plan
## Lwengo Grade I Magistrate's Court, Uganda

---

## Problem & Approach

The existing project is a Next.js 12 court management app ("Adaalat") built for an Indian context using MongoDB, NextAuth, and Tailwind CSS. We need to adapt it into an **E-Judiciary Case Scheduling System** for Lwengo Grade I Magistrate's Court, Uganda — **without any AI features**, keeping the scope appropriate for a university final-year project.

**Excluded (AI/ML):** predictive analytics, workload AI optimization, AI-predicted case durations, scikit-learn integration.

**Stack:** Next.js 12, React 17, MongoDB, NextAuth, Tailwind CSS, PWA (no new packages needed).

---

## What Already Exists (Keep & Adapt)
- ✅ Authentication (NextAuth credentials + Google)
- ✅ MongoDB integration
- ✅ Case add/view/delete
- ✅ Dashboard with stats
- ✅ Layout/Navbar
- ✅ PWA config

---

## Phases

### Phase 1 — Rebrand & Role-Based Access
- Rebrand from "Adaalat" → "E-Judiciary CMS — Lwengo Grade I Magistrate's Court"
- Update: `pages/index.js`, `components/HomePage.js`, `components/Layout/Layout.js`, `pages/_document.js`, `public/manifest.json`
- Add `role` field to signup form: **Magistrate | Clerk | Litigant**
- Store `role` in MongoDB users collection
- Return `role` + full name from NextAuth session
- Restrict routes by role:
  - All roles: view own cases, dashboard
  - Clerk/Magistrate: register cases, schedule hearings
  - Magistrate only: reports, manage all cases

### Phase 2 — Updated Case Schema & Registration Form
Remove Indian-specific fields; use Uganda court fields:
- `case_number` — auto-generated format `LGM/YYYY/NNN`
- `case_type` — Criminal | Civil | Land Dispute | Family | Others
- `case_description`
- `complainant_name`, `complainant_contact`
- `respondent_name`, `respondent_contact`
- `assigned_magistrate` — select from registered magistrate users
- `filing_date` — auto (today)
- `status` — Pending | Scheduled | Adjourned | Concluded | Dismissed
- `priority` — Normal | Urgent
- `hearing_date`, `hearing_time`, `courtroom`
- `registered_by` (email), `uid` (UUID)

Files: `components/ui/AddCaseForm.js`, `pages/api/case/addcase.js`, `components/AddCase.js`

### Phase 3 — Rule-Based Scheduling & Conflict Detection
When scheduling a hearing (setting date/time/magistrate/courtroom):
1. **Conflict check:** same magistrate + same date + same time → block with warning
2. **Courtroom conflict:** same courtroom + same date + same time → warn
3. **Business hours check:** hearing must be 08:00–17:00 Mon–Fri
4. **Past date check:** hearing date cannot be in the past

API: `pages/api/schedule/check-conflict.js` — takes `{ magistrate, date, time, courtroom, excludeUid }` and returns `{ hasConflict, conflicts[] }`

UI: conflict alert banner on scheduling form before save.

### Phase 4 — Case Status Management
- Case detail page shows action buttons by status:
  - **Pending** → "Schedule Hearing" (opens scheduling form), "Dismiss"
  - **Scheduled** → "Adjourn" (with new date + reason), "Mark Concluded", "Dismiss"
  - **Adjourned** → "Reschedule", "Mark Concluded", "Dismiss"
- Each transition records `status_history[]` in the DB: `{ status, date, note, changedBy }`
- API: `pages/api/case/updatestatus.js`
- Redesign `components/DisplayCaseDetails.js` with proper Uganda-context layout

### Phase 5 — In-App Notifications Panel
- On login/dashboard load: query cases where `hearing_date` is within 3 days → surface as notifications
- MongoDB `notifications` collection: `{ userId, caseUid, message, read, createdAt }`
- Auto-create notifications when a hearing is scheduled or adjourned
- Navbar: bell icon with unread count badge
- `/dashboard/notifications` page listing all notifications with mark-as-read

### Phase 6 — Reports & Analytics Dashboard
New page: `/dashboard/reports` (Clerk/Magistrate only)
- **Summary cards:** Total cases | Active | Concluded | Upcoming hearings (7 days)
- **Cases by type:** simple horizontal bar chart (CSS only)
- **Cases by status:** counts table
- **Upcoming hearings table:** next 14 days, sortable by date
- **Magistrate workload table:** cases per assigned magistrate
- Data fetched server-side from MongoDB aggregation

---

## Files Summary

### New Files
- `pages/api/schedule/check-conflict.js`
- `pages/api/case/updatestatus.js`
- `pages/api/notifications/index.js` (GET all, POST mark-read)
- `pages/dashboard/reports.js`
- `pages/dashboard/notifications.js`
- `components/NotificationBell.js`
- `components/CaseStatusActions.js`
- `components/ScheduleForm.js`
- `components/ReportsPage.js`

### Modified Files
- `components/Layout/Layout.js` — rebrand, add notification bell, role-aware nav
- `components/auth/SignUpPage.js` + `components/auth/SignUp.js` — add role dropdown
- `pages/api/auth/signup.js` — save role to DB
- `pages/api/auth/[...nextauth].js` — return role + name in session
- `components/ui/AddCaseForm.js` — Uganda fields, fetch magistrates list
- `pages/api/case/addcase.js` — new schema
- `components/DisplayCaseDetails.js` — redesign + status actions
- `components/Feed.js` + `components/FeedRow.js` — new columns
- `pages/dashboard/index.js` — role-aware stats + upcoming hearings
- `pages/index.js` + `components/HomePage.js` — rebrand
- `pages/_document.js` — rebrand meta
- `public/manifest.json` — rebrand

---

## Notes
- Keep Google OAuth signup for convenience; role defaults to **Litigant** for OAuth users
- No email/SMS notifications — in-app only
- No chart library — pure CSS/Tailwind bars for reports
- Preserve local-user fallback (no MongoDB) for dev/demo
- Case number sequence: query DB for count, pad to 3 digits per year
