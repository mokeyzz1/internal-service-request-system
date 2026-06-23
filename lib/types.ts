export type RequestStatus = "Submitted" | "Triaged" | "In Progress" | "Waiting" | "Resolved";
export type RequestPriority = "Low" | "Medium" | "High" | "Urgent";
export type RequestCategory =
  | "Access Change"
  | "Onboarding"
  | "Software Issue"
  | "System Issue"
  | "Reporting Request"
  | "Documentation";

export type Department = "HR" | "Finance" | "Operations" | "Student Services" | "IT" | "Athletics";

export type ServiceRequest = {
  id: string;
  title: string;
  requester: string;
  department: Department;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  assignedOwner: string;
  submittedDate: string;
  dueDate: string;
  resolutionDate: string | null;
  description: string;
  internalNotes: string;
  resolutionSummary: string | null;
  documentationLink: string | null;
  approvalRequired: boolean;
  affectedSystem: string;
  recurringIssueKey: string | null;
};
