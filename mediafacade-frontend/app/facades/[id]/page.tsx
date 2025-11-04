"use client";
import { useParams } from "next/navigation";
import FacadeWall from "@/components/FacadeWall";

export default function FacadePage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#050814] text-gray-100">
      <h1 className="text-cyan-400 text-2xl mb-6 font-semibold">
        Фасад #{id}
      </h1>
      <FacadeWall facadeId={id} />
    </main>
  );
}
