"use client";
import { useEffect, useRef, useState } from "react";

type Props = { facadeId: number };

const ROWS = 20;
const COLS = 10;

export default function FacadeWall({ facadeId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeCells, setActiveCells] = useState<Set<number>>(new Set());
  const [pulseIntensity, setPulseIntensity] = useState<number>(0);

  // Плавный “пульс” синхронизации
  useEffect(() => {
    if (!isConnected) {
      setPulseIntensity(0);
      return;
    }
    const interval = setInterval(() => {
      setPulseIntensity((prev) => (prev === 0 ? 1 : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Легкая анимация случайных активных ячеек
  useEffect(() => {
    const interval = setInterval(() => {
      const randomCells = new Set<number>();
      const count = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < count; i++) {
        randomCells.add(Math.floor(Math.random() * ROWS * COLS));
      }
      setActiveCells(randomCells);
      const timeout = setTimeout(() => setActiveCells(new Set()), 260);
      return () => clearTimeout(timeout);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  // Подключение к WS
  useEffect(() => {
    if (!facadeId) return;

    const ws = new WebSocket(`ws://localhost:8080/ws/facade/${facadeId}`);

    ws.onopen = () => {
      console.log("✅ Connected to facade", facadeId);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "content_update" && msg.src) {
          const v = videoRef.current;
          setVideoSrc(msg.src);
          if (v) {
            v.src = msg.src;
            if (msg.startAt) {
              const diff = (Date.now() - msg.startAt) / 1000;
              v.currentTime = diff > 0 ? diff : 0;
            }
            v.play().catch(() => console.warn("Autoplay blocked"));
          }
        }
      } catch (e) {
        console.error("Bad WS message:", e);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WS closed");
      setIsConnected(false);
    };

    return () => ws.close();
  }, [facadeId]);

  const handleCellHover = (index: number) => {
    setActiveCells((prev) => new Set([...prev, index]));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Верхняя панель статуса — спокойный светлый стиль */}
      <div className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 px-6 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            {isConnected && (
              <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/40 animate-[ping_1.5s_ease-out_infinite]" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/50">
              Facade
            </span>
            <span className="font-mono text-sm text-black/80">
              {/* FACADE_{facadeId.toString().padStart(3, "0")} */}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-black/55">
          <span>
            {ROWS}×{COLS} cells
          </span>
          <span className="w-1 h-1 rounded-full bg-black/20" />
          <span>Realtime stream</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-28 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-black to-zinc-700 transition-all duration-500"
              style={{ width: `${pulseIntensity * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-black/60">SYNC</span>
        </div>
      </div>

      {/* Основная карточка медиафасада */}
      <div className="bg-white rounded-[32px] border border-black/5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] overflow-hidden">
        {/* Видеоповерхность + сетка */}
        <div className="relative px-5 pt-5 pb-6">
          <div className="relative w-full aspect-[16/9] rounded-[28px] bg-[#f3f3f6] overflow-hidden">
            {/* Видео */}
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover rounded-[28px] transition-transform duration-700 hover:scale-[1.03]"
            />

            {/* Мягкий верхний градиент, как у Superlist скринов */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/15" />

            {/* Светлая сетка “плиток” */}
            <div
              className="pointer-events-none absolute inset-4 rounded-[22px] border border-white/70 shadow-[0_0_0_1px_rgba(148,163,184,0.35)] overflow-hidden"
            >
              <div
                className="grid h-full w-full"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                }}
              >
                {Array.from({ length: ROWS * COLS }).map((_, i) => {
                  const active = activeCells.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => handleCellHover(i)}
                      className={`
                        relative border border-white/60
                        transition-colors duration-200
                        ${active ? "bg-cyan-50/80" : "hover:bg-cyan-50/60"}
                      `}
                    >
                      {active && (
                        <div className="pointer-events-none absolute inset-[20%] rounded-xl bg-cyan-400/50 blur-[6px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Тонкая “сканирующая” линия, но очень спокойная */}
            <div className="pointer-events-none absolute inset-x-10">
              <div className="facade-scan-bar h-px bg-gradient-to-r from-transparent via-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Нижняя панель с параметрами */}
        <div className="border-t border-black/5 px-6 py-4 md:px-8 md:py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoTile label="Resolution" value="1080 × 720" />
            <InfoTile label="Cells" value={(ROWS * COLS).toString()} />
            <InfoTile
              label="Status"
              value={isConnected ? "Online" : "Offline"}
              tone={isConnected ? "ok" : "warn"}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes facade-scan {
          0% {
            transform: translateY(-120%);
          }
          100% {
            transform: translateY(120%);
          }
        }
        .facade-scan-bar {
          animation: facade-scan 5s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Helper-компонент плитки информации ───────────────────────── */

type InfoTileProps = {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn";
};

function InfoTile({ label, value, tone = "default" }: InfoTileProps) {
  const toneClasses =
    tone === "ok"
      ? "text-emerald-600 bg-emerald-50"
      : tone === "warn"
      ? "text-rose-600 bg-rose-50"
      : "text-black/80 bg-black/5";

  return (
    <div className="rounded-2xl border border-black/5 bg-[#f9fafb] px-4 py-3 flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        {label}
      </span>
      <span
        className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold ${toneClasses}`}
      >
        {value}
      </span>
    </div>
  );
}
