import type {
  CommChannel,
  DealStage,
  InvoiceStatus,
  MeetingStatus,
  PaymentMethod,
  Plan,
  TaskPriority,
  TaskStatus,
  UserRole,
  UserStatus,
} from "./enums";

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
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
};

export type UpdateUserRequest = {
  name?: string;
  avatarUrl?: string;
  status?: UserStatus;
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

// Every AI "enqueue" endpoint (verified via POST /ai/generate-quotation,
// which is the only one that queues successfully in this environment -
// /ai/summarize, /ai/query and /ai/draft-email all 500 synchronously here
// because GEMINI_API_KEY isn't configured, so their queued-response shape
// is inferred by symmetry with the description text rather than observed
// directly) returns this shape, not a 200 body.
export type AiJobQueued = { queued: true; id: string };

// Every AI "result" endpoint follows the same real, verified envelope:
// 200 = done (shape below, per endpoint), 404 = not ready yet (poll again),
// 422 = failed (standard Nest error body, e.g. verified real
// "AWS S3 not configured" for quotations) - there is no embedded
// PENDING/FAILED status field in a 200 body as TZ's generic description
// might suggest.
export type AiSummaryRecord = {
  id: string;
  communicationId: string;
  summary: string;
  createdAt: string;
};

export type AiQueryResult = { rows: unknown[]; answer: string };

export type AiDraftEmailResult = { subject: string; body: string };

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
  createdAt: string;
  updatedAt: string;
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

// ---- Analytics / Dashboard ----

export type DashboardOverview = {
  contactsCount: number;
  openTasksCount: number;
  dealsByStage: { stage: DealStage; count: number }[];
  todayTimeTrackedSec: number;
};

export type SalesAnalytics = {
  byStage: { stage: DealStage; count: number; totalValue: number }[];
  wonCount: number;
  wonValue: number;
  lostCount: number;
  winRate: number;
};

export type MonthlyValue = { month: string; value: number };

export type RevenueAnalytics = {
  totalWonValue: number;
  byMonth: MonthlyValue[];
};

export type TaskAnalytics = {
  byStatus: { status: TaskStatus; count: number }[];
  byPriority: { priority: TaskPriority; count: number }[];
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

export type UpcomingMeeting = Meeting & {
  contact?: Contact | null;
  deal?: Deal | null;
};
