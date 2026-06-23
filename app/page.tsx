"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Filter,
  KeyRound,
  LineChart,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TicketCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { serviceRequests } from "@/data/requests";
import { Department, RequestCategory, RequestPriority, RequestStatus, ServiceRequest } from "@/lib/types";
import {
  categories,
  chartRows,
  dashboardMetrics,
  getAgingDays,
  isOverdue,
  topRecurringIssues
} from "@/lib/metrics";

const departments: Department[] = ["HR", "Finance", "Operations", "Student Services", "IT", "Athletics"];
const statuses: RequestStatus[] = ["Submitted", "Triaged", "In Progress", "Waiting", "Resolved"];
const priorities: RequestPriority[] = ["Low", "Medium", "High", "Urgent"];
const owners = ["Maya Chen", "Jordan Price", "Avery Brooks", "Sam Rivera", "Nina Patel", "Marcus Green"];
const systems = ["Workday", "Banner", "Salesforce", "Tableau", "Microsoft 365", "Okta", "ServiceNow", "PeopleSoft", "Slack", "Power BI"];
const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];
const createdRequestsStorageKey = "internal-service-request-system.createdRequests";

type Filters = {
  search: string;
  status: string;
  priority: string;
  category: string;
  department: string;
  assignee: string;
};

const initialFilters: Filters = {
  search: "",
  status: "All",
  priority: "All",
  category: "All",
  department: "All",
  assignee: "All"
};

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof TicketCheck;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  return (
    <section className={`stat-card ${tone}`}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
      <Icon aria-hidden="true" />
    </section>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field compact">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function readCreatedRequests() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(createdRequestsStorageKey);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((request): request is ServiceRequest => {
      return (
        request &&
        typeof request.id === "string" &&
        typeof request.title === "string" &&
        typeof request.requester === "string" &&
        departments.includes(request.department) &&
        categories.includes(request.category) &&
        priorities.includes(request.priority) &&
        statuses.includes(request.status)
      );
    });
  } catch {
    return [];
  }
}

