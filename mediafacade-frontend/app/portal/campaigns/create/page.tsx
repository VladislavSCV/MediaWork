"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";

export default function CampaignCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("23:00");

  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (d: string) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  // TODO: заменить на реальные данные
  const facades = [
    { id: 1, city: "Berlin", spot: "Alexanderplatz", status: "Online" },
    { id: 2, city: "Berlin", spot: "Friedrichstrasse", status: "Online" },
    { id: 3, city: "Moscow", spot: "Tverskaya", status: "Maintenance" },
    { id: 4, city: "London", spot: "Waterloo", status: "Online" },
  ];

  const [selected, setSelected] = useState<number[]>([]);
  const toggleFacade = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---------------------- SEND TO BACKEND ----------------------

  const handleSubmit = async () => {
    if (!title || !dateFrom || !dateTo || selected.length === 0) {
      alert("Заполни все поля и выбери хотя бы один фасад!");
      return;
    }

    const startISO = dateFrom + "T" + timeFrom + ":00Z";
    const endISO = dateTo + "T" + timeTo + ":00Z";

    // Основная кампания
    const campaign = {
      company_id: 1, // TODO вставить реальную текущую компанию
      name: title,
      description: "",
      start_time: startISO,
      end_time: endISO,
      status: "scheduled",
      priority: 0,
    };

    // Слоты (по одному на каждый выбранный фасад)
    const slots = selected.map((facadeId) => ({
      facade_id: facadeId,
      slot_duration: duration,
      days: days.join(","),
      start_time: timeFrom,
      end_time: timeTo,
    }));

    const payload = { campaign, slots };

    try {
      const res = await apiFetch("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.id) {
        router.push(`/portal/campaigns/${res.id}`);
      } else {
        alert("Ошибка: backend не вернул id");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при создании кампании");
    }
  };

  // ---------------------- UI ----------------------

  return (
    <PageGuard allow="manager">
      <div className="space-y-10 lg:space-y-12">

        {/* HEADER */}
        <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 relative">
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <button
                onClick={() => router.back()}
                className="text-[12px] text-slate-500 hover:text-slate-700 transition"
              >
                ← Back
              </button>

              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                New Campaign
              </div>

              <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                Create a campaign
              </h1>
              <p className="text-[13px] text-slate-500">
                Configure schedule, facades and budget.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-[12px] font-semibold text-white shadow-[0_12px_35px_rgba(15,23,42,0.6)] hover:bg-slate-800"
            >
              Create campaign
            </button>
          </div>
        </section>

        {/* MAIN SHEET */}
        <section className="rounded-[36px] border border-white/70 bg-white/85 px-6 py-7 shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl lg:px-8 pointer-events-auto">
          <div className="space-y-10">

            {/* OVERVIEW */}
            <div>
              <SectionHeader title="Overview" subtitle="Campaign basic info" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InputBlock
                  label="Campaign name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Evening brand loop"
                />

                <InputBlock
                  label="Creative duration (seconds)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            {/* SCHEDULE */}
            <div>
              <SectionHeader title="Schedule" subtitle="Dates and time range" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InputBlock
                  label="Start date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />

                <InputBlock
                  label="End date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Days of week
                  </label>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {allDays.map((d) => (
                      <button
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold shadow transition ${
                          days.includes(d)
                            ? "bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.6)]"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <InputBlock
                  label="Time from"
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                />

                <InputBlock
                  label="Time to"
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                />
              </div>
            </div>

            {/* FACADES */}
            <div>
              <SectionHeader title="Facades" subtitle="Select where campaign runs" />

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {facades.map((f) => {
                  const active = selected.includes(f.id);
                  const dot =
                    f.status === "Online" ? "bg-emerald-500" : "bg-amber-500";

                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFacade(f.id)}
                      className={`rounded-[24px] border px-4 py-4 text-left shadow-[0_18px_70px_rgba(15,23,42,0.18)] transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white/90"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[14px] font-semibold">
                            {f.city} · {f.spot}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            LED facade
                          </div>
                        </div>

                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      </div>
    </PageGuard>
  );
}

/* COMPONENTS */

function SectionHeader({ title, subtitle }: any) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="text-[13px] text-slate-500">{subtitle}</div>
    </div>
  );
}

function InputBlock({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="mt-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-[13px] shadow focus:border-slate-900 focus:outline-none"
      />
    </div>
  );
}
