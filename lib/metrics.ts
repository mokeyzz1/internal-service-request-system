import { serviceRequests } from "@/data/requests";
import { RequestCategory, ServiceRequest } from "@/lib/types";

export const today = new Date("2026-06-22T12:00:00-04:00");

export function daysBetween(start: string, end: string | Date) {
  const endDate = typeof end === "string" ? new Date(`${end}T12:00:00`) : end;
  const startDate = new Date(`${start}T12:00:00`);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

export function getAgingDays(request: ServiceRequest) {
  return daysBetween(request.submittedDate, request.resolutionDate ?? today);
}

export function getResolutionDays(request: ServiceRequest) {
  if (!request.resolutionDate) return null;
  return daysBetween(request.submittedDate, request.resolutionDate);
}

export function isOpen(request: ServiceRequest) {
  return request.status !== "Resolved";
}

export function isOverdue(request: ServiceRequest) {
  return isOpen(request) && new Date(`${request.dueDate}T23:59:59`).getTime() < today.getTime();
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export function dashboardMetrics(requests = serviceRequests) {
  const resolved = requests.filter((request) => request.status === "Resolved");
  const open = requests.filter(isOpen);
  const aging = open.filter((request) => getAgingDays(request) >= 14);
  const accessChanges = resolved.filter((request) => request.category === "Access Change").length;
  const recurringIssues = requests.filter((request) => request.recurringIssueKey).length;
  const resolutionTimes = resolved.map(getResolutionDays).filter((days): days is number => days !== null);
  const openAges = open.map(getAgingDays);
  const slaRisk = open.filter((request) => {
    const daysUntilDue = daysBetween(today.toISOString().slice(0, 10), request.dueDate);
    return isOverdue(request) || daysUntilDue <= 2;
  });
  const awaitingApproval = open.filter((request) => request.approvalRequired);
  const highPriorityOpen = open.filter((request) => request.priority === "High" || request.priority === "Urgent");

  return {
    openRequests: open.length,
    agingRequests: aging.length,
    averageResolutionTime: average(resolutionTimes),
    averageOpenAge: average(openAges),
    accessChangesCompleted: accessChanges,
    recurringIssues,
    overdueRequests: requests.filter(isOverdue).length,
    slaRisk: slaRisk.length,
    awaitingApproval: awaitingApproval.length,
    highPriorityOpen: highPriorityOpen.length
  };
}

export function chartRows(requests = serviceRequests) {
  const categories = countBy(requests.map((request) => request.category));
  const departments = countBy(requests.map((request) => request.department));
  const status = countBy(requests.map((request) => request.status));
  const priority = countBy(requests.map((request) => request.priority));
  const systems = countBy(requests.map((request) => request.affectedSystem));
  const categoryRows = Object.entries(categories).map(([name, value]) => ({ name, value }));
  const departmentRows = Object.entries(departments).map(([name, value]) => ({ name, value }));
  const statusRows = Object.entries(status).map(([name, value]) => ({ name, value }));
  const priorityRows = Object.entries(priority).map(([name, value]) => ({ name, value }));
  const topSystemRows = Object.entries(systems)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const categoryAgeRows = Object.entries(categories).map(([name]) => {
    const matchingRequests = requests.filter((request) => request.category === name && isOpen(request));
    return {
      name,
      value: Number(average(matchingRequests.map(getAgingDays)).toFixed(1))
    };
  });
  const trendRows = ["Mar", "Apr", "May", "Jun"].map((month, index) => ({
    month,
    volume: 22 + index * 7 + (index % 2) * 5,
    resolved: 17 + index * 6,
    averageDays: 8.6 - index * 0.7
  }));

  return { categoryRows, departmentRows, statusRows, priorityRows, topSystemRows, categoryAgeRows, trendRows };
}

export function topRecurringIssues(requests = serviceRequests) {
  const issueCounts = countBy(
    requests
      .map((request) => request.recurringIssueKey)
      .filter((issue): issue is string => Boolean(issue))
  );

  return Object.entries(issueCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export const categories: RequestCategory[] = [
  "Access Change",
  "Onboarding",
  "Software Issue",
  "System Issue",
  "Reporting Request",
  "Documentation"
];
