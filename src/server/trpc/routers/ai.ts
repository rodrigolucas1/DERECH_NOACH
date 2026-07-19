import { z } from "zod";
import { router, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

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

      const aiResponseContent =
        "Esta é uma resposta temporária. O módulo de IA está sendo preparado para integração com provedores externos. Sua mensagem foi recebida e será processada em breve.";

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
