import { Department, RequestCategory, RequestPriority, RequestStatus, ServiceRequest } from "@/lib/types";

const departments: Department[] = ["HR", "Finance", "Operations", "Student Services", "IT", "Athletics"];
const statuses: RequestStatus[] = ["Submitted", "Triaged", "In Progress", "Waiting", "Resolved"];
const priorities: RequestPriority[] = ["Low", "Medium", "High", "Urgent"];
const owners = ["Maya Chen", "Jordan Price", "Avery Brooks", "Sam Rivera", "Nina Patel", "Marcus Green"];
const systems = ["Workday", "Banner", "Salesforce", "Tableau", "Microsoft 365", "Okta", "ServiceNow", "PeopleSoft", "Slack", "Power BI"];
const requesters = [
  "Alicia Morgan",
  "Ben Carter",
  "Priya Desai",
  "Evan Walsh",
  "Monica Hayes",
  "Diego Ramirez",
  "Tara Nguyen",
  "Olivia Brooks",
  "Noah Bennett",
  "Camila Santos",
  "Harper Lewis",
  "Grace Wilson"
];

type Template = {
  category: RequestCategory;
  title: string;
  description: string;
  notes: string;
  resolution: string;
  doc: string;
  recurring: string | null;
};

const templates: Template[] = [
  {
    category: "Access Change",
    title: "Update role access for department transfer",
    description: "Requester needs role changes after moving into a new operating unit. Remove legacy permissions and add dashboard access for the new team.",
    notes: "Manager approval required. Validate least-privilege access before provisioning.",
    resolution: "Access profile updated, former role removed, requester notified with validation steps.",
    doc: "/sops/access-change-role-review",
    recurring: null
  },
  {
    category: "Onboarding",
    title: "Provision new employee application bundle",
    description: "New employee needs standard application access, shared mailbox membership, and reporting folder permissions before start date.",
    notes: "Coordinate HR start date with IT account creation and department approver.",
    resolution: "Accounts provisioned, onboarding checklist completed, confirmation sent to hiring manager.",
    doc: "/sops/new-hire-systems-checklist",
    recurring: null
  },
  {
    category: "Software Issue",
    title: "Recurring login error after password reset",
    description: "User can authenticate to Microsoft 365 but receives an invalid session error when launching the student records portal.",
    notes: "Pattern matches cached SSO token issue. Check Okta assignment and browser session state.",
    resolution: "Cleared stale session, refreshed Okta app assignment, and added case to recurring login tracker.",
    doc: "/kb/sso-session-refresh",
    recurring: "SSO login loop"
  },
  {
    category: "System Issue",
    title: "Workflow notification rule not firing",
    description: "Approval notifications are not reaching queue owners when requests enter Waiting status.",
    notes: "Review notification rule criteria and recent configuration changes.",
    resolution: "Corrected queue owner condition and tested workflow routing with sample request.",
    doc: "/sops/workflow-notification-rules",
    recurring: "Workflow notification gap"
  },
  {
    category: "Reporting Request",
    title: "Create monthly department volume report",
    description: "Department leadership needs request volume, average resolution days, overdue count, and category breakdown for monthly operations review.",
    notes: "Confirm metric definitions and filter resolved requests by resolution date.",
    resolution: "Published monthly report view and documented refresh cadence.",
    doc: "/reports/monthly-service-volume",
    recurring: null
  },
  {
    category: "Documentation",
    title: "Refresh SOP for finance approval queue",
    description: "Existing SOP has outdated screenshots and does not include the new approval-required flag.",
    notes: "Compare current workflow screens against process owner notes.",
    resolution: "SOP updated with new screenshots, approval criteria, and escalation notes.",
    doc: "/sops/finance-approval-queue",
    recurring: null
  },
  {
    category: "System Issue",
    title: "Configure routing rule for athletics requests",
    description: "Athletics requests should route to the operations owner when the issue affects event staffing tools.",
    notes: "Add category and department rule, then test with intake submission.",
    resolution: "Routing configuration updated and test request assigned correctly.",
    doc: "/sops/request-routing-matrix",
    recurring: "Routing rule tuning"
  }
];

function isoDate(daysAgo: number) {
  const date = new Date("2026-06-22T12:00:00-04:00");
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export const serviceRequests: ServiceRequest[] = Array.from({ length: 120 }, (_, index) => {
  const template = templates[index % templates.length];
  const status = index % 5 === 0 ? "Resolved" : statuses[(index + Math.floor(index / 9)) % statuses.length];
  const submittedOffset = 2 + ((index * 3) % 96);
  const dueOffset = submittedOffset - (5 + (index % 10));
  const resolutionOffset = status === "Resolved" ? Math.max(0, submittedOffset - (2 + (index % 12))) : null;
  const urgentBoost = template.category === "Access Change" && index % 11 === 0;
  const priority = urgentBoost ? "Urgent" : priorities[(index + template.category.length) % priorities.length];
  const department = departments[(index * 2 + template.title.length) % departments.length];
  const system = systems[(index + department.length) % systems.length];
  const id = `ISR-${String(index + 1001).padStart(4, "0")}`;

  return {
    id,
    title: `${template.title} ${index % 4 === 0 ? "for quarter close" : index % 3 === 0 ? "for service desk handoff" : ""}`.trim(),
    requester: requesters[(index + department.length) % requesters.length],
    department,
    category: template.category,
    priority,
    status,
    assignedOwner: owners[(index + template.category.length) % owners.length],
    submittedDate: isoDate(submittedOffset),
    dueDate: isoDate(Math.max(0, dueOffset)),
    resolutionDate: resolutionOffset === null ? null : isoDate(resolutionOffset),
    description: template.description,
    internalNotes: `${template.notes} Last touchpoint logged by ${owners[index % owners.length]} with ${department} stakeholder.`,
    resolutionSummary: status === "Resolved" ? template.resolution : null,
    documentationLink: template.doc,
    approvalRequired: template.category === "Access Change" || index % 6 === 0,
    affectedSystem: system,
    recurringIssueKey: index % 4 === 0 ? template.recurring : null
  };
});
