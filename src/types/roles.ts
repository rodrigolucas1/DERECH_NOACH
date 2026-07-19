export const ROLES = {
  TENANT: {
    MEMBER: "MEMBER",
    LEADER: "LEADER",
    ADMIN: "ADMIN",
  } as const,
  COMMUNITY: {
    MEMBER: "MEMBER",
    LEADER: "LEADER",
    ADMIN: "ADMIN",
  } as const,
} as const;

export type TenantRole = (typeof ROLES.TENANT)[keyof typeof ROLES.TENANT];
export type CommunityRole =
  (typeof ROLES.COMMUNITY)[keyof typeof ROLES.COMMUNITY];
