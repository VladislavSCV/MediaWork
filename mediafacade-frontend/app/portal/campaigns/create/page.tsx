"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageGuard from "@/components/RoleGuard";
import { apiFetch } from "@/lib/apiClient";

/* -------------------- TYPES -------------------- */

type Facade = {
  id: number;
  city: string;
  address: string;
  status: string;
};

type MeResponse = {
  id: number;
  company_id: number;
};

/* -------------------- PAGE -------------------- */

export default function CampaignCreatePage() {
  const router = useRouter();

  /* form state */
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("23:00");

  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  /* data from backend */
  const [facades, setFacades] = useState<Facade[]>([]);
  const [selectedFacades, setSelectedFacades] = useState<number[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  /* -------------------- LOAD DATA -------------------- */

  useEffect(() => {
    async function load() {
      try {
        const [me, facades] = await Promise.all([
          apiFetch<MeResponse>("/me"),
          apiFetch<Facade[]>("/facades"),
        ]);

        setCompanyId(me.company_id);
        setFacades(facades);
      } catch (e) {
        console.error("Failed to load create-campaign data", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* -------------------- HELPERS -------------------- */

  const toggleDay = (d: string) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const toggleFacade = (id: number) => {
    setSelectedFacades((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    // if (!companyId) {
    //   alert("Company not resolved");
    //   return;
    // }

    // if (!title || !dateFrom || !dateTo || selectedFacades.length === 0) {
    //   alert("Заполни все поля и выбери хотя бы один фасад");
    //   return;
    // }

    const startISO = new Date(`${dateFrom}T${timeFrom}:00`).toISOString();
    const endISO = new Date(`${dateTo}T${timeTo}:00`).toISOString();

    const payload = {
      campaign: {
        company_id: companyId,
        name: title,
        description: "",
        start_time: startISO,
        end_time: endISO,
        status: "scheduled",
        priority: 0,
      },
      slots: selectedFacades.map((facadeId) => ({
        facade_id: facadeId,
        slot_duration: duration,
        days: days.join(","),
        start_time: timeFrom,
        end_time: timeTo,
      })),
    };

    try {
      const res = await apiFetch<{ id: number }>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push(`/portal/campaigns/${res.id}`);
    } catch (e) {
      console.error("Failed to create campaign", e);
      alert("Ошибка при создании кампании");
    }
  };

  /* -------------------- RENDER -------------------- */

  if (loading) {
    return (
      <PageGuard allow="manager">
        <div className="p-10 text-slate-500">Loading…</div>
      </PageGuard>
    );
  }

  return (
    <PageGuard allow="manager">
      <div className="space-y-10">

        {/* HEADER */}
        <section className="rounded-[32px] bg-white/80 p-6 shadow">
          <button
            onClick={() => router.back()}
            className="text-xs text-slate-500"
          >
            ← Back
          </button>

          <h1 className="mt-2 text-2xl font-semibold">Create campaign</h1>
          <p className="text-sm text-slate-500">
            Configure schedule and select facades
          </p>

          <button
            onClick={handleSubmit}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-2 text-white text-sm"
          >
            Create campaign
          </button>
        </section>

        {/* FORM */}
        <section className="rounded-[36px] bg-white/90 p-6 shadow space-y-10">

          {/* OVERVIEW */}
          <Block title="Overview">
            <Input
              label="Campaign name"
              value={title}
              onChange={setTitle}
              placeholder="Evening brand loop"
            />

            <Input
              label="Creative duration (sec)"
              type="number"
              value={duration}
              onChange={(v) => setDuration(Number(v))}
            />
          </Block>

          {/* SCHEDULE */}
          <Block title="Schedule">
            <Input label="Start date" type="date" value={dateFrom} onChange={setDateFrom} />
            <Input label="End date" type="date" value={dateTo} onChange={setDateTo} />
            <Input label="Time from" type="time" value={timeFrom} onChange={setTimeFrom} />
            <Input label="Time to" type="time" value={timeTo} onChange={setTimeTo} />

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">
                Days of week
              </div>
              <div className="flex flex-wrap gap-2">
                {allDays.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`rounded-xl px-3 py-1 text-xs ${
                      days.includes(d)
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </Block>

          {/* FACADES */}
          <Block title="Facades">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facades.map((f) => {
                const active = selectedFacades.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFacade(f.id)}
                    className={`rounded-2xl border p-4 text-left ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900"
                    }`}
                  >
                    <div className="font-semibold">
                      {f.city} · {f.address}
                    </div>
                    <div className="text-xs opacity-70">{f.status}</div>
                  </button>
                );
              })}
            </div>
          </Block>

        </section>
      </div>
    </PageGuard>
  );
}

/* -------------------- UI HELPERS -------------------- */

function Block({ title, children }: any) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase text-slate-500">
        {title}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 rounded-xl border px-3 py-2 text-sm"
      />
    </div>
  );
}
