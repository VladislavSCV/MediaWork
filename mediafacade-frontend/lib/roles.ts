export type Role = "admin" | "manager" | "viewer";

export const RoleHierarchy: Record<Role, number> = {
  admin: 3,
  manager: 2,
  viewer: 1,
};

export function canAccess(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
