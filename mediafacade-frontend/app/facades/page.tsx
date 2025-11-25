"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getFacades } from "@/lib/api";

type Facade = {
  id: number | string;
  name?: string;
  description?: string;
  layout?: { cols?: number; rows?: number };
  thumbnail?: string | null;
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/60 dark:bg-[#0c1017]/50 p-6 border border-white/40 dark:border-white/5 shadow-md backdrop-blur-sm animate-pulse">
      <div className="h-44 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#0f1722] dark:to-[#070c14]" />
      <div className="mt-5 h-5 w-2/3 rounded bg-gray-200 dark:bg-[#131b26]" />
      <div className="mt-3 h-4 w-1/3 rounded bg-gray-200 dark:bg-[#131b26]" />
      <div className="mt-4 h-3 w-full max-w-[70%] rounded bg-gray-100 dark:bg-[#0e141d]" />
    </div>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center text-xs font-medium bg-white/60 dark:bg-white/10 px-3 py-1 rounded-full border border-white/30 dark:border-white/10 backdrop-blur-sm">
    {children}
  </span>
);

export default function FacadesGallery() {
  const [facades, setFacades] = useState<Facade[] | null>(null);
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState<Facade[] | null>(null);

  useEffect(() => {
    let mounted = true;
    getFacades()
      .then((data) => {
        if (!mounted) return;
        setFacades(data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setFacades([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!facades) return;
    if (!q.trim()) {
      setFiltered(facades);
      return;
    }

    const qs = q.toLowerCase();
    setFiltered(
      facades.filter(
        (f) =>
          (f.name && f.name.toLowerCase().includes(qs)) ||
          (f.description && f.description.toLowerCase().includes(qs))
      )
    );
  }, [q, facades]);

  const items = filtered ?? facades;

  return (
    <main className="min-h-screen w-full bg-[#F7FAFC] dark:bg-[#060709] text-[#0E1116] dark:text-[#E6EEF8] px-6 md:px-16 lg:px-24 py-16 antialiased">
      <header className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-[#0b0f16] dark:text-[#EAF2FF]">
          Коллекция фасадов
        </h1>

        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#4e5865] dark:text-[#9db2d5]">
          Коллекция премиальных макетов с упором на эстетичную сетку,
          пропорции и чистоту визуального пространства.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <label className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию или описанию..."
              aria-label="Поиск"
              className="w-full rounded-2xl border border-[#E3E7EE] dark:border-[#101722] bg-white/80 dark:bg-[#0c1017]/70 backdrop-blur-sm py-3 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#bfd3ff]/50 placeholder:text-[#9ba3ae] dark:placeholder:text-[#6f7a88] transition"
            />
          </label>

          <Badge>Премиум</Badge>
        </div>
      </header>

      <section className="max-w-6xl mx-auto mt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {!items &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {items && items.length === 0 && (
            <div className="col-span-full rounded-2xl p-12 bg-white/70 dark:bg-[#0c1017] border border-[#E8EEF8]/40 dark:border-[#101722] backdrop-blur">
              <h3 className="text-lg font-medium">Ничего не найдено</h3>
              <p className="mt-3 text-sm text-[#68707c] dark:text-[#8FA0D6]">
                Попробуй изменить запрос или убрать фильтры.
              </p>
            </div>
          )}

          {items &&
            items.map((f) => (
              <article
                key={f.id}
                className="group rounded-2xl overflow-hidden bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur border border-white/40 dark:border-[#101722] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1"
              >
                <Link
                  href={`/facades/${f.id}`}
                  aria-label={`Открыть фасад ${f.name ?? f.id}`}
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#EEF2F6] to-white dark:from-[#0f1722] dark:to-[#080d14] flex items-center justify-center">
                    {f.thumbnail ? (
                      <img
                        src={f.thumbnail}
                        alt={f.name ?? `Фасад ${f.id}`}
                        className="object-cover w-full h-full transition-all duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-xs text-[#b7c4d6] dark:text-[#5b6a82]">
                        Нет изображения
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="text-lg font-medium text-[#111827] dark:text-[#EAF2FF] truncate tracking-tight">
                      {f.name ?? `Фасад #${f.id}`}
                    </h2>

                    <p className="mt-2 text-sm text-[#6b7280] dark:text-[#9EB2DD] line-clamp-2 leading-relaxed">
                      {f.description ?? "Описание отсутствует."}
                    </p>

                    <div className="mt-6 border-t border-[#EEF2F7] dark:border-[#1a2330] pt-4 flex justify-between">
                      <div className="text-xs text-[#6B7380] dark:text-[#7E95C3]">
                        Размер сетки
                      </div>
                      <div className="text-sm font-medium text-[#0A1220] dark:text-[#CFE0FF]">
                        {f.layout?.cols ?? 0} × {f.layout?.rows ?? 0}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
        </div>

        <div className="mt-16 flex justify-center">
          <p className="text-sm text-[#7B8794] dark:text-[#8FA9D8] opacity-70">
            Конец коллекции
          </p>
        </div>
      </section>
    </main>
  );
}
