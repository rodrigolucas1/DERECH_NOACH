import { router } from "@/server/trpc/context";
import { tenantRouter } from "./routers/tenant";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { communityRouter } from "./routers/community";
import { eventRouter } from "./routers/event";
import { studyRouter } from "./routers/study";
import { tzedakaRouter } from "./routers/tzedaka";
import { newsRouter } from "./routers/news";
import { libraryRouter } from "./routers/library";
import { forumRouter } from "./routers/forum";
import { rabbiRouter } from "./routers/rabbi";
import { cmsRouter } from "./routers/cms";
import { bannerRouter } from "./routers/banner";
import { auditRouter } from "./routers/audit";
import { analyticsRouter } from "./routers/analytics";
import { notificationRouter } from "./routers/notification";

export const appRouter = router({
  tenant: tenantRouter,
  auth: authRouter,
  admin: adminRouter,
  community: communityRouter,
  event: eventRouter,
  study: studyRouter,
  tzedaka: tzedakaRouter,
  news: newsRouter,
  library: libraryRouter,
  forum: forumRouter,
  rabbi: rabbiRouter,
  cms: cmsRouter,
  banner: bannerRouter,
  audit: auditRouter,
  analytics: analyticsRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
