"use client";

import PageGuard from "@/components/RoleGuard";
import { useState } from "react";

/* -------------------------------------------------------------
   MOCK DATA — позже заменишь на реальный backend из Go
------------------------------------------------------------- */

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  campaign: string;
};

const invoices: Invoice[] = [
  {
    id: "INV-2025-001",
    date: "2025-01-12",
    amount: "24 900 ₽",
    status: "paid",
    campaign: "Winter Sale · Adidas",
  },
  {
    id: "INV-2025-002",
    date: "2025-01-15",
    amount: "14 500 ₽",
    status: "pending",
    campaign: "VK Fest Promo",
  },
  {
    id: "INV-2025-003",
    date: "2025-01-18",
    amount: "32 000 ₽",
    status: "failed",
    campaign: "MTS Cashback",
  },
];

/* -------------------------------------------------------------
   PAGE COMPONENT
------------------------------------------------------------- */

export default function InvoicesPage() {
  const [selected, setSelected] = useState<Invoice | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  /* --- FILTERING LOGIC --- */
  const filtered = invoices.filter((inv) => {
    // Status filter
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;

    // Period filter
    if (periodFilter !== "all") {
      const now = new Date();
      const d = new Date(inv.date);

      if (periodFilter === "30d") {
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 30) return false;
      }

      if (periodFilter === "year") {
        if (d.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  return (
    <PageGuard allow="admin">
    <div className="select-none space-y-10 lg:space-y-12">

      {/* -------------------------------------------------------------
         HEADER
      ------------------------------------------------------------- */}
      <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Billing & Payments
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
            Invoices
          </h1>

          <p className="mt-1 text-[13px] text-slate-500">
            View, download and manage your billing history.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------
         MAIN SHEET
      ------------------------------------------------------------- */}
      <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_32px_110px_rgba(15,23,42,0.22)] backdrop-blur-xl p-0 overflow-hidden">

        <div className="grid lg:grid-cols-[1fr_360px]">

          {/* -------------------------------------------------------------
             TABLE (LEFT SIDE)
          ------------------------------------------------------------- */}
          <div className="p-6 lg:p-8">

            {/* Filters */}
            <div className="mb-6 flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white/70 px-4 py-2 text-[13px]"
              >
                <option value="all">Status: All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white/70 px-4 py-2 text-[13px]"
              >
                <option value="all">Period: All time</option>
                <option value="30d">Last 30 days</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_22px_80px_rgba(15,23,42,0.15)]">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-white/50 text-[12px] uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(inv)}
                      className={`
                        cursor-pointer transition
                        hover:bg-slate-100/60
                        ${selected?.id === inv.id ? "bg-slate-100/80" : ""}
                      `}
                    >
                      <td className="px-6 py-5 font-medium">{inv.id}</td>
                      <td className="px-6 py-5">{inv.campaign}</td>
                      <td className="px-6 py-5">{inv.date}</td>
                      <td className="px-6 py-5 font-semibold">{inv.amount}</td>
                      <td className="px-6 py-5">{InvoiceStatus(inv.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* -------------------------------------------------------------
             DETAILS (RIGHT SIDE)
          ------------------------------------------------------------- */}
          <div className="hidden lg:block border-l border-slate-200 bg-white/40 backdrop-blur-xl p-8">
            {!selected ? (
              <div className="text-slate-400 text-[14px]">
                Select an invoice to view details.
              </div>
            ) : (
              <InvoiceDetails invoice={selected} />
            )}
          </div>

        </div>
      </section>
    </div>
    </PageGuard>
  );
}

/* -------------------------------------------------------------
   SMALL COMPONENTS
------------------------------------------------------------- */

function InvoiceStatus(status: Invoice["status"]) {
  const classMap = {
    paid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-lg px-3 py-1 text-[12px] font-semibold ${classMap[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = "/invoices/sample.pdf"; // Файл положи в public/invoices/sample.pdf
    a.download = `${invoice.id}.pdf`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Invoice
        </div>
        <h2 className="text-[20px] font-semibold text-slate-900">{invoice.id}</h2>
      </div>

      <DetailBlock label="Status" value={invoice.status.toUpperCase()} />
      <DetailBlock label="Date" value={invoice.date} />
      <DetailBlock label="Campaign" value={invoice.campaign} />
      <DetailBlock label="Total" value={invoice.amount} />

      <button
        onClick={downloadPdf}
        className="mt-4 rounded-xl bg-slate-900 text-white px-4 py-2 w-full text-[14px] font-semibold hover:bg-slate-800 transition"
      >
        Download PDF
      </button>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-[15px] font-medium text-slate-700">{value}</div>
    </div>
  );
}
