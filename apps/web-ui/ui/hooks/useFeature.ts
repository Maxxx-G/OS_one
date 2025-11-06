'use client';
import { enabledFeatures } from '../../../core/lib/profit/matrix';
import { getClientTier } from '@/lib/session/tier';

export function useFeature(featureId: string): boolean {
  const tier = getClientTier();
  return enabledFeatures(tier).includes(featureId);
}
