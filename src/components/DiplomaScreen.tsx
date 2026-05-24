import { createPortal } from 'react-dom';

interface Props {
  onClose: () => void;
}

function Seal({ label }: { label: string }) {
  const r = 54;
  const cx = 60; const cy = 60;
  const teeth = 36;
  const innerR = 42; const outerR = 54; const toothH = 7;
  const pts = Array.from({ length: teeth * 2 }, (_, i) => {
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? outerR : outerR - toothH;
    return `${cx + Math.cos(angle) * rad},${cy + Math.sin(angle) * rad}`;
  }).join(' ');

  const arc = (startDeg: number, endDeg: number, radius: number) => {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + Math.cos(s) * radius; const y1 = cy + Math.sin(s) * radius;
    const x2 = cx + Math.cos(e) * radius; const y2 = cy + Math.sin(e) * radius;
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="0 0 120 120" style={{ width: 110, height: 110, filter: 'drop-shadow(0 2px 6px rgba(160,100,0,0.4))' }}>
      <defs>
        <radialGradient id="sealGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#F5D060" />
          <stop offset="60%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#9B7A0A" />
        </radialGradient>
        <radialGradient id="sealInner" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#EDD060" />
          <stop offset="100%" stopColor="#B8920F" />
        </radialGradient>
        <path id="topArc" d={arc(200, 340, 33)} />
        <path id="botArc" d={arc(10, 170, 33)} />
      </defs>

      {/* Outer serrated ring */}
      <polygon points={pts} fill="url(#sealGrad)" />

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="url(#sealInner)" />
      <circle cx={cx} cy={cy} r={innerR - 6} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />

      {/* Star */}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={20} fill="white" style={{ fontFamily: 'serif' }}>★</text>

      {/* Curved text top */}
      <text fontSize={7.5} fill="white" fontWeight="600" letterSpacing="0.12em" style={{ fontFamily: 'Cinzel, serif' }}>
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">BADEKARTET</textPath>
      </text>

      {/* Curved text bottom */}
      <text fontSize={7} fill="white" fontWeight="600" letterSpacing="0.08em" style={{ fontFamily: 'Cinzel, serif' }}>
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
    </svg>
  );
}

function Corner({ flip }: { flip?: boolean }) {
  const s = flip ? 'scaleX(-1)' : undefined;
  return (
    <svg viewBox="0 0 60 60" style={{ width: 60, height: 60, transform: s, display: 'block' }}>
      <path d="M4,4 L4,28 Q4,4 28,4 Z" fill="#C9A227" opacity="0.7" />
      <path d="M8,8 L8,24 Q8,8 24,8 Z" fill="none" stroke="#C9A227" strokeWidth="1.5" opacity="0.5" />
      <circle cx="4" cy="4" r="3" fill="#C9A227" opacity="0.8" />
      <circle cx="22" cy="4" r="1.5" fill="#C9A227" opacity="0.5" />
      <circle cx="4" cy="22" r="1.5" fill="#C9A227" opacity="0.5" />
      <path d="M12,4 Q18,10 24,4" fill="none" stroke="#C9A227" strokeWidth="1.2" opacity="0.5" />
      <path d="M4,12 Q10,18 4,24" fill="none" stroke="#C9A227" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function Diploma({ name, role, text, img, isNina }: {
  name: string;
  role: string;
  text: string;
  img: string;
  isNina: boolean;
}) {
  return (
    <div className="diploma">
      <div className="diploma-corner tl"><Corner /></div>
      <div className="diploma-corner tr"><Corner flip /></div>
      <div className="diploma-corner bl" style={{ transform: 'rotate(90deg)' }}><Corner /></div>
      <div className="diploma-corner br" style={{ transform: 'rotate(180deg)' }}><Corner /></div>

      <div className="diploma-inner">
        <div className="diploma-header-label">DIPLOM</div>
        <div className="diploma-divider" />

        <div className="diploma-sub">Dette diplom tildeles herved</div>

        <div className="diploma-portrait-wrap">
          <div className="diploma-portrait-ring">
            <img
              src={`${import.meta.env.BASE_URL}${img}`}
              alt={name}
              className={`diploma-portrait-img${isNina ? ' nina' : ''}`}
            />
          </div>
        </div>

        <div className="diploma-name">{name}</div>

        <div className="diploma-role">{role}</div>

        <div className="diploma-divider thin" />

        <p className="diploma-text">{text}</p>

        <div className="diploma-divider thin" />

        <div className="diploma-footer">
          <div className="diploma-seal-wrap">
            <Seal label={isNina ? 'NINA · 2025' : 'STIG · 2025'} />
            <div className="diploma-seal-caption">Offisielt stempel</div>
          </div>
          <div className="diploma-sig-block">
            <div className="diploma-sig-line">Ane «Pisken» Bergum Sagbakken</div>
            <div className="diploma-sig-title">Prosjektleder & Motivasjonsleder</div>
            <div className="diploma-sig-date">Badekartet, 11. juli 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiplomaScreen({ onClose }: Props) {
  return createPortal(
    <div className="diploma-overlay" onClick={onClose}>
      <div className="diploma-page" onClick={e => e.stopPropagation()}>
        <div className="diploma-page-title">🏅 Offisielle Diplomer 🏅</div>
        <div className="diploma-pair">
          <Diploma
            name="Nina Bergum"
            role="For kreativt lederskap og utsøkt stilsans"
            text="Nina Bergum utmerket seg med et kreativt øye uten sidestykke, en intuitiv forståelse for rom og materialvalg, og en besluttsomhet som tok prosjektet fra idé til virkelighet. Hennes estetiske blikk og handlekraft er herved offisielt anerkjent av høyeste instans."
            img="nina.png"
            isNina
          />
          <Diploma
            name="Stig Sagbakken"
            role="For eksepsjonell prosjektledelse og koordinering"
            text="Stig Sagbakken demonstrerte enestående evne til å koordinere fagfolk, ringe de rette menneskene til rett tid og holde prosjektet på skinner med stødig hånd. Hans nettverk, tålmodighet og lederskap er herved offisielt anerkjent av høyeste instans."
            img="stig.png"
            isNina={false}
          />
        </div>
        <button className="diploma-close" onClick={onClose}>Lukk ✕</button>
      </div>
    </div>,
    document.body
  );
}
