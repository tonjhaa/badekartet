import DynamicMap from './DynamicMap';
import type { MapItem } from '../types';

const LEVEL_TITLES = [
  'Planleggingspirater',
  'Byggherrer på gli',
  'Halvveis-helter',
  'Fliskrigerne',
  'Nesten i mål!',
  'Badekamper vunnet!',
];

function levelTitle(pct: number) {
  if (pct >= 100) return LEVEL_TITLES[5];
  if (pct >= 80) return LEVEL_TITLES[4];
  if (pct >= 60) return LEVEL_TITLES[3];
  if (pct >= 40) return LEVEL_TITLES[2];
  if (pct >= 20) return LEVEL_TITLES[1];
  return LEVEL_TITLES[0];
}

interface Props {
  items: MapItem[];
  completedCount: number;
  walkAnim?: { from: number; to: number } | null;
  onWalkDone?: () => void;
}

export default function MapPage({ items, completedCount, walkAnim, onWalkDone }: Props) {
  const total = items.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const remaining = total - completedCount;

  return (
    <>
      <div className="level-card">
        <div className="level-top">
          <div className="level-name">{levelTitle(pct)}</div>
          <div className="level-pill">{completedCount} av {total}</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${Math.max(pct, 2)}%` }}>
            <div className="progress-star">
              <i className="fa-solid fa-star" style={{ fontSize: 11 }} />
            </div>
          </div>
        </div>
        <div className="steps-left">
          {remaining > 0 ? `${remaining} steg igjen` : 'Ferdig! Nytt bad venter!'}
        </div>
      </div>

      <div className="map-wrap">
        <DynamicMap items={items} completedCount={completedCount} walkAnim={walkAnim} onWalkDone={onWalkDone} />
      </div>
    </>
  );
}
