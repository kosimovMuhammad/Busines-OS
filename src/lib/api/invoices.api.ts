import { baseApi } from "./baseApi";
import type {
  CreateInvoiceRequest,
  CreatePaymentRequest,
  Invoice,
  InvoiceDetail,
  Paginated,
  Payment,
  UpdateInvoiceRequest,
  UpdateInvoiceStatusRequest,
} from "@/types/api";
import type { InvoiceStatus } from "@/types/enums";

export type InvoicesQueryArgs = {
  status?: InvoiceStatus;
  contactId?: string;
  dealId?: string;
  page?: number;
  limit?: number;
};

// The API serializes decimal fields (amount) as strings; coerce to number
// here so every consumer works with real numbers (same pattern as deals).
function normalizeInvoice<T extends Invoice>(invoice: T): T {
  return { ...invoice, amount: Number(invoice.amount) };
}

function normalizePayment(payment: Payment): Payment {
  return { ...payment, amount: Number(payment.amount) };
}

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<Paginated<Invoice>, InvoicesQueryArgs | void>({
      query: (params) => ({ url: "/invoices", params: params ?? undefined }),
      transformResponse: (response: Paginated<Invoice>) => ({
        ...response,
        data: response.data.map(normalizeInvoice),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((inv) => ({ type: "Invoicing" as const, id: inv.id })),
              { type: "Invoicing" as const, id: "LIST" },
            ]
          : [{ type: "Invoicing" as const, id: "LIST" }],
    }),
    getInvoice: builder.query<InvoiceDetail, string>({
      query: (id) => `/invoices/${id}`,
      transformResponse: (response: InvoiceDetail) => ({
        ...normalizeInvoice(response),
        payments: response.payments.map(normalizePayment),
      }),
      providesTags: (_result, _error, id) => [{ type: "Invoicing", id }],
    }),
    createInvoice: builder.mutation<InvoiceDetail, CreateInvoiceRequest>({
      query: (body) => ({ url: "/invoices", method: "POST", body }),
      transformResponse: (response: InvoiceDetail) => normalizeInvoice(response),
      invalidatesTags: [{ type: "Invoicing", id: "LIST" }],
    }),
    updateInvoice: builder.mutation<InvoiceDetail, { id: string; body: UpdateInvoiceRequest }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}`, method: "PATCH", body }),
      transformResponse: (response: InvoiceDetail) => normalizeInvoice(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Invoicing", id },
        { type: "Invoicing", id: "LIST" },
      ],
    }),
    updateInvoiceStatus: builder.mutation<
      InvoiceDetail,
      { id: string; body: UpdateInvoiceStatusRequest }
    >({
      query: ({ id, body }) => ({ url: `/invoices/${id}/status`, method: "PATCH", body }),
      transformResponse: (response: InvoiceDetail) => normalizeInvoice(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Invoicing", id },
        { type: "Invoicing", id: "LIST" },
      ],
    }),
    removeInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Invoicing", id: "LIST" }],
    }),
    getPayments: builder.query<Payment[], string>({
      query: (invoiceId) => `/invoices/${invoiceId}/payments`,
      transformResponse: (response: Payment[]) => response.map(normalizePayment),
      providesTags: (_result, _error, invoiceId) => [{ type: "Invoicing", id: invoiceId }],
    }),
    addPayment: builder.mutation<Payment, { invoiceId: string; body: CreatePaymentRequest }>({
      query: ({ invoiceId, body }) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: "POST",
        body,
      }),
      transformResponse: normalizePayment,
      // The invoice auto-marks PAID server-side once fully paid - refetch
      // the invoice detail (which embeds payments) rather than patching
      // the cache locally.
      invalidatesTags: (_result, _error, { invoiceId }) => [
        { type: "Invoicing", id: invoiceId },
        { type: "Invoicing", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useRemoveInvoiceMutation,
  useGetPaymentsQuery,
  useAddPaymentMutation,
} = invoicesApi;
