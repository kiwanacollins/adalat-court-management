# E-Judiciary CMS: Complete User Flow and Functionality Guide

This guide explains exactly how each user role works in the system so you can train other people quickly and consistently.

## 1. System Purpose

The system is used to:

1. Register court cases.
2. Schedule hearings.
3. Track case status from filing to completion.
4. Notify users about hearings and status changes.
5. Produce court reports for operational visibility.

## 2. User Roles in This System

There are 3 active roles:

1. Litigant
2. Clerk (registry / court administration)
3. Magistrate (judicial officer)

For training language:

1. Judiciary staff = Clerk + Magistrate.

## 3. Access and Permission Matrix

| Action | Litigant | Clerk | Magistrate |
|---|---|---|---|
| Create account and log in | Yes | Yes | Yes |
| View dashboard | Yes (own cases only) | Yes (all cases) | Yes (assigned cases focus) |
| Register new case | No | Yes | Yes |
| Edit case details | No | Yes | Yes |
| Schedule/reschedule hearing | No | Yes | Yes |
| Adjourn case | No | Yes | Yes |
| Mark case concluded | No | Yes | Yes |
| Dismiss case | No | Yes | Yes |
| Delete case | No | Yes | Yes |
| View reports | No | Yes | Yes |
| View notifications | Yes | Yes | Yes |

## 4. End-to-End Case Lifecycle (High Level)

1. Clerk or Magistrate registers a case.
2. Case starts as `Pending`.
3. Case is scheduled and becomes `Scheduled`.
4. If needed, case can be `Adjourned` and later rescheduled.
5. Case is finalized as `Concluded` or terminated as `Dismissed`.
6. Notifications are generated during key updates.

Allowed status transitions enforced by the system:

1. `Pending -> Scheduled` or `Pending -> Dismissed`
2. `Scheduled -> Adjourned`, `Scheduled -> Concluded`, or `Scheduled -> Dismissed`
3. `Adjourned -> Scheduled`, `Adjourned -> Concluded`, or `Adjourned -> Dismissed`
4. `Concluded` and `Dismissed` are terminal states.

## 5. Common Flow for All Users

### Step A: Open the system

1. Open the home page.
2. Click **Get Started**.

### Step B: Authenticate

1. On the auth page, choose:
	1. **Login** (existing account), or
	2. **Create a new account**.
2. During signup, enter:
	1. First name
	2. Last name
	3. Email
	4. Password (minimum 7 characters)
	5. Role (Litigant, Clerk, or Magistrate)
3. Submit.
4. Login using email and password.

### Step C: Role-based dashboard routing

After login, the system sends the user to the dashboard and shows the role-specific interface automatically.

## 6. Clerk Flow (Judiciary Registry Officer)

This is the main operations flow for registry work.

### 6.1 Start of day dashboard review

1. Login as Clerk.
2. Open **Dashboard**.
3. Review top cards:
	1. Total Cases
	2. Unscheduled
	3. Today's Court
	4. Urgent
4. Review **Needs Scheduling** panel.
5. Review **Today's Court Schedule** panel.

### 6.2 Register a new case

1. Click **Register New Case** (or **Register Case**).
2. Fill **Case Information**:
	1. Case Type
	2. Priority (Normal/Urgent)
	3. Description
3. Fill **Parties Involved**:
	1. Complainant name/contact
	2. Respondent name/contact
4. Optionally fill **Hearing Schedule**:
	1. Assigned magistrate
	2. Hearing date
	3. Hearing time
	4. Courtroom
5. Submit with **Register Case**.
6. System creates case number automatically (format like `LGM/YYYY/NNN`).

### 6.3 Scheduling rules while registering

If date/time is entered during registration:

1. Weekend scheduling is rejected.
2. Time must be between 08:00 and 17:00.
3. Past dates are rejected.
4. Conflict checker warns if:
	1. Magistrate already has another case at that date/time.
	2. Courtroom is already booked at that date/time.

Note: conflict warning is advisory in UI; staff should resolve conflicts before final submission.

### 6.4 Manage existing cases from dashboard table

1. Use tabs:
	1. All Cases
	2. Pending
	3. Urgent
2. For each row:
	1. Click **View** to open full case file.
	2. Click pencil icon to inline edit limited fields:
		1. Case type
		2. Complainant name
		3. Hearing date
		4. Priority

### 6.5 Manage case details page

Open any case and perform section edits:

1. **Case Details** section (type, description).
2. **Parties Involved** section.
3. **Hearing Schedule** section (date, time, courtroom, assigned magistrate).
4. Update priority directly in header (Normal/Urgent).

### 6.6 Perform case status actions

On case details page, use action buttons based on current status:

1. Pending:
	1. **Schedule Hearing**
	2. **Dismiss**
