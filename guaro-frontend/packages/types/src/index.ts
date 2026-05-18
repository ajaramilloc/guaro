// ─────────────────────────────────────────
// AUTH & USERS
// ─────────────────────────────────────────

export type Role = "SUPERADMIN" | "ADMIN" | "USER" | "BPO";

export type Team =
  | "CATALOG"
  | "MERCHANT_PERFORMANCE"
  | "COMMERCIAL"
  | "PRODUCT"
  | "USER_GROWTH"
  | "DIRECTOR";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  team: Team;
  isActive: boolean;
  createdAt: string;
  bpoProfile?: BpoProfile | null;
  adminProfile?: AdminProfile | null;
}

export interface BpoProfile {
  id: string;
  userId: string;
  maxWeight: number;
  activeWeight: number;
  user?: User;
}

export interface AdminProfile {
  id: string;
  userId: string;
  moduleId?: string | null;
}

export interface Invitation {
  id: string;
  token: string;
  role: Role;
  team: Team;
  moduleId?: string | null;
  createdById: string;
  usedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

// ─────────────────────────────────────────
// MERCHANTS & BRANDS
// ─────────────────────────────────────────

export interface Merchant {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export type KaType = "KA" | "CKA" | "SME";
export type PickingMode = "TWO_IN_ONE" | "BAPP_PICKING" | "DAPP_PICKING";
export type PaymentMode = "PREPAID_CARD" | "DIDI_PAYLESS" | "FOOD_MODE";
export type MenuMethod = "API" | "SFTP" | "BAPP";
export type BrandStatus = "PENDING" | "ACTIVE" | "INACTIVE";

export interface Brand {
  id: string;
  name: string;
  externalId?: string | null;
  merchantId: string;
  merchant?: Merchant;
  parentId?: string | null;
  parent?: Brand | null;
  children?: Brand[];
  kaType: KaType;
  country: string;
  isSubBrand: boolean;
  pickingMode?: PickingMode | null;
  paymentMode?: PaymentMode | null;
  menuMethod?: MenuMethod | null;
  assignedOpId?: string | null;
  assignedOp?: BpoProfile | null;
  status: BrandStatus;
  notes?: string | null;
  customFields?: Record<string, unknown> | null;
  applications?: BrandApplication[];
  stores?: Store[];
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  appName: string;
  country: string;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface BrandApplication {
  id: string;
  brandId: string;
  applicationId: string;
  application?: Application;
  isPrimary: boolean;
}

export interface Store {
  id: string;
  brandId: string;
  name: string;
  externalId?: string | null;
  city?: string | null;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────
// MODULES, SECTIONS, TASK TYPES
// ─────────────────────────────────────────

export interface Module {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  sections?: Section[];
}

export interface Section {
  id: string;
  moduleId: string;
  module?: Module;
  name: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  taskTypes?: TaskType[];
  webhooks?: SectionWebhook[];
}

export type ExecutionMode = "AUTOMATED" | "MANUAL" | "HYBRID";
export type AssignmentStrategy =
  | "WEIGHT_BALANCED"
  | "FIXED_BPO"
  | "ROUND_ROBIN"
  | "KA_TYPE_BASED";

export interface TaskType {
  id: string;
  sectionId: string;
  section?: Section;
  name: string;
  description?: string | null;
  executionMode: ExecutionMode;
  formSchema: Record<string, unknown>;
  workflowDefinition: WorkflowDefinition;
  assignmentStrategy: AssignmentStrategy;
  fixedBpoId?: string | null;
  estimatedWeight: number;
  slaHours: number;
  maxConcurrentPerBpo: number;
  retryAttempts: number;
  isActive: boolean;
  sortOrder: number;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: "auto" | "manual" | "gateway" | "join" | "start" | "end";
  label: string;
  sub?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

// ─────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "BLOCKED";

export type InputType = "SHEET_LINK" | "FILE_UPLOAD" | "NONE";
export type WebhookEvent =
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "TASK_FAILED"
  | "TASK_BLOCKED";

export interface Task {
  id: string;
  taskTypeId: string;
  taskType?: TaskType;
  brandId: string;
  brand?: Brand;
  storeId?: string | null;
  store?: Store | null;
  createdById: string;
  createdBy?: User;
  assignedBpoId?: string | null;
  assignedBpo?: BpoProfile | null;
  status: TaskStatus;
  inputType: InputType;
  inputValue?: string | null;
  formData: Record<string, unknown>;
  result?: TaskResult | null;
  blockReason?: string | null;
  workflowInstanceId?: string | null;
  createdBrandId?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  blockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: TaskComment[];
}

export interface TaskResult {
  rows_processed?: number;
  rows_failed?: number;
  errors?: Array<{ row: number; reason: string }>;
  duration_ms?: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  body: string;
  createdAt: string;
}

// ─────────────────────────────────────────
// WEBHOOKS
// ─────────────────────────────────────────

export type WebhookDeliveryStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "RETRYING";

export interface SectionWebhook {
  id: string;
  sectionId?: string | null;
  moduleId?: string | null;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  taskId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  httpStatus?: number | null;
  attempts: number;
  lastAttemptAt?: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
