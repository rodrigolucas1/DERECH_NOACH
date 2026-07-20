import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { Sidebar } from "@/client/components/layout/Sidebar";

const ADMIN_ROLES = ["ADMIN", "LEADER"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const member = await db.tenantMember.findFirst({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (!member || !ADMIN_ROLES.includes(member.role)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={member.role} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
