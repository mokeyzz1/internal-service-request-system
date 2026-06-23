# Internal Service Request System

A lightweight internal operations system for tracking technology service requests, access changes, onboarding tasks, recurring issues, resolution notes, and reporting metrics across department users.

## Problem Statement

Internal support teams often manage requests across email, spreadsheets, chat, and disconnected ticket notes. That makes it harder to see open work, aging issues, approval needs, recurring system problems, handoff context, and reporting trends. This project centralizes the service request lifecycle in one simple application.

## Objective

Create a practical Business Systems Analyst / Application Support portfolio project that demonstrates request intake, triage workflows, access-change tracking, documentation links, resolution notes, recurring issue analysis, and operational reporting.

## Screenshots

![Dashboard](public/screenshots/dashboard.png)

![Reporting view](public/screenshots/reporting.png)

## User Workflow

1. A department user submits a request through the intake form with category, department, priority, affected system, description, and approval requirement.
2. The support team reviews the queue and filters by status, priority, category, department, or assignee.
3. A request owner opens the detail panel to review requester information, internal notes, due date, documentation link, affected system, and resolution fields.
4. Requests move through the workflow: Submitted, Triaged, In Progress, Waiting, and Resolved.
5. Leadership uses the dashboard and reporting view to monitor open work, aging requests, overdue work, resolution time, access changes, category volume, department volume, and recurring issues.

## Core Features

- Dashboard cards for open requests, aging requests, average resolution time, overdue requests, completed access changes, and recurring issues.
- Request queue with search and filters for status, priority, category, department, and assignee.
- Request detail panel with requester, department, category, priority, status, owner, submitted date, due date, resolution date, description, notes, resolution summary, SOP link, approval requirement, and affected system.
- Intake form for creating a new submitted request in the local app state.
- Reporting view with trend charts and recurring issue summaries.
- 120 realistic seed records across HR, Finance, Operations, Student Services, IT, and Athletics.

## Data Model

The current app uses typed local seed data in `data/requests.ts`, shaped to map cleanly into the included Prisma model in `prisma/schema.prisma`.

Primary request fields:

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

Recommended database path:

1. Copy `.env.example` to `.env`.
2. Keep `DATABASE_URL="file:./dev.db"` for SQLite.
3. Use the Prisma schema as the persistence layer when moving beyond seed data.

## Dashboard and Reporting

The dashboard calculates operational metrics from the request dataset:

- Open requests: all requests not marked Resolved.
- Aging requests: open requests older than 14 days.
- Average resolution time: average days between submitted and resolved dates.
- Access changes completed: resolved Access Change requests.
- Overdue requests: open requests past due date.
- Recurring issues: requests tagged with a repeat issue key.

The reporting view highlights volume trends, resolved volume, average resolution days, category distribution, department distribution, and recurring system problems.

## Business Systems Analyst / Application Support Mapping

This project demonstrates common BSA and application support responsibilities:

- Request intake and triage design.
- Workflow states and handoff visibility.
- Access change tracking with approval flags.
- System and tool impact analysis.
- Internal notes and resolution documentation.
- SOP and knowledge-base linking.
- Operational metrics for process improvement.
- Identification of recurring incidents that may need root-cause analysis.

## Tech Stack

- Next.js
- TypeScript
- Recharts
- Lucide React
- Prisma schema prepared for SQLite
- Local typed seed data for fast portfolio/demo use

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

## Resume Bullets

- Built an internal service request system for tracking technology requests, access changes, onboarding tasks, recurring issues, resolution notes, and reporting metrics across department users.
- Designed request categories, priority levels, status workflows, approval fields, and documentation links to support triage, handoffs, and repeatable service delivery.
- Created reporting views for open requests, aging issues, resolution trends, category volume, and recurring system problems to identify process improvement opportunities.
