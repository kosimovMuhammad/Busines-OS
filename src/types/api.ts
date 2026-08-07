import type {
  CommChannel,
  ContractStatus,
  DealStage,
  InvoiceStatus,
  MeetingStatus,
  NotificationChannel,
  NotificationType,
  PaymentMethod,
  Plan,
  TaskPriority,
  TaskStatus,
  TemplateType,
  UserRole,
  UserStatus,
} from "./enums";

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

// ---- Auth ----

export type RegisterRequest = {
  companyName: string;
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AcceptInviteRequest = {
  token: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

// ---- Users ----

export type User = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InviteUserRequest = {
  name: string;
  email: string;
  role?: UserRole;
  rbacRoleId?: string;
};

export type UpdateUserRequest = {
  name?: string;
  avatarUrl?: string;
  status?: UserStatus;
};

export type UpdateRoleRequest = { role: UserRole; rbacRoleId?: string | null };

// ---- RBAC: Roles & Permissions ----

export type Permission = {
  id: string;
  key: string;
  module: string;
  description: string;
};

export type RbacRole = {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRoleRequest = {
  name: string;
  description?: string;
  permissionIds?: string[];
};

export type UpdateRoleDetailsRequest = {
  name?: string;
  description?: string;
};

export type AttachPermissionRequest = { permissionId: string };

export type CreatePermissionRequest = {
  key: string;
  module: string;
  description?: string;
};

export type UpdatePermissionRequest = { description?: string };

// ---- Departments ----

export type Department = {
  id: string;
  name: string;
  description: string | null;
  parentDepartmentId: string | null;
  managerId: string | null;
  managerName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentTreeNode = {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  managerName: string | null;
  createdAt: string;
  updatedAt: string;
  children: DepartmentTreeNode[];
};

export type CreateDepartmentRequest = {
  name: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
};

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

// ---- Teams ----

export type Team = {
  id: string;
  departmentId: string | null;
  name: string;
  description: string | null;
  teamLeadId: string | null;
  teamLeadName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  userId: string;
  userName: string;
  joinedAt: string;
};

export type CreateTeamRequest = {
  name: string;
  departmentId?: string;
  description?: string;
  teamLeadId?: string;
};

export type UpdateTeamRequest = Partial<CreateTeamRequest>;

export type AddTeamMemberRequest = { userId: string };

// ---- Branches ----

export type Branch = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  timezone: string | null;
  isHeadquarters: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBranchRequest = {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  isHeadquarters?: boolean;
};

export type UpdateBranchRequest = Partial<CreateBranchRequest>;

// ---- Org Chart ----

export type OrgChartPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  managerId?: string | null;
};

export type OrgChartDepartmentNode = {
  id: string;
  name: string;
  managerId: string | null;
  managerName: string | null;
  employees: OrgChartPerson[];
  children: OrgChartDepartmentNode[];
};

export type OrgChart = {
  departments: OrgChartDepartmentNode[];
  unassignedEmployees: OrgChartPerson[];
};

export type OrgChartForUser = {
  user: { id: string; name: string; avatarUrl: string | null };
  managementChain: OrgChartPerson[];
  directReports: OrgChartPerson[];
};

// ---- User permission overrides ----

export type UserPermissionOverrideItem = {
  permissionId: string;
  allow: boolean;
};

export type UserPermissions = {
  userId: string;
  roleId: string;
  roleName: string;
  permissionKeys: string[];
  overrides: UserPermissionOverrideItem[];
};

export type UpdateUserPermissionsRequest = {
  overrides: UserPermissionOverrideItem[];
};

// ---- Contracts ----

export type Contract = {
  id: string;
  title: string;
  counterpartyName: string | null;
  contactId: string | null;
  contactName: string | null;
  dealId: string | null;
  dealTitle: string | null;
  content: string | null;
  status: ContractStatus;
  effectiveDate: string | null;
  expiryDate: string | null;
  templateId: string | null;
  signedAt: string | null;
  signedByUserId: string | null;
  signedByUserName: string | null;
  signedIpAddress: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
};

export type ContractsQueryArgs = {
  status?: ContractStatus;
  contactId?: string;
  dealId?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
};

export type CreateContractRequest = {
  title: string;
  counterpartyName?: string;
  contactId?: string;
  dealId?: string;
  content?: string;
  templateId?: string;
  effectiveDate?: string;
  expiryDate?: string;
};

export type UpdateContractRequest = Partial<Omit<CreateContractRequest, "templateId">> & {
  status?: ContractStatus;
};

// ---- Templates ----

export type Template = {
  id: string;
  name: string;
  type: TemplateType;
  content: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateRequest = {
  name: string;
  type: TemplateType;
  content?: string;
  isActive?: boolean;
};

export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

// ---- Search ----

export type SearchResultType =
  | "contacts"
  | "deals"
  | "tasks"
  | "users"
  | "files"
  | "emails"
  | "messages";

export type SearchResultItem = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  link: string;
  score: number;
};

export type SearchGroup = {
  type: SearchResultType;
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  allowed: boolean;
};

export type GlobalSearchResponse = {
  query: string;
  groups: SearchGroup[];
};

export type GlobalSearchArgs = {
  q: string;
  types?: SearchResultType[];
  page?: number;
  limit?: number;
};

// ---- Company ----

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  plan: Plan;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCompanyRequest = {
  name?: string;
  industry?: string;
  timezone?: string;
};

export type PlanInfo = { plan: Plan };

export type UpdatePlanRequest = { plan: Plan };

// ---- Contacts ----

export type Contact = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  companyName: string | null;
  notes: string | null;
  ownerId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateContactRequest = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  companyName?: string;
  notes?: string;
  ownerId?: string;
  tags?: string[];
};

export type UpdateContactRequest = Partial<CreateContactRequest>;

// ---- Deals ----

export type Deal = {
  id: string;
  companyId: string;
  contactId: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number | null;
  expectedCloseDate: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDealRequest = {
  contactId: string;
  title: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  ownerId?: string;
};

// PATCH /deals/:id rejects `stage` (422 "property stage should not exist") -
// stage changes only go through PATCH /deals/:id/stage (see updateDealStage).
export type UpdateDealRequest = Partial<
  Omit<CreateDealRequest, "contactId" | "stage">
> & {
  contactId?: string;
};

// ---- Tasks & Time Tracking ----

export type TaskAssignee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
};

export type Task = {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string | null;
  dueDate: string | null;
  dealId: string | null;
  contactId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: TaskAssignee | null;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
  dealId?: string;
  contactId?: string;
};

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, "status">>;

export type TimeEntry = {
  id: string;
  companyId: string;
  taskId: string;
  userId: string;
  note: string | null;
  startedAt: string;
  stoppedAt: string | null;
  durationSec: number | null;
  createdAt: string;
  // Only present on the POST .../time/stop response.
  totalTimeSec?: number;
};

export type ActiveTimeEntry = TimeEntry & { task: Task };

// ---- Communications ----

export type Communication = {
  id: string;
  companyId: string;
  // null when the contact was later deleted.
  contactId: string | null;
  channel: CommChannel;
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  attachments: string[] | null;
  providerMessageId: string | null;
  status: string;
  aiSummary: string | null;
  timestamp: string;
};

export type CreateNoteRequest = {
  contactId: string;
  content: string;
  direction?: "INBOUND" | "OUTBOUND";
};

// ---- WhatsApp ----

export type WhatsappAccount = {
  id: string;
  companyId: string;
  phoneNumberId: string;
  wabaId: string;
  verifiedName: string | null;
  createdAt: string;
};

export type ConnectWhatsappAccountRequest = {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  verifiedName?: string;
};

export type SendWhatsappRequest = {
  contactId: string;
  message: string;
};

// ---- Email ----

export type SendEmailRequest = {
  contactId: string;
  subject: string;
  body: string;
};

export type EmailConnectResponse = { url: string };

// ---- Company Integrations ----

export type IntegrationStatus = { connected: boolean; comingSoon?: boolean };

export type CompanyIntegrations = {
  whatsapp: IntegrationStatus;
  gmail: IntegrationStatus;
  outlook: IntegrationStatus;
  telegram: IntegrationStatus;
  stripe: IntegrationStatus;
  paypal: IntegrationStatus;
};

// ---- AI ----

export type AiQueryRequest = { question: string };
export type AiDraftEmailRequest = { contactId: string; context?: string };
export type QuotationItem = { description: string; quantity: number; unitPrice: number };
export type AiGenerateQuotationRequest = { dealId: string; items: QuotationItem[] };

export type SummarizeRequest = { communicationId: string };

// Verified live once GEMINI_API_KEY was provisioned: /ai/query,
// /ai/draft-email and /ai/generate-quotation all return {queued:true, id}
// from their POST. /ai/summarize is the one exception - it echoes back
// {queued:true, communicationId} instead of an `id` (see
// AiSummarizeQueued below), since its result is looked up by
// communicationId, not a separate job id.
export type AiJobQueued = { queued: true; id: string };

export type AiSummarizeQueued = { queued: true; communicationId: string };

// Every AI "result" endpoint follows the same real, verified envelope:
// 200 = done (shape below, per endpoint), 404 = not ready yet (poll again),
// 422 = failed (standard Nest error body, e.g. verified real
// "AWS S3 not configured" for quotations, or "couldn't understand the
// question" for an unclassifiable query) - there is no embedded
// PENDING/FAILED status field in a 200 body as TZ's generic description
// might suggest.
export type AiSummaryRecord = {
  id: string;
  communicationId: string;
  summary: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  actionItems: {
    tasks: string[];
    dealStage: string | null;
    importantDates: string[];
  };
  nextFollowUp: string | null;
  generatedAt: string;
};

// `resultRows` shape varies by `intent` (e.g. REVENUE_BY_PERIOD above) -
// the UI only relies on `answer`, a ready-to-display sentence.
export type AiQueryResult = {
  id: string;
  companyId: string;
  question: string;
  intent: string;
  status: "COMPLETED";
  resultRows: unknown;
  answer: string;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string;
};

export type AiDraftEmailResult = {
  id: string;
  companyId: string;
  contactId: string;
  context: string | null;
  status: "COMPLETED";
  subject: string;
  body: string;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string;
};

// Inferred from the endpoint's Swagger description ("totals + FileAsset +
// presigned download URL") - never observed as a real 200 in this
// environment since AWS S3 isn't configured (verified real 422 instead).
// Revisit once S3 is provisioned.
export type AiQuotationResult = {
  subtotal: number;
  total: number;
  file: FileAsset;
};

// ---- Files ----

export type FileAsset = {
  id: string;
  companyId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  contactId: string | null;
  dealId: string | null;
  invoiceId: string | null;
  createdAt: string;
};

export type PresignUploadRequest = {
  filename: string;
  mimeType: string;
  contactId?: string;
  dealId?: string;
  invoiceId?: string;
};

export type PresignUploadResponse = {
  uploadUrl: string;
  s3Key: string;
};

export type ConfirmFileRequest = {
  s3Key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contactId?: string;
  dealId?: string;
  invoiceId?: string;
};

// ---- Invoicing ----

export type Invoice = {
  id: string;
  companyId: string;
  dealId: string | null;
  contactId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /invoices/:id (and create/update responses) embed the related
// contact/deal/payments directly - GET /invoices (list) does not.
export type InvoiceDetail = Invoice & {
  contact: Contact;
  deal: Deal | null;
  payments: Payment[];
};

export type CreateInvoiceRequest = {
  dealId?: string;
  contactId: string;
  amount: number;
  currency?: string;
  dueDate: string;
  notes?: string;
};

export type UpdateInvoiceRequest = Partial<Omit<CreateInvoiceRequest, "contactId">>;

export type UpdateInvoiceStatusRequest = { status: InvoiceStatus };

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes: string | null;
  createdAt: string;
};

export type CreatePaymentRequest = {
  amount: number;
  method: PaymentMethod;
  paidAt?: string;
  notes?: string;
};

// ---- Calendar ----

// Verified live: GET /meetings (list), the single-meeting GET, and
// /dashboard/upcoming-meetings all return this same shape - contact/deal
// are always populated (never omitted on the list like Invoicing does),
// and Google Calendar sync metadata is present on every record even when
// never connected (all null/NOT_SYNCED).
export type CalendarSyncStatus = "NOT_SYNCED" | "SYNCED" | "ERROR";

export type Meeting = {
  id: string;
  companyId: string;
  title: string;
  contactId: string | null;
  dealId: string | null;
  organizerId: string;
  attendeeUserIds: string[];
  startAt: string;
  endAt: string;
  location: string | null;
  description: string | null;
  status: MeetingStatus;
  googleEventId: string | null;
  googleCalendarId: string | null;
  syncStatus: CalendarSyncStatus;
  syncError: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contact: Contact | null;
  deal: Deal | null;
};

export type CreateMeetingRequest = {
  title: string;
  contactId?: string;
  dealId?: string;
  startAt: string;
  endAt: string;
  location?: string;
  description?: string;
  attendeeUserIds?: string[];
};

export type UpdateMeetingRequest = Partial<CreateMeetingRequest>;

export type UpdateMeetingStatusRequest = { status: MeetingStatus };

// GET /calendar/status - `connected: false` verified live; the shape of
// additional fields once connected is inferred from the endpoint's
// "connection status and sync health" description.
export type CalendarConnectionStatus = {
  connected: boolean;
  lastSyncedAt?: string | null;
  syncError?: string | null;
};

export type CalendarConnectResponse = { url: string };

// ---- Analytics / Dashboard ----

export type DashboardOverview = {
  contactsCount: number;
  openTasksCount: number;
  dealsByStage: Partial<Record<DealStage, number>>;
  todayTimeTrackedSec: number;
};

export type SalesAnalytics = {
  pipelineByStage: Partial<Record<DealStage, number>>;
  winRate: number;
};

export type MonthlyValue = { month: string; value: number };

export type RevenueAnalytics = {
  totalWonValue: number;
  byMonth: MonthlyValue[];
};

export type TaskAnalytics = {
  byStatus: Partial<Record<TaskStatus, number>>;
  byPriority: Partial<Record<TaskPriority, number>>;
  overdueCount: number;
};

export type ActivityFeedItem = {
  type: string;
  timestamp: string;
  data: {
    id: string;
    title?: string;
    status?: string;
    stage?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
};

export type FinanceAnalytics = {
  totalOutstanding: number;
  totalPaid: number;
  overdueCount: number;
  overdueAmount: number;
  revenueByMonth: MonthlyValue[];
};

export type ForecastAnalytics = {
  estimatedRevenue: number;
  confidencePercentage: number;
  breakdown: {
    weightedDealValue: number;
    weightedInvoiceValue: number;
    openDealsCount: number;
    dueSoonInvoicesCount: number;
  };
  summary: string;
};

// contact/deal are already part of Meeting itself (verified always
// populated) - this alias just documents intent at dashboard call sites.
export type UpcomingMeeting = Meeting;

// ---- Activity Log ----

export type ActivityLogEntry = {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  action: string;
  changesJson: string | null;
  createdAt: string;
};

// ---- Audit Log ----

export type AuditLogEntry = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  metadataJson: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export type AuditLogQueryArgs = {
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type LoginHistoryEntry = {
  id: string;
  loginAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  success: boolean;
  failureReason: string | null;
  isNewDevice: boolean;
};

// ---- Sessions ----

export type Session = {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

// ---- API Keys ----

export type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  createdByUserId: string;
  createdByUserName: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

// POST /api-keys is the only response that ever includes the raw secret -
// it is shown once and never retrievable again afterwards.
export type CreatedApiKey = ApiKey & { rawKey: string };

export type CreateApiKeyRequest = { name: string; expiresAt?: string };
export type UpdateApiKeyRequest = { name?: string; isActive?: boolean };

// ---- Notifications ----

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationsQueryArgs = {
  isRead?: boolean;
  page?: number;
  limit?: number;
};

export type NotificationPreferenceItem = {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
};

export type UpdateNotificationPreferencesRequest = {
  preferences: NotificationPreferenceItem[];
};
