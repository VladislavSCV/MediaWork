"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageGuard from "@/components/RoleGuard";

export default function FacadeLivePage() {
  const router = useRouter();
  const { id } = useParams();
  const facadeId = Number(id);

  const [status, setStatus] = useState("connecting");
  const [lastFrame, setLastFrame] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!facadeId) return;

    const ws = new WebSocket(`ws://localhost:8080/ws/facade/${facadeId}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");

    ws.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);

        // Сервер должен присылать base64 кадры или json-метрики
        if (payload.type === "frame") {
          setLastFrame(payload.data); // base64 PNG/JPEG
        }
      } catch {}
    };

    return () => ws.close();
  }, [facadeId]);

  return (
    <PageGuard allow="viewer">
      <div className="p-6 space-y-6 select-none">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-[12px] text-slate-500 hover:text-slate-700"
          >
            ← Back
          </button>

          <div className="text-[20px] font-semibold text-slate-900">
            Live view — Facade #{facadeId}
          </div>

          <div />
        </div>

        {/* STATUS BAR */}
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow">
          <span
            className={`h-3 w-3 rounded-full ${
              status === "connected"
                ? "bg-emerald-500"
                : status === "connecting"
                ? "bg-amber-400"
                : "bg-red-500"
            }`}
          />
          <span className="text-[12px] text-slate-600">{status}</span>
        </div>

        {/* LIVE PREVIEW */}
        <div className="rounded-3xl border bg-slate-100 shadow p-4 flex items-center justify-center h-[500px]">
          {lastFrame ? (
            <img
              src={`${lastFrame}`}
              className="max-h-full max-w-full rounded-xl shadow"
            />
          ) : (
            <div className="text-[14px] text-slate-500">
              Waiting for live frames…
            </div>
          )}
        </div>

        {/* FUTURE — DEBUG AREA */}
        <div className="text-[12px] text-slate-400">
          WebSocket: {status}. Frame updates appear live as server sends them.
        </div>

      </div>
    </PageGuard>
  );
}
