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
