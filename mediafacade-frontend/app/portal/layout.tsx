"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("advertiser_token");
    if (!token) {
      setAuth(false);
      router.push("/portal/login");
      return;
    }
    setAuth(true);
  }, [router]);

  if (auth === null) return null;

  if (!auth) return null;

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#11161d] border-r border-white/10 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Portal</h2>

        <nav className="flex flex-col gap-4 text-sm">
          <Link href="/portal/dashboard" className="hover:text-cyan-400">
            📊 Dashboard
          </Link>

          <Link href="/portal/campaigns" className="hover:text-cyan-400">
            🎥 Campaigns
          </Link>

          <Link href="/portal/invoices" className="hover:text-cyan-400">
            💸 Invoices
          </Link>

          <Link href="/portal/profile" className="hover:text-cyan-400">
            ⚙️ Profile
          </Link>

          <button
            className="mt-6 bg-red-500/20 text-red-400 px-3 py-2 rounded-md hover:bg-red-500/30 text-left"
            onClick={() => {
              localStorage.removeItem("advertiser_token");
              router.push("/portal/login");
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
