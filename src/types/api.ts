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

// ---- AI ----

export type AiQueryRequest = { question: string };
export type AiDraftEmailRequest = { contactId: string; context?: string };
export type QuotationItem = { description: string; quantity: number; unitPrice: number };
export type AiGenerateQuotationRequest = { dealId: string; items: QuotationItem[] };

export type AiJobPending = { status: "PENDING" };
export type AiJobFailed = { status: "FAILED"; error: string };

export type SummarizeRequest = { communicationId: string };
// The "COMPLETED" shape is inferred from TZ §8.4's generic async-job
// pattern, not verified against a real response - GEMINI_API_KEY isn't
// configured in this environment (POST /ai/summarize always 500s with
// "GEMINI_API_KEY not configured"), so summarization never reaches a
// completed state to observe. Revisit once the key is provisioned.
export type AiSummaryResult =
  | AiJobPending
  | AiJobFailed
  | { status: "COMPLETED"; summary: string };

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
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes: string | null;
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