function nextRequestId(requests: ServiceRequest[]) {
  const maxId = requests.reduce((max, request) => {
    const match = request.id.match(/^ISR-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 2000);

  return `ISR-${String(maxId + 1).padStart(4, "0")}`;
}

function offsetDate(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function RequestDetail({ request }: { request: ServiceRequest }) {
  return (
    <aside className="detail-panel" id="request-detail">
      <div className="detail-head">
        <div>
          <p>{request.id}</p>
          <h2>{request.title}</h2>
        </div>
        <span className={`badge priority-${request.priority.toLowerCase()}`}>{request.priority}</span>
      </div>

      <div className="detail-section">
        <h3>Requester-provided details</h3>
        <div className="detail-grid">
          <span>Requester<strong>{request.requester}</strong></span>
          <span>Department<strong>{request.department}</strong></span>
          <span>Category<strong>{request.category}</strong></span>
          <span>Affected system<strong>{request.affectedSystem}</strong></span>
          <span>Submitted<strong>{request.submittedDate}</strong></span>
          <span>Priority requested<strong>{request.priority}</strong></span>
        </div>
        <div className="note-block compact-note">
          <h3>Description</h3>
          <p>{request.description}</p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Systems support tracking</h3>
        <div className="detail-grid">
          <span>Status<strong>{request.status}</strong></span>
          <span>Assigned owner<strong>{request.assignedOwner}</strong></span>
          <span>Due date<strong>{request.dueDate}</strong></span>
          <span>Approval required<strong>{request.approvalRequired ? "Yes" : "No"}</strong></span>
        </div>
        <div className="note-block compact-note">
          <h3>Internal Notes</h3>
          <p>{request.internalNotes}</p>
        </div>
      </div>

      <div className="detail-section">
        <h3>Resolution and documentation</h3>
        <div className="meta-list">
          <span><CheckCircle2 size={16} /> Resolved: <strong>{request.resolutionDate ?? "Pending"}</strong></span>
          <span><BookOpen size={16} /> SOP: <strong>{request.documentationLink ?? "Not linked"}</strong></span>
          <span><ShieldCheck size={16} /> Control owner: <strong>Systems support analyst</strong></span>
        </div>
        <div className="note-block compact-note">
          <h3>Resolution Summary</h3>
          <p>{request.resolutionSummary ?? "Resolution has not been entered yet."}</p>
        </div>
      </div>
    </aside>
  );
}

export default function Home() {
  const [filters, setFilters] = useState(initialFilters);
  const [activeId, setActiveId] = useState(serviceRequests[0].id);
  const [createdRequests, setCreatedRequests] = useState<ServiceRequest[]>([]);
  const [hasLoadedCreatedRequests, setHasLoadedCreatedRequests] = useState(false);

  useEffect(() => {
    setCreatedRequests(readCreatedRequests());
    setHasLoadedCreatedRequests(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedCreatedRequests) return;
    window.localStorage.setItem(createdRequestsStorageKey, JSON.stringify(createdRequests));
  }, [createdRequests, hasLoadedCreatedRequests]);

  const requests = useMemo(() => [...createdRequests, ...serviceRequests], [createdRequests]);
  const metrics = dashboardMetrics(requests);
  const rows = chartRows(requests);
  const recurring = topRecurringIssues(requests);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const haystack = `${request.id} ${request.title} ${request.requester} ${request.description} ${request.affectedSystem}`.toLowerCase();
      return (
        haystack.includes(filters.search.toLowerCase()) &&
        (filters.status === "All" || request.status === filters.status) &&
        (filters.priority === "All" || request.priority === filters.priority) &&
        (filters.category === "All" || request.category === filters.category) &&
        (filters.department === "All" || request.department === filters.department) &&
        (filters.assignee === "All" || request.assignedOwner === filters.assignee)
      );
    });
  }, [filters, requests]);

  const activeRequest = requests.find((request) => request.id === activeId) ?? filteredRequests[0] ?? requests[0];

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submittedDate = new Date();
    const newRequest: ServiceRequest = {
      id: nextRequestId(createdRequests),
      title: String(form.get("title")),
      requester: String(form.get("requester")),
      department: form.get("department") as Department,
      category: form.get("category") as RequestCategory,
      priority: form.get("priority") as RequestPriority,
      status: "Submitted",
      assignedOwner: "Unassigned",
      submittedDate: offsetDate(submittedDate, 0),
      dueDate: offsetDate(submittedDate, 7),
      resolutionDate: null,
      description: String(form.get("description")),
      internalNotes: "New intake submitted from operations form. Awaiting triage owner review.",
      resolutionSummary: null,
      documentationLink: null,
      approvalRequired: form.get("approvalRequired") === "on",
      affectedSystem: String(form.get("system")),
      recurringIssueKey: null
    };
    setCreatedRequests((current) => [newRequest, ...current]);
    setActiveId(newRequest.id);
    event.currentTarget.reset();
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p>Business Systems Operations</p>
          <h1>Internal Service Request System</h1>
        </div>
        <nav aria-label="Page sections">
          <a href="#dashboard">Dashboard</a>
          <a href="#queue">Support Workspace</a>
          <a href="#intake">Requester Intake</a>
          <a href="#reporting">Reporting</a>
        </nav>
      </header>

      <section className="dashboard" id="dashboard">
        <StatCard label="Open requests" value={metrics.openRequests} helper="Submitted through Waiting" icon={TicketCheck} />
        <StatCard label="SLA risk" value={metrics.slaRisk} helper="Due soon or already overdue" icon={AlertCircle} tone="red" />
        <StatCard label="Awaiting approval" value={metrics.awaitingApproval} helper="Open requests requiring review" icon={ShieldCheck} tone="amber" />
        <StatCard label="High priority open" value={metrics.highPriorityOpen} helper="High and urgent unresolved work" icon={KeyRound} tone="blue" />
        <StatCard label="Avg age open" value={`${metrics.averageOpenAge.toFixed(1)} days`} helper="Current unresolved request age" icon={Clock3} tone="green" />
        <StatCard label="Recurring issues" value={metrics.recurringIssues} helper="Tagged repeat incidents" icon={BarChart3} tone="amber" />
      </section>

      <section className="analytics-strip">
        <div className="chart-panel">
          <div className="section-title">
            <h2>Requests by Category</h2>
            <span>{requests.length} total records</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rows.categoryRows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {rows.categoryRows.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-panel">
          <div className="section-title">
            <h2>Requests by Department</h2>
            <span>Operational demand</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rows.departmentRows} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
                {rows.departmentRows.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-list">
            {rows.departmentRows.map((row, index) => (
              <span key={row.name}><i style={{ background: colors[index % colors.length] }} />{row.name}: {row.value}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="workspace" id="queue">
        <div className="queue-panel">
          <div className="section-title">
            <div>
              <h2>Systems Support Workspace</h2>
              <span>{filteredRequests.length} matching requests · analysts control status, owner, notes, resolution, and SOP links</span>
            </div>
            <button className="ghost-button" onClick={() => setFilters(initialFilters)}><Filter size={16} /> Reset filters</button>
          </div>
          <div className="filters">
            <label className="search-field">
              <Search size={17} />
              <input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search request, requester, system" />
            </label>
            <SelectControl label="Status" value={filters.status} options={["All", ...statuses]} onChange={(value) => updateFilter("status", value)} />
            <SelectControl label="Priority" value={filters.priority} options={["All", ...priorities]} onChange={(value) => updateFilter("priority", value)} />
            <SelectControl label="Category" value={filters.category} options={["All", ...categories]} onChange={(value) => updateFilter("category", value)} />
            <SelectControl label="Department" value={filters.department} options={["All", ...departments]} onChange={(value) => updateFilter("department", value)} />
            <SelectControl label="Assignee" value={filters.assignee} options={["All", ...owners, "Unassigned"]} onChange={(value) => updateFilter("assignee", value)} />
          </div>

          <div className="request-table" role="table" aria-label="Service requests">
            <div className="table-row table-head" role="row">
              <span>ID</span><span>Request</span><span>Status</span><span>Priority</span><span>Department</span><span>Aging</span>
            </div>
            {filteredRequests.slice(0, 18).map((request) => (
              <button className={`table-row ${activeRequest.id === request.id ? "selected" : ""}`} key={request.id} onClick={() => setActiveId(request.id)} role="row">
                <span>{request.id}</span>
                <span><strong>{request.title}</strong><small>{request.requester} · {request.affectedSystem}</small></span>
                <span className="badge">{request.status}</span>
                <span className={`badge priority-${request.priority.toLowerCase()}`}>{request.priority}</span>
                <span>{request.department}</span>
                <span className={isOverdue(request) ? "overdue" : ""}>{getAgingDays(request)}d</span>
              </button>
            ))}
          </div>
        </div>

        <RequestDetail request={activeRequest} />
      </section>

      <section className="intake-report">
        <form className="intake-form" id="intake" onSubmit={handleSubmit}>
          <div className="section-title">
            <div>
              <h2>Requester Intake</h2>
              <span>For department users requesting access, reports, system help, or workflow changes · {createdRequests.length} saved locally</span>
            </div>
            <FilePlus2 aria-hidden="true" />
          </div>
          <div className="form-grid">
            <label className="field"><span>Request title</span><input name="title" required placeholder="Example: Add Tableau access for Finance analyst" /></label>
            <label className="field"><span>Requester</span><input name="requester" required placeholder="Name" /></label>
            <label className="field"><span>Category</span><select name="category">{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <div className="form-grid four">
            <label className="field"><span>Department</span><select name="department">{departments.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="field"><span>Priority</span><select name="priority">{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="field"><span>Affected system/tool</span><select name="system">{systems.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <label className="field"><span>Business need</span><textarea name="description" required rows={4} placeholder="Describe what is needed, the affected users, timing, business impact, and any known approval details." /></label>
          <label className="check-field"><input name="approvalRequired" type="checkbox" /> Access approval is required</label>
          <button className="primary-button" type="submit"><CheckCircle2 size={17} /> Submit for systems support review</button>
        </form>

        <section className="report-panel" id="reporting">
          <div className="section-title">
            <div>
              <h2>Operational Reporting</h2>
              <span>Demand, approval workload, aging, and repeat problem signals</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={rows.trendRows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={3} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="averageDays" stroke="#f59e0b" strokeWidth={3} />
            </ReLineChart>
          </ResponsiveContainer>
          <div className="operations-grid">
            <section>
              <h3>Top Affected Systems</h3>
              {rows.topSystemRows.map((system) => (
                <div key={system.name} className="metric-row">
                  <strong>{system.name}</strong>
                  <span>{system.value} requests</span>
                </div>
              ))}
            </section>

            <section>
              <h3>Average Age by Category</h3>
              {rows.categoryAgeRows.map((category) => (
                <div key={category.name} className="metric-row">
                  <strong>{category.name}</strong>
                  <span>{category.value.toFixed(1)} days</span>
                </div>
              ))}
            </section>

            <section>
              <h3>Priority Mix</h3>
              {rows.priorityRows.map((priority) => (
                <div key={priority.name} className="metric-row">
                  <strong>{priority.name}</strong>
                  <span>{priority.value} requests</span>
                </div>
              ))}
            </section>

            <section>
              <h3>Recurring Issues</h3>
              {recurring.map((issue) => (
                <div key={issue.name} className="metric-row">
                  <strong>{issue.name}</strong>
                  <span>{issue.count} related</span>
                </div>
              ))}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
