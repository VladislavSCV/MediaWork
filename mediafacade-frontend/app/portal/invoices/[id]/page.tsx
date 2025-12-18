"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";
import { jsPDF } from "jspdf";

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
  lines?: InvoiceLine[]; // Строки инвойса могут быть необязательными
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    console.log(`Fetching data for invoice ID: ${id}`);  // Дебаг
    apiFetch(`/invoices/${id}`)
      .then((res) => {
        console.log("Data loaded: ", res);  // Дебаг
        setData(res);
      })
      .catch((err) => {
        console.error("Failed to load invoice:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Если данные еще не загружены, показываем загрузку
  if (loading) {
    return (
      <PageGuard allow="viewer">
        <div className="p-10 text-center text-slate-500">Loading invoice...</div>
      </PageGuard>
    );
  }

  // Если данных нет (например, инвойс не найден), показываем ошибку
  if (!data) {
    return (
      <PageGuard allow="viewer">
        <div className="p-10 text-center text-red-500">
          Invoice not found. {id}
        </div>
      </PageGuard>
    );
  }

  const inv = data; // Теперь точно есть инвойс
  const lines = data.lines || []; // Линии инвойса (если они есть)

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
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-slate-500 py-3">
                      No invoice lines found
                    </td>
                  </tr>
                ) : (
                  lines.map((line) => (
                    <tr key={line.id} className="border-b last:border-none">
                      <td className="py-2">{line.description}</td>
                      <td className="py-2 text-right">
                        ₽ {line.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PDF Download */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => downloadPDF(inv, lines)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
            >
              Download PDF
            </button>
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

function downloadPDF(invoice: Invoice, lines: InvoiceLine[]) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`Invoice #${invoice.invoice_number}`, 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Issued at: ${invoice.issued_at.slice(0, 10)}`, 20, 30);
  doc.text(`Amount: ₽ ${invoice.amount_total.toLocaleString()}`, 20, 40);
  doc.text(`Period: ${invoice.period_start} — ${invoice.period_end}`, 20, 50);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 60);

  let yOffset = 70;
  doc.text("Description", 20, yOffset);
  doc.text("Amount", 140, yOffset);
  yOffset += 10;

  lines.forEach((line) => {
    doc.text(line.description, 20, yOffset);
    doc.text(`₽ ${line.amount.toLocaleString()}`, 140, yOffset);
    yOffset += 10;
  });

  doc.save(`invoice_${invoice.invoice_number}.pdf`);
}
