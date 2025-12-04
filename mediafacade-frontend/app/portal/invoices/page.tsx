"use client";

import PageGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type Invoice = {
  id: number;
  invoice_number: string;
  issued_at: string;
  amount_total: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  company_id: number;
};

type InvoiceDetailsResponse = {
  invoice: Invoice;
  lines: {
    id: number;
    description: string;
    amount: number;
  }[];
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [details, setDetails] = useState<InvoiceDetailsResponse | null>(null);

  /* ---------------- LOAD LIST FROM BACKEND ---------------- */
  useEffect(() => {
    apiFetch("/invoices")
      .then((data) => setInvoices(data || []))
      .catch((err) => console.error("Failed to load invoices:", err));
  }, []);

  /* ---------------- LOAD DETAILS (RIGHT PANEL) ---------------- */
  const loadDetails = async (inv: Invoice) => {
    setSelected(inv);
    setDetails(null);

    try {
      const data = await apiFetch(`/invoices/${inv.id}`);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load invoice details:", err);
    }
  };

  /* ---------------- FILTERING LOGIC ---------------- */
  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;

    if (periodFilter !== "all") {
      const now = new Date();
      const d = new Date(inv.issued_at);

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
        
        {/* HEADER */}
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

        {/* MAIN SHEET */}
        <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_32px_110px_rgба(15,23,42,0.22)] backdrop-blur-xl p-0 overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_360px]">

            {/* LEFT: TABLE */}
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

              {/* TABLE */}
              <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-[0_22px_80px_rgба(15,23,42,0.15)]">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white/50 text-[12px] uppercase tracking-[0.16em] text-slate-500">
                      <th className="px-6 py-4">Invoice</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => loadDetails(inv)}
                        className={`cursor-pointer transition hover:bg-slate-100/60 ${
                          selected?.id === inv.id ? "bg-slate-100/80" : ""
                        }`}
                      >
                        <td className="px-6 py-5 font-medium">{inv.invoice_number}</td>
                        <td className="px-6 py-5">{inv.issued_at?.slice(0, 10)}</td>
                        <td className="px-6 py-5 font-semibold">
                          {Number(inv.amount_total ?? 0).toLocaleString()} {inv.currency || "₽"}
                        </td>

                        <td className="px-6 py-5">{InvoiceStatus(inv.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="hidden lg:block border-l border-slate-200 bg-white/40 backdrop-blur-xl p-8">
              {!selected ? (
                <div className="text-slate-400 text-[14px]">
                  Select an invoice to view details.
                </div>
              ) : (
                <InvoiceDetailsPanel data={details} />
              )}
            </div>

          </div>
        </section>
      </div>
    </PageGuard>
  );
}

/* ---------------- COMPONENTS ---------------- */

function InvoiceStatus(status: Invoice["status"]) {
  const classMap = {
    paid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-lg px-3 py-1 text-[12px] font-semibold ${classMap[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function InvoiceDetailsPanel({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="text-slate-400 text-[14px]">
        Select an invoice to view details.
      </div>
    );
  }

  // Берём либо data.invoice (если есть), либо просто data
  const invoice = data.invoice ?? data;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Invoice
        </div>

        <h2 className="text-[20px] font-semibold text-slate-900">
          Invoice #{invoice.invoice_number || invoice.id}
        </h2>
      </div>

      <Detail label="Status" value={invoice.status?.toUpperCase() ?? "—"} />

      <Detail
        label="Issued"
        value={invoice.issued_at?.slice(0, 10) ?? "—"}
      />

      <Detail
        label="Period"
        value={
          invoice.period_start && invoice.period_end
            ? `${invoice.period_start.slice(0, 10)} → ${invoice.period_end.slice(0, 10)}`
            : "—"
        }
      />

      <Detail
        label="Amount"
        value={`${invoice.amount_total?.toLocaleString() ?? 0} ₽`}
      />

      <Detail
        label="Paid At"
        value={invoice.paid_at?.slice(0, 10) ?? "—"}
      />

      <Detail
        label="Created"
        value={invoice.created_at?.slice(0, 10) ?? "—"}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-[15px] font-medium text-slate-700">{value}</div>
    </div>
  );
}
