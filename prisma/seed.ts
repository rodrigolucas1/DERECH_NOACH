import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@bneinoach.org";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Administrador";

async function main() {
  console.log("🌱 Seeding database...");

  // Create first tenant: Minas Gerais
  const mg = await prisma.tenant.upsert({
    where: { slug: "mg" },
    update: {},
    create: {
      name: "Comunidade Bnei Noach de Minas Gerais",
      slug: "mg",
      state: "MG",
      isActive: true,
    },
  });
  console.log(`✅ Tenant created: ${mg.name} (${mg.id})`);

  // Create branding for MG tenant
  const existingBranding = await prisma.brandingConfig.findUnique({
    where: { tenantId: mg.id },
  });
  if (!existingBranding) {
    await prisma.brandingConfig.create({
      data: {
        tenantId: mg.id,
        platformName: "Comunidade Bnei Noach MG",
        primaryColor: "#1a56db",
        secondaryColor: "#1e40af",
        accentColor: "#f59e0b",
      },
    });
    console.log("✅ Branding config created for MG");
  }

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email} (${adminUser.id})`);

  // Make admin user a tenant ADMIN
  const existingMember = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId: mg.id,
        userId: adminUser.id,
      },
    },
  });

  if (!existingMember) {
    await prisma.tenantMember.create({
      data: {
        tenantId: mg.id,
        userId: adminUser.id,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user assigned as tenant ADMIN");
  }

  // Create sample communities for MG
  const communities = [
    {
      name: "Comunidade Bnei Noach Belo Horizonte",
      slug: "belo-horizonte",
      city: "Belo Horizonte",
      state: "MG",
      description: "Comunidade Bnei Noach na capital de Minas Gerais.",
    },
    {
      name: "Comunidade Bnei Noach Uberlândia",
      slug: "uberlandia",
      city: "Uberlândia",
      state: "MG",
      description: "Comunidade Bnei Noach no Triângulo Mineiro.",
    },
    {
      name: "Comunidade Bnei Noach Juiz de Fora",
      slug: "juiz-de-fora",
      city: "Juiz de Fora",
      state: "MG",
      description: "Comunidade Bnei Noach na Zona da Mata de Minas Gerais.",
    },
  ];

  for (const comm of communities) {
    const existing = await prisma.community.findFirst({
      where: { name: comm.name, tenantId: mg.id },
    });

    if (!existing) {
      const created = await prisma.community.create({
        data: {
          ...comm,
          tenantId: mg.id,
        },
      });
      console.log(`✅ Community created: ${created.name}`);
    }
  }

  // Create sample study categories
  const categories = [
    { name: "As Sete Leis de Noé", slug: "sete-leis" },
    { name: "Estudos da Semana", slug: "estudos-semana" },
    { name: "Celebrações e Datas", slug: "celebracoes" },
    { name: "História do Movimento", slug: "historia" },
  ];

  for (const cat of categories) {
    const existing = await prisma.studyCategory.findFirst({
      where: { slug: cat.slug, tenantId: mg.id },
    });

    if (!existing) {
      const created = await prisma.studyCategory.create({
        data: {
          ...cat,
          tenantId: mg.id,
        },
      });
      console.log(`✅ Study category created: ${created.name}`);
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("🎉 Seed completed!");
  console.log("");
  console.log("📋 Admin login credentials:");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Senha: ${ADMIN_PASSWORD}`);
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
