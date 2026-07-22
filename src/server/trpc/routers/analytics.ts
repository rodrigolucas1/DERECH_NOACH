import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatMonth(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]}/${date.getFullYear()}`;
}

export const analyticsRouter = router({
  contentByModule: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) {
      return { news: 0, studies: 0, library: 0, events: 0, communities: 0, forumTopics: 0, rabbiQuestions: 0 };
    }

    const [news, studies, library, events, communities, forumTopics, rabbiQuestions] =
      await Promise.all([
        db.newsArticle.count({ where: { tenantId: ctx.tenantId } }),
        db.studyMaterial.count({ where: { tenantId: ctx.tenantId } }),
        db.libraryItem.count({ where: { tenantId: ctx.tenantId } }),
        db.event.count({ where: { tenantId: ctx.tenantId } }),
        db.community.count({ where: { tenantId: ctx.tenantId } }),
        db.forumTopic.count({ where: { tenantId: ctx.tenantId } }),
        db.rabbiQuestion.count({ where: { tenantId: ctx.tenantId } }),
      ]);

    return { news, studies, library, events, communities, forumTopics, rabbiQuestions };
  }),

  eventParticipation: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    const tenantId = ctx.tenantId;

    const now = new Date();
    const months: { label: string; startDate: Date; endDate: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      months.push({ label: formatMonth(d), startDate: start, endDate: end });
    }

    const results = await Promise.all(
      months.map(async ({ label, startDate, endDate }) => {
        const eventCount = await db.event.count({
          where: {
            tenantId,
            dateTime: { gte: startDate, lte: endDate },
          },
        });

        const eventIds = await db.event.findMany({
          where: {
            tenantId,
            dateTime: { gte: startDate, lte: endDate },
          },
          select: { id: true },
        });

        const totalRegistrations =
          eventIds.length > 0
            ? await db.eventRegistration.count({
                where: { eventId: { in: eventIds.map((e) => e.id) } },
              })
            : 0;

        return { month: label, eventCount, totalRegistrations };
      })
    );

    return results;
  }),

  libraryTopItems: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    const tenantId = ctx.tenantId;

    return db.libraryItem.findMany({
      where: { tenantId },
      orderBy: { downloadCount: "desc" },
      take: 10,
      select: {
        title: true,
        downloadCount: true,
        materialType: true,
      },
    });
  }),

  activityByDay: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    const tenantId = ctx.tenantId;

    const thirtyDaysAgo = subDays(new Date(), 30);

    const logs = await db.auditLog.findMany({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    const dayMap: Record<string, number> = {};
    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);
      dayMap[key] = (dayMap[key] ?? 0) + 1;
    }

    const result: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: dayMap[key] ?? 0 });
    }

    return result;
  }),

  platformStats: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCommunities: 0,
        activeCommunities: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        totalStudyMaterials: 0,
        totalLibraryItems: 0,
        totalLibraryDownloads: 0,
        totalNewsArticles: 0,
        publishedArticles: 0,
        totalTzedakaCampaigns: 0,
        activeCampaigns: 0,
        totalCertificates: 0,
        totalAuditLogs: 0,
      };
    }

    const thirtyDaysAgo = subDays(new Date(), 30);

    const [
      totalUsers,
      activeUsers,
      totalCommunities,
      activeCommunities,
      totalEvents,
      upcomingEvents,
      totalStudyMaterials,
      totalLibraryItems,
      libraryDownloads,
      totalNewsArticles,
      publishedArticles,
      totalTzedakaCampaigns,
      activeCampaigns,
      totalCertificates,
      totalAuditLogs,
    ] = await Promise.all([
      db.tenantMember.count({ where: { tenantId: ctx.tenantId } }),
      db.user.count({
        where: {
          tenantMembers: { some: { tenantId: ctx.tenantId } },
          lastLoginAt: { gte: thirtyDaysAgo },
        },
      }),
      db.community.count({ where: { tenantId: ctx.tenantId } }),
      db.community.count({
        where: { tenantId: ctx.tenantId, isActive: true },
      }),
      db.event.count({ where: { tenantId: ctx.tenantId } }),
      db.event.count({
        where: { tenantId: ctx.tenantId, dateTime: { gte: new Date() } },
      }),
      db.studyMaterial.count({ where: { tenantId: ctx.tenantId } }),
      db.libraryItem.count({ where: { tenantId: ctx.tenantId } }),
      db.libraryItem.aggregate({
        where: { tenantId: ctx.tenantId },
        _sum: { downloadCount: true },
      }),
      db.newsArticle.count({ where: { tenantId: ctx.tenantId } }),
      db.newsArticle.count({
        where: { tenantId: ctx.tenantId, status: "PUBLISHED" },
      }),
      db.tzedakaCampaign.count({ where: { tenantId: ctx.tenantId } }),
      db.tzedakaCampaign.count({
        where: { tenantId: ctx.tenantId, status: "ACTIVE" },
      }),
      db.certificate.count({ where: { tenantId: ctx.tenantId } }),
      db.auditLog.count({
        where: {
          tenantId: ctx.tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCommunities,
      activeCommunities,
      totalEvents,
      upcomingEvents,
      totalStudyMaterials,
      totalLibraryItems,
      totalLibraryDownloads: libraryDownloads._sum.downloadCount ?? 0,
      totalNewsArticles,
      publishedArticles,
      totalTzedakaCampaigns,
      activeCampaigns,
      totalCertificates,
      totalAuditLogs,
    };
  }),

  recentActivity: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.auditLog.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }),

  userGrowth: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    const tenantId = ctx.tenantId;

    const months: { month: string; startDate: Date }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: formatMonth(date),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      });
    }

    const results = await Promise.all(
      months.map(async ({ month, startDate }) => {
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        const count = await db.tenantMember.count({
          where: {
            tenantId,
            joinedAt: { gte: startDate, lte: endDate },
          },
        });
        return { month, count };
      })
    );

    return results;
  }),
});
