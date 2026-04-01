
type KnowledgeItem = {
  cancelUrl?: string;
  steps: string[];
  note?: string;
};

const KNOWLEDGE: Record<string, KnowledgeItem> = {
  netflix: {
    cancelUrl: "https://www.netflix.com/account",
    steps: ["Open Netflix account", "Choose Membership & Billing", "Cancel membership"],
  },
  spotify: {
    cancelUrl: "https://www.spotify.com/account",
    steps: ["Open Spotify account", "Go to plan settings", "Cancel Premium"],
  },
  adobe: {
    cancelUrl: "https://account.adobe.com/plans",
    steps: ["Open Adobe account", "Choose plan", "Cancel your plan"],
  },
  storytel: {
    steps: ["Open Storytel account", "Find subscription settings", "Cancel or pause membership"],
  },
  canva: {
    cancelUrl: "https://www.canva.com/settings/billing",
    steps: ["Open Canva billing settings", "Select subscription", "Cancel plan"],
  },
};

export function getCancelHelp(merchant: string): KnowledgeItem {
  const key = merchant.toLowerCase();
  const match = Object.entries(KNOWLEDGE).find(([name]) => key.includes(name));
  if (match) return match[1];

  return {
    steps: [
      "Open the service account settings",
      "Look for Billing, Plan, Subscription or Membership",
      "Choose Cancel, Downgrade, or Pause",
    ],
    note: "Generic fallback because this service is not in the built-in knowledge base.",
  };
}
