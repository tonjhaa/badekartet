import { createPortal } from 'react-dom';

interface Props {
  onClose: () => void;
}

export default function DiplomaScreen({ onClose }: Props) {
  function print() {
    const src = `${import.meta.env.BASE_URL}diploma.png`;
    const win = window.open('', '_blank');
    if (!win) return;
    const doc = win.document;
    doc.title = 'Diplom – Badekartet';

    const style = doc.createElement('style');
    style.textContent = '* { margin:0;padding:0;box-sizing:border-box; } body { background:white;display:flex;justify-content:center;align-items:center;min-height:100vh; } img { max-width:100%;max-height:100vh;object-fit:contain; } @media print { img { width:100%;height:auto; } }';
    doc.head.appendChild(style);

    const img = doc.createElement('img');
    img.src = src;
    img.alt = 'Diplom';
    img.addEventListener('load', () => win.print());
    doc.body.appendChild(img);
  }

  return createPortal(
    <div className="diploma-overlay" onClick={onClose}>
      <div className="diploma-img-page" onClick={e => e.stopPropagation()}>
        <img
          src={`${import.meta.env.BASE_URL}diploma.png`}
          alt="Offisielt diplom – Stig Sagbakken og Nina Bergum"
          className="diploma-img"
        />
        <div className="diploma-img-btns">
          <button className="diploma-print-btn" onClick={print}>
            🖨️ Skriv ut
          </button>
          <button className="diploma-close" onClick={onClose}>
            Lukk ✕
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
