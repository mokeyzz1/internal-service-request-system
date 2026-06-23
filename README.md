# Service Request Workspace

A department technology support workflow demo for service intake, access changes, reporting requests, system issues, support notes, resolution tracking, and basic operational reporting.

The project is designed as a portfolio-ready Business Systems Analyst / application support demo. It shows how department users can submit requests and how a support analyst can review, update, document, and resolve those requests.

## Screenshots

![Support workspace](public/screenshots/dashboard.png)

![Requester intake and reporting](public/screenshots/reporting.png)

## What The Demo Shows

- Requester intake for department users submitting access, reporting, software, system, onboarding, or documentation requests.
- Systems support workspace with queue search, filters, selected request details, and analyst update controls.
- Editable support review fields for status, owner, priority, approval requirement, support notes, SOP/documentation link, and resolution notes.
- Save and resolve actions that persist locally in the browser.
- Dashboard and reporting views for open work, approval needs, overdue requests, access changes, affected systems, and recurring issues.

## Workflow

1. A department user submits a request through the requester intake form.
2. The request appears in the support queue as `Submitted` and `Unassigned`.
3. A support analyst reviews the request, updates status, assigns an owner, adjusts priority, confirms approval needs, and adds support notes.
4. The analyst can link related SOP/documentation and add resolution notes.
5. The request can be saved or resolved, and the changes persist after refresh.
6. Reporting views summarize request volume, affected systems, department demand, and recurring issue patterns.

## Core Features

- Dashboard cards for open requests, awaiting approval, overdue work, average resolution time, completed access changes, and recurring issues.
- Request queue with search and filters for status, priority, category, department, and assignee.
- Request detail panel with requester information, affected system, submitted date, due date, approval flag, support notes, SOP link, and resolution fields.
- Editable support review controls for status, owner, priority, approval requirement, notes, documentation link, and resolution summary.
- Requester intake form with required fields and local persistence.
- Reporting view with request trends, category volume, department demand, top affected systems, and recurring issues.
- 120 realistic seed records across HR, Finance, Operations, Student Services, IT, and Athletics.

## Persistence Model

This version uses browser `localStorage` for demo persistence:

- New intake submissions are saved in the current browser.
- Analyst updates are saved in the current browser.
- Refreshing the page keeps submitted requests and saved edits.
- Data is not shared across users or devices.

A production version would move persistence into a shared database and add authentication/roles for requesters, support analysts, and administrators.

## Data Model

The app uses typed local seed data in `data/requests.ts`, with a Prisma schema prepared in `prisma/schema.prisma` for a future database-backed version.

Primary request fields include:

- `id`
- `title`
- `requester`
- `department`
- `category`
- `priority`
- `status`
- `assignedOwner`
- `submittedDate`
- `dueDate`
- `resolutionDate`
- `description`
- `internalNotes`
- `resolutionSummary`
- `documentationLink`
- `approvalRequired`
- `affectedSystem`
- `recurringIssueKey`

## Business Systems Analyst / Application Support Mapping

This project demonstrates common BSA and application support work:

- Request intake and triage workflow design.
- Status, owner, priority, and approval tracking.
- Access-change and system-support request handling.
- Internal notes and resolution documentation.
- SOP/knowledge-base linking.
- Queue filtering and operational visibility.
- Reporting on department demand, affected systems, and recurring issues.

## Tech Stack

- Next.js
- TypeScript
- React
- Recharts
- Lucide React
- Prisma schema prepared for SQLite
- Local typed seed data and browser persistence for demo use

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build check:

```bash
npm run build
```

## Future Improvements

- Add authentication and role-based views for requesters and support analysts.
- Move request storage from localStorage to Postgres/SQLite through Prisma.
- Add request comments/activity history.
- Add attachment support.
- Add admin-managed categories, owners, and affected systems.

## Resume Bullet Draft

- Built an internal service request system with requester intake, support queue filtering, analyst status/owner updates, approval tracking, support notes, resolution documentation, and operational reporting for department technology workflows.
