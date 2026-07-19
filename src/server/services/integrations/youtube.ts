import type { IntegrationAdapter } from "./types";

export const youtubeAdapter: IntegrationAdapter = {
  name: "youtube",
  displayName: "YouTube",
  description: "Transmissões ao vivo e vídeos via YouTube",
  icon: "Tv",
  configFields: [
    { key: "apiKey", label: "API Key", type: "password", required: true },
    { key: "channelId", label: "Channel ID", type: "text", required: true },
  ],
  async testConnection() {
    return { success: true, message: "Conexão com YouTube preparada. Implementação futura." };
  },
};
