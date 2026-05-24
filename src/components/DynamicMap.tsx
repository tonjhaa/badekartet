import { useRef, useEffect, useState, memo } from 'react';
import type { MapItem } from '../types';

function getPos(i: number) {
  return { x: i % 2 === 0 ? 95 : 245, y: 130 + i * 110 };
}

function makePath(from: number, to: number): string {
  if (to <= from) return '';
  const pts = Array.from({ length: to - from + 1 }, (_, k) => getPos(from + k));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const [p, c] = [pts[i - 1], pts[i]];
    const my = (p.y + c.y) / 2;
    d += ` C ${p.x} ${my} ${c.x} ${my} ${c.x} ${c.y}`;
  }
  return d;
}

// --- Decorations (memoized so they don't re-render during animation) ---

const Flower = memo(function Flower({ x, y, r, alive }: { x: number; y: number; r: number; alive: boolean }) {
  const pc = alive ? '#FF8CC8' : '#b8ccd4';
  const cc = alive ? '#FFD93D' : '#c8d8e0';
  return (
    <g opacity={alive ? 1 : 0.38}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={x + Math.cos(a) * r * 0.65} cy={y + Math.sin(a) * r * 0.65} r={r * 0.38} fill={pc} />;
      })}
      <circle cx={x} cy={y} r={r * 0.4} fill={cc} />
    </g>
  );
});

const Bubble = memo(function Bubble({ x, y, r, alive }: { x: number; y: number; r: number; alive: boolean }) {
  const sc = alive ? '#48CAE4' : '#b8ccd4';
  return (
    <g opacity={alive ? 0.85 : 0.28}>
      <circle cx={x} cy={y} r={r} fill="rgba(200,245,255,0.2)" stroke={sc} strokeWidth={1.5} />
      <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.22} fill="white" opacity={0.75} />
    </g>
  );
});

const Sparkle = memo(function Sparkle({ x, y, s, alive }: { x: number; y: number; s: number; alive: boolean }) {
  const c = alive ? '#FFD93D' : '#c0d0d8';
  const d = `M${x},${y - s} L${x + s * .28},${y - s * .28} L${x + s},${y} L${x + s * .28},${y + s * .28} L${x},${y + s} L${x - s * .28},${y + s * .28} L${x - s},${y} L${x - s * .28},${y - s * .28}Z`;
  return <path d={d} fill={c} opacity={alive ? 1 : 0.32} />;
});

const Duck = memo(function Duck({ x, y, s, alive }: { x: number; y: number; s: number; alive: boolean }) {
  const bc = alive ? '#FFD93D' : '#c8d8e0';
  const bk = alive ? '#FFA500' : '#b0c0cc';
  return (
    <g opacity={alive ? 1 : 0.32}>
      <ellipse cx={x} cy={y + s * .25} rx={s * .75} ry={s * .48} fill={bc} />
      <circle cx={x + s * .3} cy={y - s * .05} r={s * .38} fill={bc} />
      <path d={`M${x + s * .62},${y - s * .05} L${x + s * .92},${y + s * .05} L${x + s * .62},${y + s * .15}Z`} fill={bk} />
      <circle cx={x + s * .42} cy={y - s * .17} r={s * .07} fill="#222" />
    </g>
  );
});

const Tiles = memo(function Tiles({ x, y, s, alive }: { x: number; y: number; s: number; alive: boolean }) {
  const c1 = alive ? '#0ABFBC' : '#c0d4dc';
  const c2 = alive ? '#7DE8E6' : '#d4e4ec';
  const h = s * 0.48;
  const cells: [number, number, string][] = [[-h, -h, c1], [1, -h, c2], [-h, 1, c2], [1, 1, c1]];
  return (
    <g opacity={alive ? 0.85 : 0.28}>
      {cells.map(([dx, dy, tc], i) => (
        <rect key={i} x={x + dx} y={y + dy} width={h - 1} height={h - 1} rx={2} fill={tc} stroke="white" strokeWidth={1} />
      ))}
    </g>
  );
});

type DecoType = 'flower' | 'bubble' | 'sparkle' | 'duck' | 'tiles';
const L: DecoType[] = ['flower', 'bubble', 'sparkle', 'tiles', 'duck', 'flower', 'bubble', 'sparkle'];
const R: DecoType[] = ['bubble', 'sparkle', 'duck', 'flower', 'tiles', 'sparkle', 'flower', 'bubble'];

function Deco({ type, x, y, alive }: { type: DecoType; x: number; y: number; alive: boolean }) {
  if (type === 'flower')  return <Flower  x={x} y={y} r={11} alive={alive} />;
  if (type === 'bubble')  return <Bubble  x={x} y={y} r={10} alive={alive} />;
  if (type === 'sparkle') return <Sparkle x={x} y={y} s={8}  alive={alive} />;
  if (type === 'duck')    return <Duck    x={x} y={y} s={17} alive={alive} />;
  if (type === 'tiles')   return <Tiles   x={x} y={y} s={18} alive={alive} />;
  return null;
}

// --- Road ---

const Road = memo(function Road({ d, done }: { d: string; done: boolean }) {
  if (!d) return null;
  const outer = done ? '#00968C' : '#a8c0cc';
  const inner = done ? '#0ABFBC' : '#ccdde6';
  return (
    <>
      <path d={d} stroke="rgba(0,0,0,0.09)" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={outer} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={inner} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="rgba(255,255,255,0.5)" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 12" />
    </>
  );
});

// --- Main ---

interface Props {
  items: MapItem[];
  completedCount: number;
  walkAnim?: { from: number; to: number } | null;
  onWalkDone?: () => void;
}

