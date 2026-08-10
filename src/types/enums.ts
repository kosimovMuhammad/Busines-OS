export type UserRole =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Sales"
  | "Support"
  | "Employee"
  | "ReadOnly";

export type UserStatus = "Active" | "Invited" | "Suspended" | "PendingVerification";

export type OnboardingRole =
  | "Founder"
  | "Sales"
  | "Marketing"
  | "Operations"
  | "Support"
  | "Other";

export type DealStage =
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export type TaskStatus = "Todo" | "InProgress" | "Completed" | "Archived";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type CommChannel = "Whatsapp" | "Email" | "ManualNote" | "PhoneCall";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export type PaymentMethod = "Cash" | "BankTransfer" | "Card" | "Other";

export type MeetingStatus = "Scheduled" | "Completed" | "Cancelled";

export type Plan = "Starter" | "Professional" | "Enterprise";

export type NotificationType =
  | "DealAssigned"
  | "TaskAssigned"
  | "TaskDue"
  | "TaskOverdue"
  | "MentionInComment"
  | "LeadAssigned"
  | "PaymentReceived"
  | "InviteAccepted"
  | "RoleChanged"
  | "DealStageChanged";

export type NotificationChannel = "InApp" | "Email" | "WhatsApp";

export type ContractStatus = "Draft" | "Sent" | "Signed" | "Expired" | "Cancelled";

export type TemplateType = "Contract" | "Email" | "Other";

export type WorkflowTriggerType =
  | "RecordCreated"
  | "RecordUpdated"
  | "RecordStatusChanged"
  | "TimeBased"
  | "FieldValueMatches";

export type WorkflowActionType =
  | "SendNotification"
  | "SendEmail"
  | "SendWhatsAppMessage"
  | "CreateTask"
  | "UpdateField"
  | "AssignOwner";

export type ConditionOperator =
  | "Equals"
  | "NotEquals"
  | "GreaterThan"
  | "LessThan"
  | "Contains"
  | "IsEmpty"
  | "IsNotEmpty";

export type ConditionLogicOperator = "And" | "Or";

export type BillingCycle = "Monthly" | "Yearly";

// Only "Trialing" observed live; other values are the obvious counterparts
// and not yet confirmed against a real response.
export type SubscriptionStatus = "Trialing" | "Active" | "PastDue" | "Canceled";

export type ProductUnit =
  | "Piece"
  | "Kg"
  | "Gram"
  | "Liter"
  | "Milliliter"
  | "Meter"
  | "Box"
  | "Pack";

export type PurchaseOrderStatus = "Draft" | "Ordered" | "Received" | "Cancelled";
