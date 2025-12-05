"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";

type Invoice = {
  id: number;
  invoice_number: string;
  amount_total: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
  period_start: string;
  period_end: string;
  company_id: number;
};

type InvoiceLine = {
  id: number;
  description: string;
  amount: number;
};

type InvoiceDetails = {
  invoice: Invoice;
  lines: InvoiceLine[];
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/invoices/${id}`)
      .then((res) => setData(res))
      .catch((err) => console.error("Failed to load invoice:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageGuard allow="viewer">
        <div className="p-10 text-center text-slate-500">Loading invoice...</div>
      </PageGuard>
    );
  }

  if (!data) {
    return (
      <PageGuard allow="viewer">
        <div className="p-10 text-center text-red-500">
          Invoice not found.
        </div>
      </PageGuard>
    );
  }

  const inv = (data as any).invoice ?? (data as any);

  return (
    <PageGuard allow="viewer">
      <div className="min-h-screen w-full bg-gradient-to-br from-white via-[#f5f7fa] to-[#e5edf5] p-8">

        {/* Back Button */}
        <Link
          href="/portal/invoices"
          className="inline-flex items-center rounded-xl bg-white/70 px-4 py-2 text-sm shadow hover:bg-white"
        >
          ← Back to invoices
        </Link>

        {/* Container */}
        <div className="mt-6 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">

          {/* Header */}
          <h1 className="text-[28px] font-semibold text-slate-900">
            Invoice #{inv.invoice_number}
          </h1>

          <div className="mt-1 text-sm text-slate-500">
            Issued at: {inv.issued_at.slice(0, 10)}
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Overview
              </h2>

              <div className="mt-3 space-y-3 text-[14px]">
                <Detail label="Invoice #" value={inv.invoice_number} />
                <Detail
                  label="Amount"
                  value={`₽ ${inv.amount_total.toLocaleString()}`}
                />
                <Detail
                  label="Period"
                  value={`${inv.period_start} — ${inv.period_end}`}
                />
                <Detail label="Status" value={inv.status.toUpperCase()} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Payment
              </h2>

              <div className="mt-3 space-y-3 text-[14px]">
                <Detail
                  label="Issued at"
                  value={inv.issued_at.slice(0, 10)}
                />
                <Detail
                  label="Paid at"
                  value={inv.paid_at ? inv.paid_at.slice(0, 10) : "—"}
                />
              </div>
            </div>
          </div>

          {/* Invoice lines */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white/90 p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Invoice lines
            </h2>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(data.lines ?? []).map((line) => (

                  <tr key={line.id} className="border-b last:border-none">
                    <td className="py-2">{line.description}</td>
                    <td className="py-2 text-right">
                      ₽ {line.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PDF Download */}
          <div className="mt-8 flex justify-end">
            <a
              href={`http://localhost:8080/api/invoices/${inv.id}/pdf`}
              target="_blank"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="text-[15px] font-medium text-slate-800">{value}</div>
    </div>
  );
}
