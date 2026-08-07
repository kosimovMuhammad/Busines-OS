import { useAppSelector } from "@/store/hooks";

export function useInvoicePdfDownload() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  return async (invoiceId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/invoices/${invoiceId}/pdf`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
}
