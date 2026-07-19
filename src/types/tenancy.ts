export type TenantRole = "MEMBER" | "LEADER" | "ADMIN";
export type CommunityRole = "MEMBER" | "LEADER" | "ADMIN";

export const TENANT_ROLE_HIERARCHY: Record<TenantRole, number> = {
  MEMBER: 0,
  LEADER: 1,
  ADMIN: 2,
};

export const COMMUNITY_ROLE_HIERARCHY: Record<CommunityRole, number> = {
  MEMBER: 0,
  LEADER: 1,
  ADMIN: 2,
};

export function hasMinimumTenantRole(
  userRole: TenantRole,
  requiredRole: TenantRole
): boolean {
  return TENANT_ROLE_HIERARCHY[userRole] >= TENANT_ROLE_HIERARCHY[requiredRole];
}

export function hasMinimumCommunityRole(
  userRole: CommunityRole,
  requiredRole: CommunityRole
): boolean {
  return (
    COMMUNITY_ROLE_HIERARCHY[userRole] >= COMMUNITY_ROLE_HIERARCHY[requiredRole]
  );
}
