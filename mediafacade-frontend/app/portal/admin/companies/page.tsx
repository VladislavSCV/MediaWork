"use client";

import PageGuard from "@/components/PageGuard";

export default function AdminCompaniesPage() {
  return (
    <PageGuard allow="admin">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">All companies</h1>
      </div>
    </PageGuard>
  );
}
