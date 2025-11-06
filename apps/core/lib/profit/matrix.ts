export type Tier = "FREE" | "CORE" | "PRO" | "ENTERPRISE";

export interface FeaturePack {
  id: string;
  name: string;
  cost: number;   // internal unit or USD/mo
  value: number;  // perceived utility score
  deps?: string[];
  flags: Record<Tier, boolean>;
}

export const FEATURES: FeaturePack[] = [
  {
    id: "calendar",
    name: "Notion-style Calendar",
    cost: 2,
    value: 8,
    flags: { FREE: false, CORE: true, PRO: true, ENTERPRISE: true }
  },
  {
    id: "timeManager",
    name: "AI Time Manager",
    cost: 3,
    value: 10,
    flags: { FREE: false, CORE: false, PRO: true, ENTERPRISE: true }
  },
  {
    id: "voiceSync",
    name: "Realtime Voice & TTS",
    cost: 4,
    value: 12,
    flags: { FREE: false, CORE: true, PRO: true, ENTERPRISE: true }
  }
];

export const isEnabled = (tier: Tier, featureId: string): boolean =>
  !!FEATURES.find(feature => feature.id === featureId)?.flags[tier];

export const profitScore = (tier: Tier): number =>
  FEATURES.filter(feature => feature.flags[tier]).reduce((total, feature) => total + (feature.value - feature.cost), 0);

export function enabledFeatures(tier: Tier): string[] {
  return FEATURES.filter(feature => feature.flags[tier]).map(feature => feature.id);
}
