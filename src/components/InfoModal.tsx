import { createPortal } from 'react-dom';

interface Props {
  onClose: () => void;
}

export default function InfoModal({ onClose }: Props) {
  return createPortal(
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose}>✕</button>

        <div className="info-logo">🛁</div>
        <h2 className="info-title">Hva er Badekartet?</h2>
        <p className="info-desc">
          Et spillifisert veikart som hjelper <strong>Nina Bergum</strong> og <strong>Stig Sagbakken</strong> med å
          fullføre sitt drømmebad — steg for steg, frem mot <strong>11. juli 2025</strong> 🎂
        </p>

        <div className="info-chars">
          <div className="info-char">
            <span className="info-char-emoji">👩‍🎨</span>
            <div>
              <div className="info-char-name">Nina Bergum</div>
              <div className="info-char-role">Det kreative øyet — velger fliser, farger og stil</div>
            </div>
          </div>
          <div className="info-char">
            <span className="info-char-emoji">📞</span>
            <div>
              <div className="info-char-name">Stig Sagbakken</div>
              <div className="info-char-role">Nettverksbyggeren — ringer de rette menneskene</div>
            </div>
          </div>
          <div className="info-char">
            <span className="info-char-emoji">🎓</span>
            <div>
              <div className="info-char-name">Ane «Pisken» Bergum Sagbakken</div>
              <div className="info-char-role">Prosjektsjef og motivator — klikk på henne for en beskjed!</div>
            </div>
          </div>
        </div>

        <div className="info-how">
          <div className="info-how-title">Slik bruker du det</div>
          <ul className="info-how-list">
            <li>✅ Hak av gjøremål og handleliste-punkter i høyre kolonne</li>
            <li>🗺️ Se fremgangen på veikartet — hvert fullført veipunkt lyser teal</li>
            <li>💬 Hover over grønne veipunkt for å se hva som ble fullført</li>
            <li>⚠️ Røde punkter og advarselregn betyr at en frist er passert</li>
            <li>🏆 Fullfør alle steg og Pisken skryter av dere!</li>
          </ul>
        </div>

        <div className="info-goal">
          🎂 Mål: Ferdig bad til <strong>11. juli</strong> — Nina fyller 60!
        </div>
      </div>
    </div>,
    document.body
  );
}
