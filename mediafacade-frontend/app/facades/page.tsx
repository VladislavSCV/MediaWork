"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getFacades } from "@/lib/api";

export default function FacadesList() {
  const [facades, setFacades] = useState<any[]>([]);

  useEffect(() => {
    getFacades().then(setFacades);
  }, []);

  return (
    <main className="min-h-screen bg-[#030611] text-gray-200 p-10">
      <h1 className="text-3xl mb-8 text-cyan-400 font-semibold">
        🏙️ Выбери фасад
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {facades.map((f) => (
          <Link
            key={f.id}
            href={`/facades/${f.id}`}
            className="group bg-[#0e172a] border border-cyan-800/40 hover:border-cyan-400/60 transition-all p-5 rounded-xl shadow-lg hover:shadow-cyan-400/20"
          >
            <div className="text-xl text-cyan-300 mb-2">
              {f.name || `Фасад #${f.id}`}
            </div>
            <div className="text-sm text-gray-400">
              Layout: {f.layout?.cols || 0}×{f.layout?.rows || 0}
            </div>
            <div className="text-xs mt-2 text-gray-500">
              {f.description || "Без описания"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
