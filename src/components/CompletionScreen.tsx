import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

interface Props {
  onClose: () => void;
}

const PRAISE_PARAGRAPHS = [
  'Kjære Nina Bergum og Stig Sagbakken —',
  'Dere klarte det. Dere KLARTE DET! Badet er ferdig. Prosjektet er i mål. Og jeg, Ane «Pisken» Bergum, tar av meg hatten — og legger pisken ned. For godt. Nesten.',
  'Ikke bare et nytt bad — dette er et bevis. Et bevis på at Nina Bergum kan gjøre hva som helst hun setter seg fore. Et bevis på at Stig Sagbakken har de rette kontaktene og det rette hodet til å få ting gjort. Et bevis på at et godt lag er fullstendig uslåelig.',
  'Og dere klarte det INNEN 11. JULI! Tenk over det. Akkurat den dagen Nina fyller seksti strålende år. Seksti år med kreativitet, handlekraft, mot og stil. Hva er vel den perfekte gaven til seg selv på 60-årsdagen? Et nytt, skinnende, nydelig bad — skapt med egne hender, kloke valg og de rette telefonsamtalene.',
  'Og mine svigerforeldre ankommer akkurat denne helgen. Hva møter de når de kommer inn døren? Et bad som er ferdig. Et par som leverte. Et hjem som stråler. Det kaller jeg timing av ypperste klasse.',
  'Nina — du har alltid hatt det kreative øyet. Evnen til å se hva et rom kan bli. Men dette prosjektet viste noe enda mer: du er ikke bare kreativ, du er handlekraftig. Du tok valg. Du gikk videre. Du fullførte. Det er sjeldent og dyrebart. Hvert flisvalg, hvert fargevalg, hvert lille detalj bærer ditt fingeravtrykk. Dette badet er deg, Nina Bergum.',
  'Stig — du trenger ikke gjøre alt med egne hender for å være uunnværlig. Du ringer de riktige menneskene. Du koordinerer. Du holder styr på det store bildet. Du er prosjektlederen med det varme hjertet og det skarpe blikket. Liverpool-trenere burde ta notater.',
  'Til dere begge: Dette badet kommer til å gi glede i mange, mange år. Hvert bad om morgenen. Hvert speil du ser deg selv i. Det er NINAs blikk. Det er STIGs nettverk. Det er TEAMETS seier. Og Ane Pisken Bergum er stolt — genuint, uforbeholdent stolt.',
  '🛁 ✨ GRATULERER, NINA OG STIG! ✨ 🛁',
  '🎂 LYKKE TIL MED 60-ÅRSDAGEN, NINA BERGUM — 11. JULI! 🎂',
];

const FLOATERS = ['⭐', '🛁', '✨', '🎉', '🏆', '💪', '🌟', '🎊', '❤️', '🥂', '🎂', '🎈'];

export default function CompletionScreen({ onClose }: Props) {
  useEffect(() => {
    function burst() {
      confetti({
        particleCount: 130,
        spread: 130,
        origin: { y: 0.35 },
        colors: ['#FFD93D', '#FF6B6B', '#0ABFBC', '#90E06A', '#FF9FF3', '#FFFFFF', '#48CAE4'],
      });
      confetti({ particleCount: 70, angle: 60, spread: 90, origin: { x: 0, y: 0.5 }, colors: ['#FFD93D', '#FF6B6B', '#FFFFFF'] });
      confetti({ particleCount: 70, angle: 120, spread: 90, origin: { x: 1, y: 0.5 }, colors: ['#0ABFBC', '#90E06A', '#FF9FF3'] });
    }
    burst();
    const id = setInterval(burst, 3500);
    return () => clearInterval(id);
  }, []);

  return createPortal(
    <div className="completion-overlay" onClick={onClose}>
      <div className="completion-inner" onClick={e => e.stopPropagation()}>

        <div className="completion-floaters" aria-hidden="true">
          {FLOATERS.map((emoji, i) => (
            <span
              key={i}
              className="completion-floater"
              style={{
                left: `${4 + i * 8.2}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3) * 0.7}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="completion-pisken">
          <img
            src={`${import.meta.env.BASE_URL}ane-jubler.png`}
            alt="Pisken jubler!"
            className="completion-pisken-img"
          />
        </div>

        <div className="completion-title">🏆 BADEKARTET ER FULLFØRT! 🏆</div>
        <div className="completion-subtitle">11. JULI · NINA FYLLER 60 · DRØMMEBAD LEVERT</div>

        <div className="completion-praise-wrap">
          <div className="completion-praise">
            {PRAISE_PARAGRAPHS.map((p, i) => (
              <p key={i} className={`cp-para${i === 0 ? ' cp-salutation' : ''}${i === PRAISE_PARAGRAPHS.length - 1 ? ' cp-last' : ''}${i === PRAISE_PARAGRAPHS.length - 2 ? ' cp-finale' : ''}`}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <button className="completion-close" onClick={onClose}>
          Lukk feiringen 🎉
        </button>
      </div>
    </div>,
    document.body
  );
}
