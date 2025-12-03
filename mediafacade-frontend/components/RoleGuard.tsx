"use client";

import { useUser } from "@/hooks/useUser";
import { canAccess, Role } from "@/lib/roles";

export default function PageGuard({
  allow,
  children,
}: {
  allow: Role;
  children: React.ReactNode;
}) {
  const user = useUser();

  if (!user) {
    return (
      <div className="p-10 text-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (!canAccess(user.role, allow)) {
    return (
      <div className="p-10 text-center text-red-400">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
