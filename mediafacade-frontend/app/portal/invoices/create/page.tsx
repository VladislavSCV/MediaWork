"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import PageGuard from "@/components/RoleGuard";
import { useRouter } from "next/navigation";

type Invoice = {
  invoice_number: string;
  amount_total: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
};

export default function NewInvoicePage() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: "",
    amount_total: 0,
    currency: "RUB",
    status: "pending",
    period_start: "",
    period_end: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!invoice.invoice_number || invoice.amount_total <= 0) {
      setNotification("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Отправка данных на бэк
      const response = await apiFetch("/invoices", {
        method: "POST",
        body: JSON.stringify(invoice),
      });

      if (response.id) {
        setNotification("Invoice created successfully!");
        router.push(`/portal/invoices/${response.id}`);
      } else {
        setNotification("Failed to create invoice.");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setNotification("Error creating invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageGuard allow="manager">
      <div className="space-y-10 lg:space-y-12">
        {notification && (
          <div className="fixed top-6 right-6 z-50 rounded-xl bg-black/80 text-white px-4 py-2 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            {notification}
          </div>
        )}

        <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
              Create a new invoice
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Fill in the details to create a new invoice.
            </p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_32px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl p-8">
          <div className="space-y-8">
            {/* Form to create new invoice */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={invoice.invoice_number}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Invoice #"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Amount Total
                </label>
                <input
                  type="number"
                  name="amount_total"
                  value={invoice.amount_total}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Amount"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Period Start
                </label>
                <input
                  type="date"
                  name="period_start"
                  value={invoice.period_start}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Period End
                </label>
                <input
                  type="date"
                  name="period_end"
                  value={invoice.period_end}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Currency
                </label>
                <select
                  name="currency"
                  value={invoice.currency}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                >
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500">
                  Status
                </label>
                <select
                  name="status"
                  value={invoice.status}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-slate-900 px-6 py-2 text-white text-[14px] font-semibold hover:bg-slate-800"
              >
                {loading ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
