export type TenantRole = "MEMBER" | "LEADER" | "ADMIN";

export type CommunityRole = "MEMBER" | "LEADER" | "ADMIN";

export type EventType = "IN_PERSON" | "ONLINE" | "HYBRID";

export type MaterialType = "DOCUMENT" | "VIDEO" | "AUDIO" | "LINK";

export type StreamPlatform = "YOUTUBE" | "VIMEO" | "OTHER";

export type StreamStatus = "SCHEDULED" | "LIVE" | "ENDED";

export type NotificationType = "GENERAL" | "EVENT" | "STUDY" | "COMMUNITY";

// ─── DTOs ─────────────────────────────────────────────────

export type TenantSummary = {
  id: string;
  name: string;
  slug: string;
  state: string;
  logoUrl: string | null;
  primaryColor: string;
};

export type TenantWithCounts = TenantSummary & {
  _count: {
    communities: number;
    members: number;
  };
};

export type CommunitySummary = {
  id: string;
  name: string;
  city: string;
  state: string;
  logoUrl: string | null;
};

export type EventSummary = {
  id: string;
  title: string;
  dateTime: Date;
  eventType: EventType;
  community: CommunitySummary | null;
};

export type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};
