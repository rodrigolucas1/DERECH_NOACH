import { z } from "zod";
import { router, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || undefined,
});

const SYSTEM_PROMPT = `Você é o Assistente IA do Portal Bnei Noach, uma plataforma para a comunidade noachida brasileira. 
Suas especialidades incluem:
- Ensinamentos sobre os 7 Mandamentos dos Filhos de Noé (Sheva Mitzvot B'nei Noach)
- Halachá (lei judaica) aplicável a noachidas
- História e tradições do povo judeu
- Tópicos sobreTorá, ética judaica e espiritualidade
- Ajudar com dúvidas sobre a fé e prática noachida

Responda sempre em português brasileiro, de forma respeitosa, educativa e acessível. 
Se não souber algo, diga honestamente. Não invente informações.
Se a pergunta não estiver relacionada ao judaísmo ou à comunidade noachida, redirecione educadamente para os tópicos do portal.`;

export const aiRouter = router({
  listConversations: authenticatedProcedure.query(async ({ ctx }) => {
    return db.aIConversation.findMany({
      where: {
        tenantId: ctx.tenantId!,
        userId: ctx.userId!,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  getConversation: authenticatedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await db.aIConversation.findUnique({
        where: { id: input.conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation || conversation.tenantId !== ctx.tenantId || conversation.userId !== ctx.userId) {
        return null;
      }

      return conversation;
    }),

  createConversation: authenticatedProcedure
    .input(z.object({ title: z.string().min(1).default("Nova conversa") }))
    .mutation(async ({ ctx, input }) => {
      return db.aIConversation.create({
        data: {
          tenantId: ctx.tenantId!,
          userId: ctx.userId!,
          title: input.title,
        },
      });
    }),

  sendMessage: authenticatedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await db.aIConversation.findUnique({
        where: { id: input.conversationId },
      });

      if (!conversation || conversation.tenantId !== ctx.tenantId || conversation.userId !== ctx.userId) {
        throw new Error("Conversa não encontrada.");
      }

      const userMessage = await db.aIMessage.create({
        data: {
          conversationId: input.conversationId,
          role: "user",
          content: input.content,
        },
      });

      let aiResponseContent: string;

      if (!process.env.OPENAI_API_KEY) {
        aiResponseContent =
          "O assistente IA ainda não foi configurado. Por favor, adicione sua chave de API da OpenAI no arquivo .env (OPENAI_API_KEY) para ativar o assistente.";
      } else {
        try {
          const history = await db.aIMessage.findMany({
            where: { conversationId: input.conversationId },
            orderBy: { createdAt: "asc" },
            take: 20,
          });

          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ];

          const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

          const completion = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1000,
            temperature: 0.7,
          });

          aiResponseContent = completion.choices[0]?.message?.content ||
            "Desculpe, não foi possível gerar uma resposta. Tente novamente.";
        } catch (err) {
          console.error("OpenAI API error:", err);
          aiResponseContent =
            "Ocorreu um erro ao conectar com o assistente IA. Verifique se a chave de API está configurada corretamente e tente novamente.";
        }
      }

      const aiMessage = await db.aIMessage.create({
        data: {
          conversationId: input.conversationId,
          role: "assistant",
          content: aiResponseContent,
        },
      });

      await db.aIConversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return { userMessage, aiMessage };
    }),

  deleteConversation: authenticatedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await db.aIConversation.findUnique({
        where: { id: input.conversationId },
      });

      if (!conversation || conversation.tenantId !== ctx.tenantId || conversation.userId !== ctx.userId) {
        throw new Error("Conversa não encontrada.");
      }

      await db.aIMessage.deleteMany({
        where: { conversationId: input.conversationId },
      });

      await db.aIConversation.delete({
        where: { id: input.conversationId },
      });

      return { success: true };
    }),
});
