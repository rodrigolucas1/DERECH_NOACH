export interface IntegrationAdapter {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  configFields: { key: string; label: string; type: "text" | "password" | "url"; required: boolean }[];
  testConnection(config: Record<string, string>): Promise<{ success: boolean; message: string }>;
}
