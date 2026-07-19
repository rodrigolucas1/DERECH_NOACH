import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@bneinoach.org";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Administrador Geral";

async function main() {
  console.log("🌱 Seeding database...\n");

  // ═══════════════════════════════════════
  // 1. TENANT
  // ═══════════════════════════════════════
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
  console.log(`✅ Tenant: ${mg.name}`);

  // ═══════════════════════════════════════
  // 2. BRANDING
  // ═══════════════════════════════════════
  const existingBranding = await prisma.brandingConfig.findUnique({
    where: { tenantId: mg.id },
  });
  if (!existingBranding) {
    await prisma.brandingConfig.create({
      data: {
        tenantId: mg.id,
        platformName: "Portal Bnei Noach MG",
        primaryColor: "#1a56db",
        secondaryColor: "#1e40af",
        accentColor: "#f59e0b",
        slogan: "Construindo uma comunidade de retos diante de D-us",
      },
    });
    console.log("✅ Branding criado");
  }

  // ═══════════════════════════════════════
  // 3. ADMIN USER (Super Administrador)
  // ═══════════════════════════════════════
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

  const existingMember = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: mg.id, userId: adminUser.id } },
  });
  if (!existingMember) {
    await prisma.tenantMember.create({
      data: { tenantId: mg.id, userId: adminUser.id, role: "ADMIN" },
    });
  }
  console.log(`✅ Admin: ${adminUser.email} (role: ADMIN)`);

  // ═══════════════════════════════════════
  // 4. USUÁRIOS DE TESTE
  // ═══════════════════════════════════════
  const testUsers = [
    { email: "lider@bneinoach.org", name: "Líder Comunitário", role: "LEADER" as const },
    { email: "membro@bneinoach.org", name: "Membro Comum", role: "MEMBER" as const },
  ];

  const createdUsers = [];
  for (const u of testUsers) {
    const hash = await bcrypt.hash("teste123", 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hash,
        isActive: true,
        emailVerified: new Date(),
      },
    });
    const member = await prisma.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId: mg.id, userId: user.id } },
    });
    if (!member) {
      await prisma.tenantMember.create({
        data: { tenantId: mg.id, userId: user.id, role: u.role },
      });
    }
    createdUsers.push(user);
    console.log(`✅ Usuário: ${user.email} (role: ${u.role})`);
  }

  // ═══════════════════════════════════════
  // 5. COMUNIDADES
  // ═══════════════════════════════════════
  const communitiesData = [
    { name: "Comunidade Bnei Noach Belo Horizonte", slug: "belo-horizonte", city: "Belo Horizonte", description: "Comunidade na capital de Minas Gerais. Encontros semanais às quintas-feiras." },
    { name: "Comunidade Bnei Noach Uberlândia", slug: "uberlandia", city: "Uberlândia", description: "Comunidade no Triângulo Mineiro. Estudos aos sábados." },
    { name: "Comunidade Bnei Noach Juiz de Fora", slug: "juiz-de-fora", city: "Juiz de Fora", description: "Comunidade na Zona da Mata. Encontros quinzenais." },
  ];

  const communities = [];
  for (const c of communitiesData) {
    const existing = await prisma.community.findFirst({ where: { name: c.name, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.community.create({
        data: { ...c, tenantId: mg.id, state: "MG" },
      });
      communities.push(created);
      console.log(`✅ Comunidade: ${created.name}`);
    } else {
      communities.push(existing);
    }
  }

  // ═══════════════════════════════════════
  // 6. CATEGORIAS DE ESTUDO
  // ═══════════════════════════════════════
  const studyCategoriesData = [
    { name: "As Sete Leis de Noé", slug: "sete-leis" },
    { name: "Estudos da Semana", slug: "estudos-semana" },
    { name: "Celebrações e Datas", slug: "celebracoes" },
    { name: "História do Movimento", slug: "historia" },
    { name: "Filosofia e Ética", slug: "filosofia" },
  ];

  for (const cat of studyCategoriesData) {
    const existing = await prisma.studyCategory.findFirst({ where: { slug: cat.slug, tenantId: mg.id } });
    if (!existing) {
      await prisma.studyCategory.create({ data: { ...cat, tenantId: mg.id } });
      console.log(`✅ Categoria de estudo: ${cat.name}`);
    }
  }

  // ═══════════════════════════════════════
  // 7. EVENTOS
  // ═══════════════════════════════════════
  const now = new Date();
  const eventsData = [
    {
      title: "Estudo Semanal: As Sete Leis Universais",
      description: "Aprofundamento nas Sete Leis de Noé com foco na Lei contra idolatria.",
      dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: "Sinagoga Beit Tzedek, BH",
      eventType: "IN_PERSON" as const,
      communityId: communities[0]?.id,
    },
    {
      title: "Shabbat Comunitário Virtual",
      description: "Celebração do Shabbat online para comunidades de Minas Gerais.",
      dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      eventType: "ONLINE" as const,
      communityId: communities[0]?.id,
    },
    {
      title: "Conferência Nacional Bnei Noach 2026",
      description: "Encontro nacional com palestrantes de todo o Brasil.",
      dateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      location: "Centro de Convenções, BH",
      meetingUrl: "https://zoom.us/j/123456789",
      eventType: "HYBRID" as const,
      maxAttendees: 200,
      communityId: communities[0]?.id,
    },
    {
      title: "Estudo Avançado: Talmud para Noachidas",
      description: "Curso intermediário de princípios talmúdicos aplicados às Sete Leis.",
      dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: "Comunidade Uberlândia",
      eventType: "IN_PERSON" as const,
      communityId: communities[1]?.id,
    },
  ];

  for (const e of eventsData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title, tenantId: mg.id } });
    if (!existing) {
      await prisma.event.create({
        data: { ...e, tenantId: mg.id, createdById: adminUser.id },
      });
      console.log(`✅ Evento: ${e.title}`);
    }
  }

  // ═══════════════════════════════════════
  // 8. CATEGORIAS + ARTIGOS DE NOTÍCIAS
  // ═══════════════════════════════════════
  const newsCategoriesData = [
    { name: "Comunidade", slug: "comunidade", color: "#3b82f6" },
    { name: "Estudos", slug: "estudos-news", color: "#10b981" },
    { name: "Eventos", slug: "eventos-news", color: "#f59e0b" },
    { name: "Israel", slug: "israel", color: "#6366f1" },
  ];

  const newsCategories = [];
  for (const cat of newsCategoriesData) {
    const existing = await prisma.newsCategory.findFirst({ where: { slug: cat.slug, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.newsCategory.create({ data: { ...cat, tenantId: mg.id } });
      newsCategories.push(created);
    } else {
      newsCategories.push(existing);
    }
  }

  const newsData = [
    {
      title: "Nova Comunidade Bnei Noach em Contagem",
      slug: "nova-comunidade-contagem",
      excerpt: "A comunidade de Contagem ganha seu próprio espaço de encontro.",
      body: "<p>Com alegria anunciamos a inauguração de um novo espaço para a comunidade Bnei Noach de Contagem, na Região Metropolitana de Belo Horizonte.</p><p>O espaço conta com sala de estudos, biblioteca e área para eventos comunitários.</p>",
      status: "PUBLISHED" as const,
      isFeatured: true,
      categoryId: newsCategories[0]?.id,
    },
    {
      title: "Cycle of Torah: Novo Programa de Estudos",
      slug: "cycle-of-torah-novo-programa",
      excerpt: "Programa semanal de estudo das Sete Leis de Noé.",
      body: "<p>Iniciamos o programa Cycle of Torah, com encontros semanais dedicados ao estudo das Sete Leis de Noé e seus detalhes.</p>",
      status: "PUBLISHED" as const,
      isFeatured: false,
      categoryId: newsCategories[1]?.id,
    },
    {
      title: "Conferência 2026: Inscrições Abertas",
      slug: "conferencia-2026-inscricoes",
      excerpt: "As inscrições para a conferência nacional estão abertas.",
      body: "<p>A Conferência Nacional Bnei Noach 2026 acontecerá em agosto em Belo Horizonte. Inscrições já disponíveis.</p>",
      status: "PUBLISHED" as const,
      isFeatured: false,
      categoryId: newsCategories[2]?.id,
    },
    {
      title: "Rascunho: Artigo sobre Noé",
      slug: "rascunho-noe",
      excerpt: "Artigo em revisão sobre a história de Noé.",
      body: "<p>Em breve publicaremos um artigo aprofundado sobre a história de Noé e seu significado para os Bnei Noach.</p>",
      status: "DRAFT" as const,
      isFeatured: false,
      categoryId: newsCategories[1]?.id,
    },
  ];

  for (const n of newsData) {
    const existing = await prisma.newsArticle.findFirst({ where: { slug: n.slug, tenantId: mg.id } });
    if (!existing) {
      await prisma.newsArticle.create({
        data: {
          ...n,
          tenantId: mg.id,
          authorId: adminUser.id,
          publishedAt: n.status === "PUBLISHED" ? new Date() : null,
        },
      });
      console.log(`✅ Notícia: ${n.title} (${n.status})`);
    }
  }

  // ═══════════════════════════════════════
  // 9. BANNERS
  // ═══════════════════════════════════════
  const bannersData = [
    { title: "Conferência Nacional 2026", subtitle: "Inscrições abertas!", imageUrl: "/uploads/banner-conferencia.jpg", position: "HOME_HERO" as const, order: 1 },
    { title: "Estudos da Semana", subtitle: "Todo Thursday às 19h", imageUrl: "/uploads/banner-estudos.jpg", position: "HOME_HERO" as const, order: 2 },
    { title: "Tzedaká", subtitle: "Ajude a comunidade", imageUrl: "/uploads/banner-tzedaka.jpg", position: "HOME_SIDEBAR" as const, order: 1 },
  ];

  for (const b of bannersData) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title, tenantId: mg.id } });
    if (!existing) {
      await prisma.banner.create({ data: { ...b, tenantId: mg.id } });
      console.log(`✅ Banner: ${b.title}`);
    }
  }

  // ═══════════════════════════════════════
  // 10. CAMpanhas DE TZEDAKÁ
  // ═══════════════════════════════════════
  const tzedakaData = [
    {
      title: "Reforma do Espaço Comunitário",
      description: "Campanha para reforma e adequação do espaço da comunidade em Belo Horizonte.",
      goalAmount: 50000,
      currentAmount: 12500,
      status: "ACTIVE" as const,
      isPublic: true,
    },
    {
      title: "Ajuda às Famílias Carentes",
      description: "Distribuição de cestas básicas para famílias da comunidade.",
      goalAmount: 15000,
      currentAmount: 8000,
      status: "ACTIVE" as const,
      isPublic: true,
    },
    {
      title: "Campanha Anterior Concluída",
      description: "Campanha de arrecadação para a Conferência 2025.",
      goalAmount: 20000,
      currentAmount: 22000,
      status: "COMPLETED" as const,
      isPublic: true,
    },
  ];

  for (const t of tzedakaData) {
    const existing = await prisma.tzedakaCampaign.findFirst({ where: { title: t.title, tenantId: mg.id } });
    if (!existing) {
      await prisma.tzedakaCampaign.create({ data: { ...t, tenantId: mg.id } });
      console.log(`✅ Tzedaká: ${t.title} (${t.status})`);
    }
  }

  // ═══════════════════════════════════════
  // 11. RABINOS
  // ═══════════════════════════════════════
  const rabbisData = [
    { name: "Rabino Shmuel Silva", title: "Rabino Sênior", bio: "Rabino formado pelo Machon Meir, Jerusalem. Líder espiritual da comunidade MG desde 2018.", email: "rabino.shmuel@bneinoach.org" },
    { name: "Rabino Yitzchak Cohen", title: "Rabino Educador", bio: "Especialista em ensino das Sete Leis de Noé para não-judeus. Professor no programa Cycle of Torah.", email: "rabino.yitzchak@bneinoach.org" },
  ];

  for (const r of rabbisData) {
    const existing = await prisma.rabbiProfile.findFirst({ where: { name: r.name, tenantId: mg.id } });
    if (!existing) {
      await prisma.rabbiProfile.create({ data: { ...r, tenantId: mg.id } });
      console.log(`✅ Rabino: ${r.name}`);
    }
  }

  // ═══════════════════════════════════════
  // 12. BIBLIOTECA (Autores + Categorias + Itens)
  // ═══════════════════════════════════════
  const libAuthorsData = [
    { name: "Rav Noah Weinberg", bio: "Fundador do Aish HaTorah" },
    { name: "Rav Dov Ber Pinson", bio: "Autor e professor de mussar e cabala" },
    { name: "Rav Avigdor Miller", bio: "Rabino e autor americano" },
  ];

  const libAuthors = [];
  for (const a of libAuthorsData) {
    const existing = await prisma.libraryAuthor.findFirst({ where: { name: a.name, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.libraryAuthor.create({ data: { ...a, tenantId: mg.id } });
      libAuthors.push(created);
    } else {
      libAuthors.push(existing);
    }
  }

  const libCategoriesData = [
    { name: "Sete Leis de Noé", slug: "sete-leis-lib" },
    { name: "Espiritualidade", slug: "espiritualidade" },
    { name: "Halachá", slug: "halacha" },
  ];

  const libCategories = [];
  for (const c of libCategoriesData) {
    const existing = await prisma.libraryCategory.findFirst({ where: { slug: c.slug, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.libraryCategory.create({ data: { ...c, tenantId: mg.id } });
      libCategories.push(created);
    } else {
      libCategories.push(existing);
    }
  }

  const libItemsData = [
    { title: "As Sete Leis de Noé: Guia Prático", description: "Um guia completo sobre as Sete Leis de Noé aplicadas no dia a dia.", materialType: "DOCUMENT" as const, authorId: libAuthors[0]?.id, categoryId: libCategories[0]?.id, pageCount: 220 },
    { title: "Torah para a Humanidade", description: "Palestra sobre a relevância da Torah para todos os povos.", materialType: "VIDEO" as const, authorId: libAuthors[1]?.id, categoryId: libCategories[1]?.id, duration: 3600 },
    { title: "Audio Shiur: Justiça Social", description: "Aula em áudio sobre justiça social na tradição judaica.", materialType: "AUDIO" as const, authorId: libAuthors[2]?.id, categoryId: libCategories[1]?.id, duration: 2400 },
    { title: "Site: Ask Noah International", description: "Recurso online para perguntas sobre a Fé Noáica.", materialType: "LINK" as const, externalUrl: "https://www.asknoah.org", categoryId: libCategories[0]?.id },
  ];

  for (const item of libItemsData) {
    const existing = await prisma.libraryItem.findFirst({ where: { title: item.title, tenantId: mg.id } });
    if (!existing) {
      await prisma.libraryItem.create({ data: { ...item, tenantId: mg.id } });
      console.log(`✅ Biblioteca: ${item.title}`);
    }
  }

  // ═══════════════════════════════════════
  // 13. CMS - PÁGINAS
  // ═══════════════════════════════════════
  const pagesData = [
    { slug: "sobre", title: "Sobre Nós", body: "<h2>Quem Somos</h2><p>Somos a comunidade Bnei Noach de Minas Gerais, uma organização dedicada ao estudo e prática das Sete Leis de Noé.</p><p>Nosso objetivo é fortalecer a conexão espiritual e comunitária de todos os Bnei Noach de Minas Gerais.</p>", isPublished: true, metaTitle: "Sobre Nós - Bnei Noach MG", metaDescription: "Conheça a comunidade Bnei Noach de Minas Gerais." },
    { slug: "contato", title: "Contato", body: "<h2>Entre em Contato</h2><p>Email: contato@bneinoach.org</p><p>Telefone: (31) 99999-0000</p><p>Endereço: Rua Example, 123 - Belo Horizonte, MG</p>", isPublished: true, metaTitle: "Contato - Bnei Noach MG", metaDescription: "Entre em contato com a comunidade." },
    { slug: "como-participar", title: "Como Participar", body: "<h2>Como Participar</h2><p>Para se juntar à comunidade, basta comparecer a um de nossos encontros ou entrar em contato pelo formulário.</p><p>Não há requisitos prévios - todos são bem-vindos!</p>", isPublished: true },
    { slug: "termos-de-uso", title: "Termos de Uso", body: "<h2>Termos de Uso</h2><p>Conteúdo em construção...</p>", isPublished: false },
  ];

  for (const p of pagesData) {
    const existing = await prisma.page.findFirst({ where: { slug: p.slug, tenantId: mg.id } });
    if (!existing) {
      await prisma.page.create({ data: { ...p, tenantId: mg.id } });
      console.log(`✅ Página CMS: ${p.title} (${p.isPublished ? "publicada" : "rascunho"})`);
    }
  }

  // ═══════════════════════════════════════
  // 14. FÓRUM (Categorias + Tópicos + Posts)
  // ═══════════════════════════════════════
  const forumCatsData = [
    { name: "Discussões Gerais", slug: "gerais", description: "Tópicos gerais sobre a fé e a vida." },
    { name: "Perguntas e Respostas", slug: "perguntas", description: "Tire suas dúvidas sobre as Sete Leis." },
    { name: "Estudos e Materiais", slug: "estudos-forum", description: "Compartilhe materiais de estudo." },
  ];

  const forumCats = [];
  for (const c of forumCatsData) {
    const existing = await prisma.forumCategory.findFirst({ where: { slug: c.slug, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.forumCategory.create({ data: { ...c, tenantId: mg.id } });
      forumCats.push(created);
    } else {
      forumCats.push(existing);
    }
  }

  const forumTopicsData = [
    { title: "Bem-vindos ao Fórum!", categoryId: forumCats[0]?.id, isPinned: true },
    { title: "Qual a melhor tradução das Sete Leis?", categoryId: forumCats[1]?.id },
    { title: "Material de estudo sobre Shevat HaMishpatim", categoryId: forumCats[2]?.id },
  ];

  const forumTopics = [];
  for (const t of forumTopicsData) {
    if (!t.categoryId) continue;
    const existing = await prisma.forumTopic.findFirst({ where: { title: t.title, tenantId: mg.id } });
    if (!existing) {
      const created = await prisma.forumTopic.create({
        data: { ...t, tenantId: mg.id, authorId: adminUser.id },
      });
      forumTopics.push(created);
    } else {
      forumTopics.push(existing);
    }
  }

  const forumPostsData = [
    { topicId: forumTopics[0]?.id, content: "Sejam bem-vindos ao fórum da comunidade Bnei Noach MG! Aqui vocês podem discutir, perguntar e compartilhar." },
    { topicId: forumTopics[1]?.id, content: "Alguém pode recomendar uma boa tradução das Sete Leis de Noé para o português?" },
    { topicId: forumTopics[1]?.id, content: "Recomendo fortemente a tradução do Rabino Tovia Singer. Muito acessível." },
  ];

  for (const p of forumPostsData) {
    if (!p.topicId) continue;
    const existing = await prisma.forumPost.findFirst({ where: { topicId: p.topicId, tenantId: mg.id } });
    if (!existing) {
      await prisma.forumPost.create({
        data: { ...p, tenantId: mg.id, authorId: adminUser.id },
      });
    }
  }
  console.log("✅ Fórum: categorias, tópicos e posts criados");

  // ═══════════════════════════════════════
  // 15. NOTIFICAÇÕES DE TESTE
  // ═══════════════════════════════════════
  const notificationsData = [
    { type: "EVENT" as const, title: "Novo evento agendado", message: "Estudo Semanal: As Sete Leis Universais foi criado.", link: "/admin/events" },
    { type: "COMMUNITY" as const, title: "Bem-vindo!", message: "Sua conta foi ativada. Explore a plataforma.", link: "/communities" },
    { type: "GENERAL" as const, title: "Manutenção programada", message: "Haverá manutenção no servidor neste sábado às 22h.", link: undefined },
  ];

  for (const n of notificationsData) {
    const existing = await prisma.notification.findFirst({ where: { title: n.title, userId: adminUser.id } });
    if (!existing) {
      await prisma.notification.create({
        data: { ...n, tenantId: mg.id, userId: adminUser.id },
      });
    }
  }
  console.log("✅ Notificações de teste criadas");

  // ═══════════════════════════════════════
  // RESUMO
  // ═══════════════════════════════════════
  const counts = {
    tenants: await prisma.tenant.count(),
    users: await prisma.user.count(),
    members: await prisma.tenantMember.count(),
    communities: await prisma.community.count(),
    studyCategories: await prisma.studyCategory.count(),
    events: await prisma.event.count(),
    newsCategories: await prisma.newsCategory.count(),
    newsArticles: await prisma.newsArticle.count(),
    banners: await prisma.banner.count(),
    tzedakaCampaigns: await prisma.tzedakaCampaign.count(),
    rabbiProfiles: await prisma.rabbiProfile.count(),
    libraryAuthors: await prisma.libraryAuthor.count(),
    libraryCategories: await prisma.libraryCategory.count(),
    libraryItems: await prisma.libraryItem.count(),
    pages: await prisma.page.count(),
    forumCategories: await prisma.forumCategory.count(),
    forumTopics: await prisma.forumTopic.count(),
    forumPosts: await prisma.forumPost.count(),
    notifications: await prisma.notification.count(),
  };

  console.log("\n═══════════════════════════════════════════");
  console.log("🎉 Seed concluído com sucesso!");
  console.log("═══════════════════════════════════════════");
  console.log("\n📋 Resumo dos dados:");
  Object.entries(counts).forEach(([key, val]) => {
    console.log(`   ${key}: ${val}`);
  });
  console.log("\n🔐 Credenciais de acesso:");
  console.log("───────────────────────────────────────────");
  console.log("  SUPER ADMINISTRADOR:");
  console.log(`    Email: ${ADMIN_EMAIL}`);
  console.log(`    Senha: ${ADMIN_PASSWORD}`);
  console.log("");
  console.log("  LÍDER:");
  console.log(`    Email: lider@bneinoach.org`);
  console.log(`    Senha: teste123`);
  console.log("");
  console.log("  MEMBRO:");
  console.log(`    Email: membro@bneinoach.org`);
  console.log(`    Senha: teste123`);
  console.log("───────────────────────────────────────────");
  console.log("\n🌐 Acesse: http://localhost:3000");
  console.log("   Admin:  http://localhost:3000/admin/dashboard");
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