export default function DynamicMap({ items, completedCount, walkAnim, onWalkDone }: Props) {
  const n = items.length;
  const svgH = n > 0 ? getPos(n - 1).y + 110 : 300;

  // Refs for direct DOM manipulation during walk animation (avoids re-renders at 60fps)
  const stigRef  = useRef<SVGImageElement>(null);
  const ninaGRef = useRef<SVGGElement>(null);
  const glowRef  = useRef<SVGCircleElement>(null);
  const rafId    = useRef<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!walkAnim || n === 0) return;
    // walkAnim stores completed counts, convert to 0-based node indices
    const from = getPos(Math.min(Math.max(walkAnim.from - 1, 0), n - 1));
    const to   = getPos(Math.min(Math.max(walkAnim.to   - 1, 0), n - 1));
    const duration = 1800;
    const start = performance.now();

    setAnimating(true); // single re-render to show glow

    function ease(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const e = ease(t);
      const cx = from.x + (to.x - from.x) * e;
      const cy = from.y + (to.y - from.y) * e;

      // Direct DOM updates — no React re-render
      stigRef.current?.setAttribute('x', String(cx + 20));
      stigRef.current?.setAttribute('y', String(cy - 75));

      if (ninaGRef.current) {
        ninaGRef.current.setAttribute('transform', `translate(${(cx - 68) * 2 + 48} 0) scale(-1 1)`);
        const img = ninaGRef.current.querySelector('image');
        if (img) { img.setAttribute('x', String(cx - 68)); img.setAttribute('y', String(cy - 70)); }
      }

      if (glowRef.current) {
        glowRef.current.setAttribute('cx', String(cx));
        glowRef.current.setAttribute('cy', String(cy + 18));
      }

      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false); // single re-render to hide glow
        onWalkDone?.();
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [walkAnim]);

  // effectiveCompleted: only used for character rest position so they stand at destination
  // Road and node coloring use actual completedCount to avoid premature teal ahead
  const effectiveCompleted = walkAnim ? Math.max(walkAnim.to, completedCount) : completedCount;

  const activeIdx = n > 0 ? Math.min(Math.max(effectiveCompleted - 1, 0), n - 1) : 0;
  const rest = n > 0 ? getPos(activeIdx) : { x: 170, y: 130 };

  const lastDone  = completedCount - 1;
  const donePath  = lastDone >= 1 && n >= 2 ? makePath(0, Math.min(lastDone, n - 1)) : '';
  const greyStart = Math.max(lastDone, 0);
  const greyPath  = n >= 2 ? makePath(greyStart, n - 1) : '';

  return (
    <svg className="map-svg" viewBox={`0 0 340 ${svgH}`} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#EBF8FF" />
          <stop offset="100%" stopColor="#D4F5E9" />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={340} height={svgH} fill="url(#mapBg)" rx={18} />

      {/* Decorations */}
      {Array.from({ length: Math.max(n - 1, 0) }).map((_, i) => {
        const yMid = 130 + i * 110 + 55;
        const alive = completedCount > i;
        return (
          <g key={i}>
            <Deco type={L[i % L.length]} x={24}  y={yMid} alive={alive} />
            <Deco type={R[i % R.length]} x={316} y={yMid} alive={alive} />
            <Bubble x={44}  y={yMid + (i % 2 === 0 ? -24 : 24)} r={5} alive={alive} />
            <Bubble x={296} y={yMid + (i % 2 === 0 ?  24 : -24)} r={5} alive={alive} />
          </g>
        );
      })}

      {/* Roads */}
      <Road d={greyPath} done={false} />
      <Road d={donePath} done />

      {/* Nodes */}
      {items.map((item, i) => {
        const { x: nx, y: ny } = getPos(i);
        if (item.done) {
          return (
            <g key={item.id}>
              <circle cx={nx} cy={ny} r={26} fill="#0ABFBC" opacity={0.12} />
              <circle cx={nx} cy={ny} r={20} fill="#0ABFBC" opacity={0.18} />
              <circle cx={nx} cy={ny} r={18} fill="#0ABFBC" stroke="white" strokeWidth={3} />
              <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" fontSize={15} fill="white">★</text>
            </g>
          );
        }
        if (i === completedCount) {
          return (
            <g key={item.id}>
              <circle cx={nx} cy={ny} r={26} fill="#FFD93D" opacity={0.2} className="map-pulse" />
              <circle cx={nx} cy={ny} r={19} fill="white" stroke="#FFD93D" strokeWidth={3} />
              <circle cx={nx} cy={ny} r={7}  fill="#FFD93D" />
            </g>
          );
        }
        return (
          <g key={item.id} opacity={0.5}>
            <circle cx={nx} cy={ny} r={16} fill="white" stroke="#b8ccd4" strokeWidth={2} />
          </g>
        );
      })}

      {/* Walk glow (visibility toggled via state, position via ref) */}
      <circle
        ref={glowRef}
        cx={rest.x} cy={rest.y + 18} r={28}
        fill="rgba(255,220,50,0.16)"
        visibility={animating ? 'visible' : 'hidden'}
      />

      {/* Characters (position set via ref during animation) */}
      <g style={{ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.18))' }}>
        <image
          ref={stigRef}
          href={`${import.meta.env.BASE_URL}stig.png`}
          x={rest.x + 20} y={rest.y - 75}
          width={52} height={64}
          className="map-stig"
        />
        <g ref={ninaGRef} transform={`translate(${(rest.x - 68) * 2 + 48} 0) scale(-1 1)`}>
          <image
            href={`${import.meta.env.BASE_URL}nina.png`}
            x={rest.x - 68} y={rest.y - 70}
            width={48} height={60}
            className="map-nina"
          />
        </g>
      </g>
    </svg>
  );
}
