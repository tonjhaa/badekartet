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
    'Nå RULLER det! Jeg er så stolt jeg nesten gråter! ⭐',
    'Fantastisk! Dere er mine absolutte favoritter akkurat nå! 🏆',
    'DETTE! Akkurat dette! Mer av dette! 🚀',
    'Stig! Du er nesten like imponerende som Liverpool i en god periode! NESTEN.',
    'Jeg jubler nesten like mye som Stig når Liverpool scorer! Nesten. 🎊',
    'WOW. Gråter av glede. Som Stig, men av de gode grunnene! 😭🎉',
    'Ingen stopper dere nå! Ikke engang Stig med fjernkontrollen! 📺',
    'Jeg er så stolt at jeg nesten glemmer pisken! NESTEN.',
    'Nina! Det er AKKURAT slik du gjør det! Start, ta valg, se resultater! Strålende! 🌟',
    'Stig er kanskje ikke mest handy, men han er flink på alt det andre. OG han hjalp til her! 💪',
  ],
  fornoyd: [
    'Bra jobbet! Jeg er faktisk fornøyd. Fortsett!',
    'Nå snakker vi! Ikke stopp nå! 💪',
    'Jeg er imponert. Sjokkert, men imponert. ⭐',
    'Fornøyd prosjektleder er farlig prosjektleder. Ikke bli for komfortabel.',
    'Nina gjør jobben sin. Stig, du henger faktisk med. Godkjent — denne gangen.',
    'Bra! Men pisken er fortsatt innen rekkevidde, bare så det er sagt.',
    'Jeg gir dere én tommel opp. Den andre er klar til å peke på neste gjøremål.',
    'Godt jobbet! Badet kommer seg. I motsetning til Liverpools Champions League-drømmer.',
    'Nina — dette blir BRA. Du vet det. Jeg vet det. Bare fortsett å ta valg! ✅',
    'Stig trenger ikke å kunne alt selv. Han er best på å organisere folk som KAN. Gjør det!',
    'Dere er på rett vei. Akkurat som Liverpool er på vei… et sted.',
  ],
  noytral: [
    'Greit nok. Men nå har det gått en stund siden sist…',
    'Jeg ser dere. Husk at bad ikke bygger seg selv.',
    'Fremgang er bra. Stillstand er ikke akseptert.',
    'Okei, okei. Men pisken henger fortsatt på veggen.',
    'Har noen sett Stig? Anfield er stengt til neste kamp, ingen unnskyldning.',
    'Liverpool vant kanskje ikke i helgen, men det er ingen grunn til å sørge HER.',
    'Dere gjør det greit. Som et midttabellag. Vi sikter høyere.',
    'Pisken er rolig. Pisken er tålmodig. Pisken har en grense.',
    'Husk: jeg tar bilder av listen. Og jeg glemmer ingenting. 📸',
    'Nina — det finnes ikke en feil beslutning her. Det finnes bare utsettelse. Ta valget!',
    'Stig, du trenger ikke fikse det selv! Ring noen! Det er LOV å be om hjelp!',
    'Tips til Stig: YouTube-tutorial + kaffe + ydmykhet = overraskende handy.',
  ],
  irritert: [
    'Hva driver dere med?! Gjøremålene hoper seg opp!',
    'Jeg begynner å bli utålmodig. Det burde dere ikke ønske.',
    'Er vi på pause? Fordi jeg IKKE godkjente noen pause.',
    'Tick tock. Badet bygger seg ikke av seg selv!',
    'Stig! Liverpools sesong er over! Da er det tid for å JOBBE!',
    'Jeg er like irritert som Stig etter et Liverpool-tap. Og det er VELDIG irritert. 😤',
    'Nina! Utsettelse er ikke en plan. Start med én ting. ÉN TING!',
    'Pisken er ikke til pynt. Den er til folk som ikke gjør jobben sin.',
    'Jeg ser på gjøremålslisten og jeg LIKER IKKE det jeg ser.',
    'You\'ll Never Walk Alone — men dere gjør heller ingenting. Jobb!',
    'Klopp forlot Liverpool. Ikke gi meg grunn til å forlate dette prosjektet.',
    'Stig! Du trenger ikke gjøre det selv! Ring noen! Nå! Rørlegger Rune svarer!',
    'Nina, du VET at dette blir bra. Men det krever at dere faktisk GJØR noe!',
  ],
  rasende: [
    'DET ER NOK! Jeg tar frem pisken for alvor nå! 😤',
    'Ingen har jobbet med badet på EVIGHETER. Skjerp dere!',
    'Jeg er RASENDE. Hent en kost og begynn å jobbe, begge to!',
    'Dette er uakseptabelt. Pisken er ikke til pynt!!! 🔥',
    'Stig! Liverpool vinner ikke trofeer ved å SE på banen! JOBB DA!',
    'You\'ll Never Build Alone — men dere prøver ikke engang! 😡',
    'Jeg ringer rørlegger Rune og forteller ham at dere ikke er klare. SE HVA SOM SKJER.',
    'Jeg er så rasende at selv Klopp hadde forlatt prosjektet. OG DET GJORDE HAN ALLEREDE!',
    'Dette badet er som Liverpool uten Champions League — ingen fremgang på evigheter.',
    'JEG HAR FÅTT NOK. Pisken er fremme, motivasjonstalen er over. JOBB NÅ! 🔥🔥🔥',
    'Stig! Anfield gråter. Badet gråter. Jeg gråter — av raseri!',
    'Dere er i ferd med å bli det verste prosjektet jeg har ledet. Og jeg har ledet mange.',
    'Stig, du er flink på SÅ mye. Men ikke dette. RING NOEN. I DAG. IKKE I MORGEN.',
    'Nina! Det er ikke farlig å ta feil valg. Det er farlig å ta INGEN valg. BESTEM DEG!',
    'Jeg er ikke sur, jeg er skuffet. Jo da, jeg er sur også. BEGGE DELER. 😡🔥',
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
