"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  ClipboardIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PageGuard from "@/components/RoleGuard";

/* ------------------ TYPES ------------------ */
type User = {
  id: number;
  email: string;
  full_name: string;
  name?: string;
  role: string;
};

/* -------------------------------------------------------------
   NOTIFICATION COMPONENT
------------------------------------------------------------- */
function Notification({ msg }: { msg: string }) {
  return (
    <div className="fixed top-6 right-6 z-50 rounded-xl bg-black/80 text-white px-4 py-2 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
      {msg}
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState<"personal" | "security" | "api" | "company">(
    "personal"
  );

  const tabs = [
    { id: "personal", label: "Personal Info", icon: UserCircleIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "api", label: "API Keys", icon: KeyIcon },
    { id: "company", label: "Company Access", icon: BuildingOffice2Icon },
  ];

  const [notification, setNotification] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  /* -------------------------------------------------------------
     LOAD USER FROM BACKEND /api/me
  ------------------------------------------------------------- */
  useEffect(() => {
    apiFetch<User>("/me")
      .then((u) => {
        setUser(u);
        localStorage.setItem("advertiser_role", u.role);
        localStorage.setItem("advertiser_name", u.full_name || u.name || "");
      })
      .catch((e) => console.error("Failed to load user:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-10 text-slate-600 text-lg">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="p-10 text-red-600 text-lg">
        Failed to load user profile
      </div>
    );

  return (
    <PageGuard allow="viewer">
      <div className="space-y-10 lg:space-y-12">
        {notification && <Notification msg={notification} />}

        {/* HEADER */}
        <section className="rounded-[32px] border border-white/60 bg-white/80 px-6 py-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Account
            </div>
            <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
              Profile Settings
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Manage your personal info, security, API keys and company roles.
            </p>

            <p className="mt-2 text-[14px] font-medium text-slate-900">
              {user.full_name || user.name}
            </p>
          </div>
        </section>

        {/* MAIN PANEL */}
        <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_32px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl p-0 overflow-hidden">
          <div className="grid lg:grid-cols-[240px_1fr]">
            {/* LEFT NAV */}
            <div className="border-r border-slate-200/60 bg-white/40 backdrop-blur-xl p-6 space-y-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition
                    text-left text-[14px]
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
              {tab === "personal" && <PersonalInfo user={user} notify={notify} />}
              {tab === "security" && <SecuritySettings notify={notify} />}
              {tab === "api" && <ApiKeys notify={notify} />}
              {tab === "company" && <CompanyAccess user={user} />}
            </div>
          </div>
        </section>
      </div>
    </PageGuard>
  );
}

/* -------------------------------------------------------------------
   PERSONAL INFO
------------------------------------------------------------------- */
function PersonalInfo({
  user,
  notify,
}: {
  user: User;
  notify: (msg: string) => void;
}) {
  const [name, setName] = useState(user.full_name || user.name || "");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    notify("Profile updated (not implemented yet)");
  };

  return (
    <div className="space-y-8">
      {/* Top card */}
      <div className="flex items-center gap-6 rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.15)]">
        <div className="h-20 w-20 rounded-full bg-slate-300 shadow-inner" />
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900">{name}</h2>
          <p className="text-[14px] text-slate-600">{email}</p>
          <p className="text-[12px] text-slate-400 mt-1">
            Role:{" "}
            <span className="font-semibold text-slate-600">
              {user.role}
            </span>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.12)] space-y-6">
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} />
        <Field label="Phone" value={phone} onChange={setPhone} />

        <button
          onClick={handleSave}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-[14px] font-semibold hover:bg-slate-800 transition"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   SECURITY SETTINGS
------------------------------------------------------------------- */
function SecuritySettings({ notify }: { notify: (msg: string) => void }) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handlePasswordChange = () => {
    if (newPwd !== confirmPwd) {
      notify("Passwords do not match");
      return;
    }
    notify("Password changed (stub)");
  };

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">Security</h2>

      <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.15)] space-y-6">
        <Field label="Old password" value={oldPwd} onChange={setOldPwd} password />
        <Field label="New password" value={newPwd} onChange={setNewPwd} password />
        <Field
          label="Confirm new password"
          value={confirmPwd}
          onChange={setConfirmPwd}
          password
        />

        <button
          onClick={handlePasswordChange}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-[14px] font-semibold hover:bg-slate-800 transition"
        >
          Change password
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   API KEYS  (local-only for now)
------------------------------------------------------------------- */
function ApiKeys({ notify }: { notify: (msg: string) => void }) {
  const [keys, setKeys] = useState([]);

  const generateKey = () => {
    const newKey = {
      id: crypto.randomUUID(),
      value: "sk_live_" + Math.random().toString(36).slice(2, 20),
      created: new Date().toISOString().split("T")[0],
    };

    setKeys((prev) => [...prev, newKey]);
    notify("New API key generated");
  };

  const copyKey = (value: string) => {
    navigator.clipboard.writeText(value);
    notify("Key copied");
  };

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    notify("Key deleted");
  };

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">API Keys</h2>

      <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 space-y-4 shadow-[0_18px_70px_rgba(15,23,42,0.15)]">
        {keys.map((k) => (
          <div
            key={k.id}
            className="rounded-xl border border-slate-300 bg-white/80 p-4 shadow-sm flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="font-mono text-[13px] text-slate-700">
                {k.value.replace(/(?<=.{10}).*/, "****************")}
              </span>
              <span className="text-[11px] text-slate-400">Created: {k.created}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => copyKey(k.value)}>
                <ClipboardIcon className="h-5 w-5 text-slate-600 hover:text-slate-900" />
              </button>

              <button onClick={() => deleteKey(k.id)}>
                <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={generateKey}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-[14px] font-semibold hover:bg-slate-800 transition"
        >
          Generate new key
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   COMPANY ACCESS  (will connect later)
------------------------------------------------------------------- */
function CompanyAccess({ user }: { user: User }) {
  // TODO: позже заменим на реальный запрос /companies/user
  const roles = [{ company: "Your Company", role: user.role }];

  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-semibold text-slate-900">Company Access</h2>

      <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.15)] space-y-4">
        {roles.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-300 bg-white/80 p-4 shadow-sm flex justify-between"
          >
            <span className="text-[14px] text-slate-700">{r.company}</span>
            <span className="text-[13px] font-medium text-slate-500">
              {r.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   FIELD COMPONENT
------------------------------------------------------------------- */
function Field({
  label,
  value,
  onChange,
  password,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  password?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
        {label}
      </div>

      <input
        type={password ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-2 text-[14px] shadow-sm focus:outline-none"
      />
    </div>
  );
}
