"use client";
import { useEffect, useRef, useState } from "react";

type Props = { facadeId: number };

const ROWS = 20;
const COLS = 10;

export default function FacadeWall({ facadeId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    if (!facadeId) return;
    const ws = new WebSocket(`ws://localhost:8080/ws/facade/${facadeId}`);

    ws.onopen = () => console.log("✅ Connected to facade", facadeId);
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
    ws.onclose = () => console.log("🔌 WS closed");

    return () => ws.close();
  }, [facadeId]);

  return (
    <div className="relative w-[1080px] h-[720px] bg-black shadow-[0_0_60px_rgba(0,255,255,0.3)] overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => (
          <div
            key={i}
            className="border border-[rgba(0,255,255,0.15)] hover:border-cyan-400/60 transition-all duration-75"
          />
        ))}
      </div>
    </div>
  );
}
