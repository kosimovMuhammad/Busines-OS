export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SALES"
  | "SUPPORT"
  | "EMPLOYEE"
  | "READ_ONLY";

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type DealStage =
  | "LEAD"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type CommChannel = "WHATSAPP" | "EMAIL" | "MANUAL_NOTE" | "PHONE_CALL";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";

export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type Plan = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
