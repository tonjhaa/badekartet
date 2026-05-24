import { createPortal } from 'react-dom';

const SYMBOLS = ['⚠️', '🚨', '🔴', '⚠️', '🔥'];

export default function OverdueRain() {
  const drops = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    symbol: SYMBOLS[i % SYMBOLS.length],
    left: `${2 + (i * 6.1) % 94}%`,
    delay: `${(i * 0.43) % 4}s`,
    duration: `${2.6 + (i * 0.31) % 2}s`,
    size: `${17 + (i * 5) % 19}px`,
  }));

  return createPortal(
    <div className="overdue-rain" aria-hidden="true">
      {drops.map(d => (
        <span
          key={d.id}
          className="overdue-drop"
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
            fontSize: d.size,
          }}
        >
          {d.symbol}
        </span>
      ))}
    </div>,
    document.body
  );
}
