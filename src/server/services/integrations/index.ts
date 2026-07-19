import type { IntegrationAdapter } from "./types";
import { whatsappAdapter } from "./whatsapp";
import { googleMeetAdapter } from "./googlemeet";
import { zoomAdapter } from "./zoom";
import { youtubeAdapter } from "./youtube";
import { resendAdapter } from "./resend";

const adapters: IntegrationAdapter[] = [
  whatsappAdapter,
  googleMeetAdapter,
  zoomAdapter,
  youtubeAdapter,
  resendAdapter,
];

export function getIntegrationAdapter(service: string): IntegrationAdapter | null {
  return adapters.find((a) => a.name === service) ?? null;
}

export function getAllAdapters(): IntegrationAdapter[] {
  return adapters;
}

export type { IntegrationAdapter };
