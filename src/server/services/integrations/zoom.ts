import type { IntegrationAdapter } from "./types";

export const zoomAdapter: IntegrationAdapter = {
  name: "zoom",
  displayName: "Zoom",
  description: "Reuniões online via Zoom",
  icon: "Monitor",
  configFields: [
    { key: "accountId", label: "Account ID", type: "text", required: true },
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
  ],
  async testConnection() {
    return { success: true, message: "Conexão com Zoom preparada. Implementação futura." };
  },
};
