"use client";

import { useState } from "react";
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import RoleGuard from "@/components/RoleGuard";
import ForbiddenPage from "@/components/Forbidden";
import PageGuard from "@/components/RoleGuard";

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "companies" | "roles" | "logs">(
    "users"
  );

  const tabs = [
    { id: "users", label: "Users", icon: UserGroupIcon },
    { id: "companies", label: "Companies", icon: BuildingOffice2Icon },
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheckIcon },
    { id: "logs", label: "Activity Logs", icon: ClipboardDocumentListIcon },
  ];

  return (
    <PageGuard allow="admin">
    <div className="select-none space-y-10 lg:space-y-12">

      {/* HEADER */}
      <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Administration
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
            Admin Console
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage users, roles, companies and system logs.
          </p>
        </div>
      </section>

      {/* MAIN PANEL */}
      <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_32px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl p-0 overflow-hidden">

        <div className="grid lg:grid-cols-[240px_1fr]">

          {/* LEFT NAVIGATION */}
          <div className="border-r border-slate-200/60 bg-white/40 backdrop-blur-xl p-6 space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition text-left text-[14px]
                  ${
                    tab === t.id
                      ? "bg-slate-900 text-white shadow-[0_6px_40px_rgba(15,23,42,0.25)]"
                      : "text-slate-700 hover:bg-slate-100/70"
                  }
                `}
              >
                <t.icon className="h-5 w-5 opacity-80" />
                {t.label}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="p-8">
            {tab === "users" && <UsersSection />}
            {tab === "companies" && <CompaniesSection />}
            {tab === "roles" && <RolesSection />}
            {tab === "logs" && <LogsSection />}
          </div>
        </div>
      </section>
    </div>
    </PageGuard>
  );
}

/* ─────────────────────────────────────────────────────────────
   USERS SECTION
────────────────────────────────────────────────────────────── */

function UsersSection() {
  const [users, setUsers] = useState([
    { id: 1, name: "Vladislav Scvorcov", email: "vs@shiftam.com", role: "Admin" },
    { id: 2, name: "Manager Level Guy", email: "manager@company.com", role: "Manager" },
    { id: 3, name: "Viewer Person", email: "viewer@company.com", role: "Viewer" },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");

  const invite = () => {
    if (!inviteEmail) return;
    setUsers((prev) => [
      ...prev,
      { id: Date.now(), name: inviteEmail.split("@")[0], email: inviteEmail, role: "Viewer" },
    ]);
    setInviteEmail("");
  };

  const removeUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-8">

      <h2 className="text-[20px] font-semibold text-slate-900 flex items-center gap-2">
        Users
      </h2>

      {/* Invite user */}
      <div className="rounded-[24px] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.12)] flex gap-3">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter email to invite"
          className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-2 text-[14px]"
        />
        <button
          onClick={invite}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Invite
        </button>
      </div>

      {/* Users list */}
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-[22px] border border-slate-200 bg-white/90 p-4 flex justify-between items-center shadow-sm"
          >
            <div>
              <div className="font-semibold text-slate-800">{u.name}</div>
              <div className="text-[13px] text-slate-500">{u.email}</div>
              <div className="text-[12px] text-slate-400">Role: {u.role}</div>
            </div>

            <button
              onClick={() => removeUser(u.id)}
              className="p-2 hover:bg-red-100 rounded-xl transition"
            >
              <TrashIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPANIES SECTION
────────────────────────────────────────────────────────────── */

function CompaniesSection() {
  const companies = [
    { id: 1, name: "MediaWork", users: 12, facades: 6 },
    { id: 2, name: "Shiftam", users: 24, facades: 12 },
    { id: 3, name: "AdSpace LTD", users: 5, facades: 2 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">Companies</h2>

      <div className="grid gap-4">
        {companies.map((c) => (
          <a
            key={c.id}
            href={`/portal/admin/companies/${c.id}`}
            className="
              rounded-[22px] border border-slate-200 bg-white/90 p-6 shadow-sm 
              flex justify-between items-center 
              hover:bg-slate-100/70 transition
            "
          >
            <div>
              <div className="font-semibold text-slate-800">{c.name}</div>
              <div className="text-[13px] text-slate-500">
                {c.users} users · {c.facades} facades
              </div>
            </div>

            <ArrowRightIcon className="h-5 w-5 text-slate-500" />
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROLES SECTION
────────────────────────────────────────────────────────────── */

function RolesSection() {
  const roles = [
    { role: "Admin", can: ["Full access", "Manage users", "Manage billing"] },
    { role: "Manager", can: ["Create campaigns", "View facades"] },
    { role: "Viewer", can: ["Read-only access"] },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">Roles & Permissions</h2>

      <div className="space-y-4">
        {roles.map((r, i) => (
          <div
            key={i}
            className="rounded-[22px] border border-slate-200 bg-white/90 p-6 shadow-sm"
          >
            <div className="font-semibold text-slate-800">{r.role}</div>

            <ul className="mt-2 text-[13px] text-slate-600 space-y-1">
              {r.can.map((c, k) => (
                <li key={k}>• {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGS SECTION
────────────────────────────────────────────────────────────── */

function LogsSection() {
  const logs = [
    { time: "12:01", text: "User invited: anna@company.com" },
    { time: "11:44", text: "Campaign updated: Adidas Winter" },
    { time: "10:12", text: "API Key generated" },
    { time: "09:55", text: "User role changed: Manager → Admin" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">Activity Logs</h2>

      <div className="rounded-[26px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.15)] h-80 overflow-y-auto text-[13px] text-slate-700 space-y-2">
        {logs.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-400">{l.time}</span>
            <span>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
