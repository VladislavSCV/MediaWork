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
    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
      setStatus("error");
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setStatus("closed");
    };

    ws.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);

        if (payload.type === "frame") {
          setLastFrame(payload.data);
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    return () => ws.close();
  }, [facadeId]);

  return (
    <PageGuard allow="viewer">
      <div className="p-6 space-y-6 select-none">
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
        <div className="relative rounded-3xl border bg-slate-100 shadow-lg p-4 flex items-center justify-center h-[500px]">
          {lastFrame ? (
            <img
              src={lastFrame}
              className="object-cover w-full h-full rounded-xl shadow-lg"
              alt="Live Facade"
            />
          ) : (
            <div className="text-[14px] text-slate-500">
              Waiting for live frames…
            </div>
          )}
        </div>
      </div>
    </PageGuard>
  );
}
