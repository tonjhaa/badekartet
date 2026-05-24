import { useState, useCallback } from 'react';
import type { Task, ShopItem } from '../types';

type Mood = 'jubler' | 'fornoyd' | 'noytral' | 'irritert' | 'rasende';

function getMood(lastProgressTime: number): Mood {
  if (!lastProgressTime) return 'rasende';
  const hours = (Date.now() - lastProgressTime) / (1000 * 60 * 60);
  if (hours < 1)   return 'jubler';
  if (hours < 24)  return 'fornoyd';
  if (hours < 72)  return 'noytral';
  if (hours < 144) return 'irritert';
  return 'rasende';
}

const MESSAGES: Record<Mood, string[]> = {
  jubler: [
    'JA! DET ER DETTE JEG SNAKKER OM! 🎉🎉🎉',
    'Nå RULLER det! Jeg er så stolt! ⭐',
    'Fantastisk! Dere er mine absolutte favoritter akkurat nå! 🏆',
    'DETTE! Akkurat dette! Mer av dette! 🚀',
  ],
  fornoyd: [
    'Bra jobbet! Jeg er faktisk fornøyd. Fortsett!',
    'Nå snakker vi! Ikke stopp nå! 💪',
    'Jeg er imponert. Sjokkert, men imponert. ⭐',
    'Dette er AKKURAT det jeg forventet. Mer, mer, mer!',
  ],
  noytral: [
    'Greit nok. Men nå har det gått en stund siden sist…',
    'Jeg ser dere. Husk at bad ikke bygger seg selv.',
    'Fremgang er bra. Stillstand er ikke akseptert.',
    'Okei, okei. Men pisken henger fortsatt på veggen.',
  ],
  irritert: [
    'Hva driver dere med?! Gjøremålene hoper seg opp!',
    'Jeg begynner å bli utålmodig. Det burde dere ikke ønske.',
    'Er vi på pause? Fordi jeg IKKE godkjente noen pause.',
    'Tick tock. Badet bygger seg ikke av seg selv!',
  ],
  rasende: [
    'DET ER NOK! Jeg tar frem pisken for alvor nå! 😤',
    'Ingen har jobbet med badet på EVIGHETER. Skjerp dere!',
    'Jeg er RASENDE. Hent en kost og begynn å jobbe, begge to!',
    'Dette er uakseptabelt. Pisken er ikke til pynt!!! 🔥',
  ],
};

function getContextMessage(mood: Mood, pendingTasks: Task[], pendingShop: ShopItem[]): string {
  const base = MESSAGES[mood][Math.floor(Math.random() * MESSAGES[mood].length)];
  if (mood === 'jubler' || mood === 'fornoyd') return base;

  if (mood === 'irritert' || mood === 'rasende') {
    if (pendingTasks.length > 0) {
      const t = pendingTasks[Math.floor(Math.random() * Math.min(pendingTasks.length, 3))];
      return `${base} «${t.name}» er ikke gjort!`;
    }
    if (pendingShop.length > 0) {
      const s = pendingShop[Math.floor(Math.random() * Math.min(pendingShop.length, 3))];
      return `${base} «${s.name}» er fortsatt ikke kjøpt!`;
    }
  }
  return base;
}

const MOOD_IMG: Record<Mood, string> = {
  jubler:   'ane-jubler.png',
  fornoyd:  'ane-fornoyd.png',
  noytral:  'ane-noytral.png',
  irritert: 'ane-irritert.png',
  rasende:  'ane-rasende.png',
};

const MOOD_FALLBACK: Record<Mood, string> = {
  jubler:   '🥳',
  fornoyd:  '😄',
  noytral:  '😐',
  irritert: '😠',
  rasende:  '🤬',
};

interface Props {
  lastProgressTime: number;
  pendingTasks: Task[];
  pendingShop: ShopItem[];
}

export default function AnePisken({ lastProgressTime, pendingTasks, pendingShop }: Props) {
  const [bubble, setBubble] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState(false);
  const mood = getMood(lastProgressTime);

  const handleClick = useCallback(() => {
    if (bubble) { setBubble(null); return; }
    setBubble(getContextMessage(mood, pendingTasks, pendingShop));
  }, [bubble, mood, pendingTasks, pendingShop]);

  return (
    <div className="ane-wrap" onClick={handleClick} title="Klikk for beskjed fra Pisken">
      {bubble && (
        <div className="ane-bubble">
          <div className="ane-bubble-text">{bubble}</div>
          <div className="ane-bubble-tail" />
        </div>
      )}
      <div className={`ane-figure ane-${mood}`}>
        {!imgErr ? (
          <img
            key={mood}
            src={`${import.meta.env.BASE_URL}${MOOD_IMG[mood]}`}
            alt={`Ane - ${mood}`}
            className="ane-img"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="ane-fallback">{MOOD_FALLBACK[mood]}</div>
        )}
      </div>
      <div className="ane-name">Pisken</div>
    </div>
  );
}
