import type { IntegrationAdapter } from "./types";

export const whatsappAdapter: IntegrationAdapter = {
  name: "whatsapp",
  displayName: "WhatsApp Business API",
  description: "Envio de mensagens e notificações via WhatsApp",
  icon: "MessageSquare",
  configFields: [
    { key: "phoneNumberId", label: "Phone Number ID", type: "text", required: true },
    { key: "accessToken", label: "Access Token", type: "password", required: true },
    { key: "businessAccountId", label: "Business Account ID", type: "text", required: true },
  ],
  async testConnection() {
    return { success: true, message: "Conexão com WhatsApp preparada. Implementação futura." };
  },
};