2. Scheduled:
	1. **Adjourn**
	2. **Mark Concluded**
	3. **Dismiss**
3. Adjourned:
	1. **Reschedule**
	2. **Mark Concluded**
	3. **Dismiss**

When scheduling/rescheduling from status actions:

1. Date must not be in the past.
2. Time must be between 08:00 and 17:00.

### 6.7 Notifications workflow

1. Open **Notifications** from nav.
2. Review:
	1. Upcoming hearings (next 7 days)
	2. Recent activity notifications
3. Click **Mark all as read** when done.

### 6.8 Reports workflow

1. Open **Reports**.
2. Teach users to read:
	1. Total, active, concluded, and upcoming (7d)
	2. Cases by type
	3. Cases by status
	4. Upcoming hearings (14 days)
	5. Magistrate workload

### 6.9 Optional administrative cleanup

1. On case details page, Clerk can use **Delete Case Record** for erroneous records.
2. Confirm deletion prompt.

## 7. Magistrate Flow (Judicial Officer)

This flow focuses on assigned hearings and judicial decisions.

### 7.1 Start of day

1. Login as Magistrate.
2. Dashboard shows a magistrate-focused view:
	1. Assigned Cases
	2. Today's Hearings
	3. Next 7 Days
	4. Urgent Cases
3. Open **Today's Hearings** cards first.

### 7.2 Work assigned cases

1. Use tabs:
	1. All Assigned
	2. Unscheduled
2. Open case details via **View**.

### 7.3 Hearing and decision actions

On each case file:

1. Review parties, schedule, history.
2. Apply action according to hearing outcome:
	1. Schedule/Reschedule
	2. Adjourn (with reason and optional new date/time)
	3. Mark Concluded
	4. Dismiss
3. Confirm status history is recorded.

### 7.4 Notifications and reports

1. Check **Notifications** for upcoming hearings and status activity.
2. Use **Reports** for workload and planning visibility.

## 8. Litigant Flow (Case Party)

This flow is read-oriented and limited to own cases.

### 8.1 Account and login

1. Create account as Litigant (or login if existing).
2. System opens Litigant dashboard.

### 8.2 Monitor case progress

1. Review dashboard stats:
	1. Total Cases
	2. Active
	3. Concluded
2. Review **Your Next Hearing** banner.
3. Open **My Cases** cards.
4. Watch status tracker progression:
	1. Pending
	2. Scheduled
	3. Adjourned
	4. Concluded
	5. (or Dismissed)

### 8.3 View details and prepare for hearings

1. Open case detail by clicking a case card.
2. Review:
	1. Hearing date/time/courtroom
	2. Assigned magistrate
	3. Status history notes
3. Litigant cannot edit case content.

### 8.4 Stay updated

1. Open **Notifications**.
2. Check upcoming hearings and recent activity.
3. Mark all as read after review.

## 9. Judiciary Training Script (Recommended Classroom Sequence)

Use this in a live demo with two staff accounts and one litigant account.

1. Clerk logs in and registers a new case.
2. Clerk schedules hearing date/time and assigns a magistrate.
3. Show conflict warning by choosing an occupied slot.
4. Magistrate logs in and opens assigned case.
5. Magistrate adjourns with a reason and new date.
6. Litigant logs in and confirms updated hearing on dashboard.
7. Clerk or magistrate marks case concluded.
8. Show final status history and notifications.

## 10. Important Operational Rules to Teach

1. Only Clerk/Magistrate can create, edit, schedule, update status, or delete cases.
2. Litigant can only view own cases and notifications.
3. Past hearing dates should never be set.
4. Working hearing time window is 08:00-17:00.
5. Status changes must follow allowed transitions.
6. Every major status change should be accompanied by clear notes for audit trail.

## 11. Page-by-Page Functional Map

1. `/`:
	1. Public landing page
2. `/auth`:
	1. Login and signup entry
3. `/dashboard`:
	1. Role-specific dashboard
4. `/dashboard/AddCases`:
	1. New case registration (Clerk/Magistrate only)
5. `/dashboard/[caseId]`:
	1. Full case file and actions
6. `/dashboard/notifications`:
	1. Upcoming alerts + activity feed
7. `/dashboard/reports`:
	1. Reports and analytics (Clerk/Magistrate only)

## 12. Quick Trainer Checklist

Before training session:

1. Prepare at least one account per role.
2. Ensure there are sample cases in each status.
3. Prepare one conflict scenario (same magistrate/time).

During training:

1. Teach Clerk flow first.
2. Teach Magistrate decisions second.
3. Teach Litigant tracking last.
4. Emphasize status lifecycle and permissions repeatedly.

After training:

1. Ask trainees to complete one full cycle:
	1. Register -> Schedule -> Adjourn -> Reschedule -> Conclude.

