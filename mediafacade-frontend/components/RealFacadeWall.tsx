"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;      // видео/фото
  rows?: number;    // панели по вертикали
  cols?: number;    // панели по горизонтали
};

export default function RealFacadeWall({
  src,
  rows = 6,
  cols = 12,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[28px] bg-black">
      {/* Hidden video source */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        loop
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
      />

      {/* LED Panels */}
      <PanelGrid rows={rows} cols={cols} videoRef={videoRef} />

      {/* LED pixel grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Glass highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(0,0,0,0)_60%)]" />
    </div>
  );
}

function PanelGrid({
  rows,
  cols,
  videoRef,
}: {
  rows: number;
  cols: number;
  videoRef: any;
}) {
  const tiles = rows * cols;

  return (
    <div
      className="absolute inset-0 grid"
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {Array.from({ length: tiles }).map((_, i) => (
        <PanelTile key={i} videoRef={videoRef} />
      ))}
    </div>
  );
}

function PanelTile({ videoRef }: { videoRef: any }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const render = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [videoRef]);

  return (
    <div className="relative border border-black/30 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
