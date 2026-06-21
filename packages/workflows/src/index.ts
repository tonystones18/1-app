export type WorkflowStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export interface WorkflowDefinition {
  id: string;
  key: string;
  version: number;
  status: WorkflowStatus;
  ownerDomain: string;
}

export interface WorkflowTask {
  id: string;
  workflowInstanceId: string;
  assigneeRoleId: string;
  dueAt?: string;
  completedAt?: string;
}
