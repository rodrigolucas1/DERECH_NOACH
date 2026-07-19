import type { IntegrationAdapter } from "./types";

export const resendAdapter: IntegrationAdapter = {
  name: "resend",
  displayName: "Resend Email",
  description: "Envio de e-mails transacionais via Resend",
  icon: "Mail",
  configFields: [
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "fromEmail", label: "E-mail Remetente", type: "text", required: true },
    { key: "fromName", label: "Nome Remetente", type: "text", required: false },
  ],
  async testConnection() {
    return { success: true, message: "Conexão com Resend preparada. Implementação futura." };
  },
};
