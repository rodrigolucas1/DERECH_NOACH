export type TenantRole = "MEMBER" | "LEADER" | "ADMIN";
export type CommunityRole = "MEMBER" | "LEADER" | "ADMIN";

export const TENANT_ROLES: Record<TenantRole, string[]> = {
  MEMBER: ["event.view", "event.register", "study.view", "study.download"],
  LEADER: [
    "event.view",
    "event.register",
    "event.create",
    "event.edit",
    "study.view",
    "study.download",
    "study.create",
    "study.edit",
    "community.manage_members",
  ],
  ADMIN: [
    "event.view",
    "event.register",
    "event.create",
    "event.edit",
    "event.delete",
    "study.view",
    "study.download",
    "study.create",
    "study.edit",
    "study.delete",
    "community.view",
    "community.create",
    "community.edit",
    "community.delete",
    "community.manage_members",
    "user.view",
    "user.edit",
    "user.manage_roles",
    "tenant.settings",
  ],
};

export const COMMUNITY_ROLES: Record<CommunityRole, string[]> = {
  MEMBER: ["event.view", "event.register", "study.view", "study.download"],
  LEADER: [
    "event.view",
    "event.register",
    "event.create",
    "event.edit",
    "study.view",
    "study.download",
    "study.create",
    "study.edit",
    "community.manage_members",
  ],
  ADMIN: [
    "event.view",
    "event.register",
    "event.create",
    "event.edit",
    "event.delete",
    "study.view",
    "study.download",
    "study.create",
    "study.edit",
    "study.delete",
    "community.view",
    "community.edit",
    "community.manage_members",
  ],
};

export function hasPermission(
  role: TenantRole,
  permission: string
): boolean {
  return TENANT_ROLES[role]?.includes(permission) ?? false;
}

export function hasCommunityPermission(
  role: CommunityRole,
  permission: string
): boolean {
  return COMMUNITY_ROLES[role]?.includes(permission) ?? false;
}
