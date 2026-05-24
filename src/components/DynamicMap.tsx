import { useRef, useEffect, useState, memo } from 'react';
import type { MapItem } from '../types';

function getPos(i: number) {
  return { x: i % 2 === 0 ? 72 : 268, y: 80 + i * 110 };
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

const NODE_PRAISES = [
  'Godt jobbet! ⭐',
  'En brikke på plass! 🏆',
  'Fremover! 🚀',
  'Knallbra! 💪',
  'Strålende! ✨',
  'Stig og Nina leverer! 🎉',
  'Et steg nærmere nytt bad! 🛁',
  'Pisken er fornøyd! 😄',
];

function nodePraise(idx: number) {
  return NODE_PRAISES[idx % NODE_PRAISES.length];
}

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

  const stigRef    = useRef<SVGImageElement>(null);
  const ninaGRef   = useRef<SVGGElement>(null);
  const glowRef    = useRef<SVGCircleElement>(null);
  const animSegRef = useRef<SVGGElement>(null);
  const segLenRef  = useRef(0);
  const rafId      = useRef<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const isReverse = walkAnim ? walkAnim.to < walkAnim.from : false;

  useEffect(() => {
    if (!walkAnim || n === 0) return;
    const fromIdx = Math.min(Math.max(walkAnim.from, 0), n - 1);
    const toIdx   = Math.min(Math.max(walkAnim.to,   0), n - 1);
    const p0 = getPos(fromIdx);
    const p3 = getPos(toIdx);
    const my = (p0.y + p3.y) / 2;
    const p1 = { x: p0.x, y: my };
    const p2 = { x: p3.x, y: my };

    const duration = 1800;
    const start = performance.now();

    setAnimating(true);

    const segs = animSegRef.current
      ? Array.from(animSegRef.current.querySelectorAll('path')).slice(0, 3) as SVGPathElement[]
      : [];
    const len = segs[0]?.getTotalLength() ?? 0;
    segLenRef.current = len;
    // Reverse: start fully drawn (offset=0), animate to hidden (offset=len)
    // Forward: start hidden (offset=len), animate to fully drawn (offset=0)
    segs.forEach(p => {
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = isReverse ? '0' : String(len);
    });

    function ease(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const e = ease(t);
      // Characters always travel p0→p3 (fromIdx→toIdx); reverseness only affects road dashoffset
      const be = e;
      const mt = 1 - be;
      const cx = mt*mt*mt*p0.x + 3*mt*mt*be*p1.x + 3*mt*be*be*p2.x + be*be*be*p3.x;
      const cy = mt*mt*mt*p0.y + 3*mt*mt*be*p1.y + 3*mt*be*be*p2.y + be*be*be*p3.y;

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

      if (len > 0) {
        // Forward: dashoffset shrinks (len→0); Reverse: dashoffset grows (0→len)
        const offset = isReverse ? String(len * e) : String(len * (1 - e));
        segs.forEach(p => { p.style.strokeDashoffset = offset; });
      }

      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
        onWalkDone?.();
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [walkAnim]);

  // Rest position: characters start from walkAnim.from (no optimistic jump)
  // After animation ends walkAnim is null and completedCount reflects the updated value
  const restIdx = walkAnim
    ? Math.min(Math.max(walkAnim.from, 0), n - 1)
    : Math.min(completedCount, n - 1);
  const rest = n > 0 ? getPos(Math.max(restIdx, 0)) : getPos(0);

  // Teal road frozen at the lower endpoint; animated segment covers the gap between endpoints
  const displayCount = walkAnim != null ? Math.min(walkAnim.from, walkAnim.to) : completedCount;
  const donePath  = displayCount >= 1 && n >= 2 ? makePath(0, Math.min(displayCount, n - 1)) : '';
  const greyPath  = n >= 2 ? makePath(Math.min(displayCount, n - 1), n - 1) : '';
  // Animated segment: always from the lower index to the higher index
  const segFrom = walkAnim ? Math.min(walkAnim.from, walkAnim.to) : 0;
  const segTo   = walkAnim ? Math.max(walkAnim.from, walkAnim.to) : 0;
  const newSegPath = walkAnim && segFrom < n - 1
    ? makePath(segFrom, Math.min(segTo, n - 1))
    : '';

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

      {/* Animated segment — forward: starts hidden, reveals; reverse: starts visible, hides */}
      {walkAnim && newSegPath && (
        <g ref={animSegRef}>
          <path d={newSegPath} stroke="rgba(0,0,0,0.09)" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={newSegPath} stroke="#00968C" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={newSegPath} stroke="#0ABFBC" strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* Nodes */}
      {items.map((item, i) => {
        const { x: nx, y: ny } = getPos(i);
        const isCurrent = walkAnim == null && i === Math.min(completedCount, n - 1);
        if (isCurrent) {
          return (
            <g key={item.id}>
              <circle cx={nx} cy={ny} r={26} fill="#FFD93D" opacity={0.2} className="map-pulse" />
              <circle cx={nx} cy={ny} r={19} fill="white" stroke="#FFD93D" strokeWidth={3} />
              <circle cx={nx} cy={ny} r={7}  fill="#FFD93D" />
            </g>
          );
        }
        if (item.done) {
          const isHovered = hoveredNode === i;
          return (
            <g
              key={item.id}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setHoveredNode(isHovered ? null : i)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={nx} cy={ny} r={26} fill="#0ABFBC" opacity={0.12} />
              <circle cx={nx} cy={ny} r={20} fill="#0ABFBC" opacity={0.18} />
              <circle cx={nx} cy={ny} r={18} fill="#0ABFBC" stroke="white" strokeWidth={3} />
              <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" fontSize={15} fill="white">★</text>

              {isHovered && (
                <g>
                  {/* Tooltip bubble */}
                  <rect
                    x={nx - 72} y={ny - 64}
                    width={144} height={50}
                    rx={10} ry={10}
                    fill="white"
                    stroke="#0ABFBC"
                    strokeWidth={1.5}
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.14))"
                  />
                  {/* Callout arrow */}
                  <polygon
                    points={`${nx - 7},${ny - 14} ${nx + 7},${ny - 14} ${nx},${ny - 4}`}
                    fill="white"
                    stroke="#0ABFBC"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                  {/* Cover the arrow's top stroke line so it blends into rect */}
                  <line x1={nx - 6} y1={ny - 14} x2={nx + 6} y2={ny - 14} stroke="white" strokeWidth={2} />
                  <text
                    x={nx} y={ny - 44}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontWeight="700"
                    fill="#1A3A5C"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                  >
                    {item.name.length > 20 ? item.name.slice(0, 19) + '…' : item.name}
                  </text>
                  <text
                    x={nx} y={ny - 26}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#0ABFBC"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                  >
                    {nodePraise(i)}
                  </text>
                </g>
              )}
            </g>
          );
        }
        return (
          <g key={item.id} opacity={0.5}>
            <circle cx={nx} cy={ny} r={16} fill="white" stroke="#b8ccd4" strokeWidth={2} />
          </g>
        );
      })}

      {/* Walk glow */}
      <circle
        ref={glowRef}
        cx={rest.x} cy={rest.y + 18} r={28}
        fill="rgba(255,220,50,0.16)"
        visibility={animating ? 'visible' : 'hidden'}
      />

      {/* Characters */}
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
