'use client';

type Ethic = 'PRIMACY'|'SECONDARY'|'GUARDIAN';

const color: Record<Ethic,string> = {
  PRIMACY: 'bg-yellow-500 text-black',
  SECONDARY: 'bg-gray-400 text-black',
  GUARDIAN: 'bg-blue-500 text-white'
};

export function BadgeEthic({ level }: { level: Ethic }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded ${color[level]}`}>{level}</span>;
}
