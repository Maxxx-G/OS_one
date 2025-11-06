'use client';
import { useFeature } from '@/ui/hooks/useFeature';

export function FeaturePill({ id, children }:{ id:string; children:React.ReactNode }) {
  const on = useFeature(id);
  if (!on) return null;
  return <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-500 text-white">{children}</span>;
}
