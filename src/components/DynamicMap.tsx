import type { MapItem } from '../types';

const STOP_ICONS: Record<string, string> = {
  shop: '',   // cart
  task0: '',  // phone
  task1: '',  // wrench
  task2: '',  // broom
  task3: '',  // hammer
  task4: '',  // shower
  task5: '',  // paw (fun wildcard)
};

function stopIcon(item: MapItem, taskIndex: number) {
  if (item.kind === 'shop') return STOP_ICONS.shop;
  return STOP_ICONS[`task${taskIndex % 6}`];
}

function getPos(i: number) {
  return { x: i % 2 === 0 ? 95 : 245, y: 70 + i * 110 };
}

function curvePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mid = (from.y + to.y) / 2;
  return `M ${from.x},${from.y} C ${from.x},${mid} ${to.x},${mid} ${to.x},${to.y}`;
}

interface Props {
  items: MapItem[];
  completedCount: number;
}

export default function DynamicMap({ items, completedCount }: Props) {
  const total = items.length;
  const activeIdx = Math.min(completedCount, total - 1);
  const goalPos = getPos(total);
  const svgHeight = goalPos.y + 80;

  let taskCounter = 0;

  return (
    <svg
      className="map-svg"
      viewBox={`0 0 340 ${svgHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gD" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#90E06A" /><stop offset="100%" stopColor="#3a9e3a" />
        </radialGradient>
        <radialGradient id="gA" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE566" /><stop offset="100%" stopColor="#FF8C42" />
        </radialGradient>
        <radialGradient id="gS" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#B8E8FF" /><stop offset="50%" stopColor="#0ABFBC" /><stop offset="100%" stopColor="#005f8e" />
        </radialGradient>
        <radialGradient id="gL" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#dce9f0" /><stop offset="100%" stopColor="#b0c8d8" />
        </radialGradient>
        <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,100,150,.2)" /></filter>
        <filter id="gw"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="csh"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="rgba(0,80,120,.22)" /></filter>
      </defs>

      {/* Paths */}
      {items.map((_, i) => {
        if (i >= total - 1) return null;
        const from = getPos(i);
        const to = getPos(i + 1);
        const done = i < completedCount - 1;
        return (
          <g key={`path-${i}`}>
            <path d={curvePath(from, to)} stroke={done ? '#6CC44A' : 'var(--gray)'} strokeWidth={done ? 10 : 9} strokeLinecap="round" fill="none" opacity={done ? 1 : Math.max(.2, .55 - (i - completedCount) * .08)} />
            <path d={curvePath(from, to)} stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="8,14" opacity={done ? .6 : Math.max(.1, .4 - (i - completedCount) * .06)} />
          </g>
        );
      })}

      {/* Path to goal */}
      {total > 0 && (() => {
        const from = getPos(total - 1);
        return (
          <line x1={from.x} y1={from.y} x2={goalPos.x} y2={goalPos.y - 36}
            stroke="var(--gray)" strokeWidth="9" strokeLinecap="round" opacity=".2" />
        );
      })()}

      {/* Stops */}
      {items.map((item, i) => {
        const { x, y } = getPos(i);
        const done = i < completedCount;
        const active = i === completedCount;
        const opacity = done || active ? 1 : Math.max(.25, .55 - (i - completedCount) * .08);
        const icon = stopIcon(item, item.kind === 'task' ? taskCounter : 0);
        if (item.kind === 'task') taskCounter++;

        return (
          <g key={item.id} filter={active ? 'url(#gw)' : 'url(#sh)'} transform={`translate(${x},${y})`} opacity={opacity}>
            {active && (
              <circle r="30" fill="none" stroke="#FFD93D" strokeWidth="2.5">
                <animate attributeName="r" values="32;48;32" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".7;0;.7" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={active ? 32 : 28} fill={done ? 'url(#gD)' : active ? 'url(#gA)' : 'url(#gL)'} stroke="white" strokeWidth={active ? 4 : 3.5} />
            <ellipse cx="-9" cy="-12" rx="8" ry="4" fill="rgba(255,255,255,.3)" transform="rotate(-22,-9,-12)" />
            <text x="0" y="6" textAnchor="middle" dominantBaseline="middle"
              fontFamily="'Font Awesome 6 Free'" fontWeight="900" fontSize="16"
              fill={done ? 'rgba(255,255,255,.95)' : active ? 'rgba(255,255,255,.95)' : '#7a9ab0'}>
              {icon}
            </text>
            {done && (
              <>
                <circle cx="20" cy="-20" r="11" fill="#FFD93D" stroke="white" strokeWidth="2.5" />
                <text x="20" y="-20" textAnchor="middle" dominantBaseline="middle"
                  fontFamily="'Font Awesome 6 Free'" fontWeight="900" fontSize="9" fill="#2d6a4f">
                  {''}
                </text>
              </>
            )}
            {active && (
              <>
                <rect x="-18" y="-52" width="36" height="17" rx="8.5" fill="#FF6B6B" />
                <text x="0" y="-44" textAnchor="middle" fontFamily="Baloo 2,cursive" fontSize="10" fontWeight="800" fill="white">NÅ!</text>
                <line x1="0" y1="-34" x2="0" y2="-40" stroke="#FFD93D" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="0,-32 -4,-38 4,-38" fill="#FFD93D" />
              </>
            )}
          </g>
        );
      })}

      {/* Goal node */}
      <g filter="url(#sh)" transform={`translate(${goalPos.x},${goalPos.y})`} opacity={completedCount === total && total > 0 ? 1 : .3}>
        <circle r="34" fill="url(#gS)" stroke="white" strokeWidth="4" />
        <ellipse cx="-12" cy="-16" rx="11" ry="6" fill="rgba(255,255,255,.3)" transform="rotate(-25,-12,-16)" />
        <text x="0" y="5" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Font Awesome 6 Free'" fontWeight="900" fontSize="18" fill="rgba(255,255,255,.9)">
          {''}
        </text>
        <text x="0" y="50" textAnchor="middle" fontFamily="Baloo 2,cursive" fontSize="10" fontWeight="800" fill="#3a7ca5">
          Nytt bad!
        </text>
      </g>

      {/* Nina & Stig at active stop */}
      {total > 0 && (() => {
        const { x, y } = getPos(activeIdx);
        return (
          <>
            <g className="map-stig" filter="url(#csh)">
              <image href={`${import.meta.env.BASE_URL}stig.png`} x={x + 10} y={y - 114} width="86" height="106" style={{ mixBlendMode: 'multiply' }} />
            </g>
            <g className="map-nina" filter="url(#csh)">
              <image href={`${import.meta.env.BASE_URL}nina.png`} x={x - 96} y={y - 108} width="80" height="99"
                transform={`translate(${(x - 96) * 2 + 80}, 0) scale(-1, 1)`}
                style={{ mixBlendMode: 'multiply' }} />
            </g>
          </>
        );
      })()}

      {/* Empty state */}
      {total === 0 && (
        <text x="170" y="100" textAnchor="middle" fontFamily="Baloo 2,cursive" fontSize="14" fontWeight="800" fill="#5a8fa8">
          Legg til gjøremål for å starte!
        </text>
      )}
    </svg>
  );
}
