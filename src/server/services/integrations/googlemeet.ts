import type { IntegrationAdapter } from "./types";

export const googleMeetAdapter: IntegrationAdapter = {
  name: "googlemeet",
  displayName: "Google Meet",
  description: "Reuniões online via Google Meet",
  icon: "Video",
  configFields: [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client Secret", type: "password", required: true },
    { key: "calendarId", label: "Calendar ID", type: "text", required: false },
  ],
  async testConnection() {
    return { success: true, message: "Conexão com Google Meet preparada. Implementação futura." };
  },
};
