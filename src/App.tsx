import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './index.css';
import { supabase } from './lib/supabase';
import type { Task, ShopItem, MapItem, Assignee } from './types';
import MapPage from './components/MapPage';
import CompletionScreen from './components/CompletionScreen';
import DiplomaScreen from './components/DiplomaScreen';
import OverdueRain from './components/OverdueRain';
import InfoModal from './components/InfoModal';
import { isOverdue } from './utils/deadline';

const PROGRESS_PRAISE = [
  'Dere er ustoppelige! 🚀',
  'Badekartet nærmer seg! 🛁',
  'Kjempejobb begge to! ⭐',
  'Fremover på veikartet! 🎉',
  'Supert samarbeid! 💪',
  'Strålende innsats! ✨',
  'Ja! Det skjer nå! 🏆',
];

const CREATION_MESSAGES = [
  'NY OPPGAVE! Planlegging er FREMGANG! Godt tenkt! 🎉',
  'JA! Dere ser hva som trengs! Det er lederskapsinstinkt! ⭐',
  'Nina! Det kreative øyet ditt ser alt som må gjøres. Det er en SUPEREVNE! 🌟',
  'Å FINNE oppgaven er halve jobben. Dere er allerede halvveis! 💪',
  'Ny oppgave funnet! Dere ser badet for seg — nå gjør vi det til virkelighet! 🚀',
  'Nina — du er kreativ OG strukturert. Det er sjeldenhet! Badet er i gode hender! ✨',
  'Nina vet nøyaktig hva som skal til. Det kreative blikket ditt er gull verdt! 🎨',
  'Planleggere er vinnere. Dere planlegger. Ergo: vinnere! 🏆',
  'En ny oppgave på lista = ett steg nærmere drømmebad! 🛁',
  'Stig og Nina planlegger som proffene! Jeg er imponert — og det skjer ikke ofte.',
  'Nina — det kreative + det praktiske. Du har begge deler! Stol på det! 💡',
  'Å se hva som mangler er en kunst. Nina er kunstner. Bevist nok en gang! 🎨',
  'Stig, du trenger ikke gjøre alt selv — men dere VET hva som trengs! Bra!',
  'Hvert gjøremål dere finner er bevis på at dette prosjektet er i gode hender! 🙌',
];

const PRAISE_BEGGE = [
  'Supert samarbeid! 🎉',
  'Teamwork makes the dream work! ✨',
  'Heia begge to! 🌟',
  'Et steg nærmere nytt bad! 🛁',
  'Knallbra! 💪',
];
const PRAISE_PERSON = (name: string) => [
  `Heia ${name}! 🌟`,
  `${name} er best! ⭐`,
  `Supert, ${name}! 🎉`,
  `Knallbra, ${name}! 💪`,
  `${name} leverer! 🏆`,
  `Imponerende, ${name}! ✨`,
];
function randomPraise(assignee: Assignee): string {
  const pool = assignee === 'Begge' ? PRAISE_BEGGE : PRAISE_PERSON(assignee);
  return pool[Math.floor(Math.random() * pool.length)];
}

const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  { name: 'Ringe Glenn', assignee: 'Stig', deadline: 'Uke 22', done: true, created_at: 1, sort_order: 1 },
  { name: 'Handle benkeplate', assignee: 'Begge', deadline: 'Uke 22', done: false, created_at: 2, sort_order: 2 },
  { name: 'Avtale henting av benkeplate', assignee: 'Begge', deadline: 'Lørdag 30.05', done: false, created_at: 3, sort_order: 3 },
  { name: 'Ordne og vaske vaskerom', assignee: 'Begge', deadline: 'Uke 23', done: false, created_at: 4, sort_order: 4 },
  { name: 'Ringe rørlegger Rune', assignee: 'Stig', deadline: 'Uke 23', done: false, created_at: 5, sort_order: 5 },
  { name: 'Riving av bad', assignee: 'Begge', deadline: '5.–7. juni', done: false, created_at: 6, sort_order: 6 },
];

const DEFAULT_SHOP: Omit<ShopItem, 'id'>[] = [
  { name: 'Benkeplate', assignee: 'Begge', deadline: '', bought: true, created_at: 7, sort_order: 7 },
  { name: 'Speil × 2', assignee: 'Nina', deadline: '', bought: false, created_at: 8, sort_order: 8 },
  { name: 'Dusjkabinett', assignee: 'Stig', deadline: '', bought: false, created_at: 9, sort_order: 9 },
  { name: 'Do', assignee: 'Begge', deadline: '', bought: false, created_at: 10, sort_order: 10 },
  { name: 'Spilevegg', assignee: 'Stig', deadline: '', bought: false, created_at: 11, sort_order: 11 },
  { name: 'Maling', assignee: 'Nina', deadline: '', bought: false, created_at: 12, sort_order: 12 },
  { name: 'Fugemasse', assignee: 'Stig', deadline: '', bought: false, created_at: 13, sort_order: 13 },
  { name: 'Lister', assignee: 'Begge', deadline: '', bought: false, created_at: 14, sort_order: 14 },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

async function loadTasks() {
  const { data } = await supabase.from('tasks').select('*').order('sort_order');
  return (data ?? []) as Task[];
}

async function loadShop() {
  const { data } = await supabase.from('shop_items').select('*').order('sort_order');
  return (data ?? []) as ShopItem[];
}

const PROGRESS_TS_KEY = 'badekartet_last_progress';
const REVERSAL_TS_KEY = 'badekartet_last_reversal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [walkAnim, setWalkAnim] = useState<{ from: number; to: number } | null>(null);
  const [lastProgressTime, setLastProgressTime] = useState<number>(
    () => Number(localStorage.getItem(PROGRESS_TS_KEY) ?? 0)
  );
  const [lastReversalTime, setLastReversalTime] = useState<number>(
    () => Number(localStorage.getItem(REVERSAL_TS_KEY) ?? 0)
  );
  const [piskenTrigger, setPiskenTrigger] = useState<{ msg: string } | null>(null);
  const [showCompletion, setShowCompletion] = useState(
    () => new URLSearchParams(window.location.search).has('celebrate')
  );
  const forceOverdue = new URLSearchParams(window.location.search).has('overdue');
  const [showDiploma, setShowDiploma] = useState(
    () => new URLSearchParams(window.location.search).has('diplom')
  );
  const [showInfo, setShowInfo] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function playFanfare() {
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const durations = [0.12, 0.12, 0.12, 0.32];
      let t = ctx.currentTime + 0.04;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
        osc.start(t); osc.stop(t + durations[i]);
        t += durations[i] * 0.85;
      });
      setTimeout(() => ctx.close(), 2000);
    } catch {}
  }

  function playVictoryMusic() {
    try {
      const ctx = new AudioContext();
      const base = ctx.currentTime + 0.05;

      function n(freq: number, t: number, dur: number, vol = 0.18, type: OscillatorType = 'triangle') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
        osc.start(t); osc.stop(t + dur);
      }

      const C3=130.81, G3=196, F3=174.61, C4=261.63, G4=392, F4=349.23;
      const C5=523.25, D5=587.33, E5=659.25, F5=698.46, G5=783.99, A5=880, B5=987.77, C6=1046.5;

      let t = base;
      // Fanfare
      n(C5,t,0.25,0.28); n(E5,t+0.22,0.25,0.28); n(G5,t+0.44,0.25,0.28); n(C6,t+0.66,1.0,0.32);
      n(C3,t,0.6,0.12,'sine'); n(G3,t+0.6,0.4,0.12,'sine'); n(C4,t+1.0,0.6,0.12,'sine');
      t += 1.7;

      // Melody A
      const mA: [number,number,number][] = [
        [C5,0,.3],[E5,.3,.3],[G5,.6,.3],[C6,.9,.65],
        [A5,1.6,.3],[G5,1.9,.3],[E5,2.2,.65],
      ];
      // Melody B
      const mB: [number,number,number][] = [
        [C5,0,.25],[D5,.25,.25],[E5,.5,.25],[F5,.75,.25],
        [G5,1.0,.5],[A5,1.5,.25],[C6,1.75,.8],
      ];
      // Bass A
      const bA: [number,number,number][] = [
        [C4,0,.8],[G3,.9,.7],[F4,1.6,.65],[C4,2.2,.7],
      ];
      // Bass B
      const bB: [number,number,number][] = [
        [G3,0,.8],[C4,.8,.5],[F3,1.3,.5],[G4,1.8,.95],
      ];

      mA.forEach(([f,dt,d]) => n(f,t+dt,d,0.20));
      bA.forEach(([f,dt,d]) => n(f,t+dt,d,0.11,'sine'));
      t += 2.9;
      mB.forEach(([f,dt,d]) => n(f,t+dt,d,0.20));
      bB.forEach(([f,dt,d]) => n(f,t+dt,d,0.11,'sine'));
      t += 2.7;

      // Repeat with harmony
      mA.forEach(([f,dt,d]) => { n(f,t+dt,d,0.18); if(f>500) n(f*0.749,t+dt,d,0.09); });
      bA.forEach(([f,dt,d]) => n(f,t+dt,d,0.12,'sine'));
      t += 2.9;
      mB.forEach(([f,dt,d]) => { n(f,t+dt,d,0.18); if(f>500) n(f*0.749,t+dt,d,0.09); });
      bB.forEach(([f,dt,d]) => n(f,t+dt,d,0.12,'sine'));
      t += 2.7;

      // Running scales
      const scaleUp = [C5,D5,E5,F5,G5,A5,B5,C6];
      scaleUp.forEach((f,i) => n(f,t+i*0.12,0.14,0.18));
      t += 1.05;
      [...scaleUp].reverse().forEach((f,i) => n(f,t+i*0.12,0.14,0.18));
      t += 1.05;
      scaleUp.forEach((f,i) => n(f,t+i*0.10,0.12,0.20));
      t += 0.9;

      // Grand finale chords
      [C5,E5,G5,C6,C3].forEach(f => n(f,t,0.5,0.20));      t += 0.55;
      [F5,A5,C6,F4].forEach(f => n(f,t,0.5,0.20));          t += 0.55;
      [G5,B5,D5,G4].forEach(f => n(f,t,0.5,0.20));          t += 0.55;
      [C5,E5,G5].forEach((f,i) => n(f,t-0.35+i*0.12,0.12,0.15));
      [C5,E5,G5,C6,C4,C3].forEach(f => n(f,t,3.2,0.24));

      setTimeout(() => ctx.close(), 24000);
    } catch {}
  }

  function recordProgress() {
    const now = Date.now();
    localStorage.setItem(PROGRESS_TS_KEY, String(now));
    setLastProgressTime(now);
  }

  function recordReversal() {
    const now = Date.now();
    localStorage.setItem(REVERSAL_TS_KEY, String(now));
    setLastReversalTime(now);
  }

  function celebrateProgress() {
    confetti({ particleCount: 160, spread: 110, origin: { y: 0.5 }, colors: ['#0ABFBC', '#FFD93D', '#FF6B6B', '#90E06A', '#48CAE4'] });
    confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: ['#FFD93D', '#FF6B6B'] });
    confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: ['#0ABFBC', '#90E06A'] });
    const msg = PROGRESS_PRAISE[Math.floor(Math.random() * PROGRESS_PRAISE.length)];
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function handleWalkDone() {
    setWalkAnim(null);
    celebrateProgress();
  }

  function celebrate(assignee: Assignee) {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#0ABFBC', '#FFD93D', '#FF6B6B', '#90E06A', '#48CAE4'],
    });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(randomPraise(assignee));
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    async function init() {
      const [t, s] = await Promise.all([loadTasks(), loadShop()]);

      // Seed defaults if DB is empty
      if (t.length === 0 && s.length === 0) {
        const taskRows = DEFAULT_TASKS.map(d => ({ id: uid(), ...d }));
        const shopRows = DEFAULT_SHOP.map(d => ({ id: uid(), ...d }));
        await Promise.all([
          supabase.from('tasks').insert(taskRows),
          supabase.from('shop_items').insert(shopRows),
        ]);
        setTasks(taskRows);
        setShopItems(shopRows);
      } else {
        setTasks(t);
        setShopItems(s);
      }
      setReady(true);
    }
    init();

    // Real-time subscriptions
    const ch = supabase
      .channel('badekartet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks().then(setTasks);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_items' }, () => {
        loadShop().then(setShopItems);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  // Combined map items — sorted by sort_order
  const allItems: MapItem[] = [
    ...tasks.map(t => ({ id: t.id, name: t.name, done: t.done, kind: 'task' as const, created_at: t.created_at })),
    ...shopItems.map(s => ({ id: s.id, name: s.name, done: s.bought, kind: 'shop' as const, created_at: s.created_at })),
  ].sort((a, b) => a.created_at - b.created_at);

  const completedCount = allItems.filter(i => i.done).length;
  const hasOverdueItems = allItems.some(item => {
    if (item.done) return false;
    const src = item.kind === 'task'
      ? tasks.find(t => t.id === item.id)?.deadline ?? ''
      : shopItems.find(s => s.id === item.id)?.deadline ?? '';
    return isOverdue(src);
  });

  // Task CRUD
  function triggerCreationMessage() {
    const msg = CREATION_MESSAGES[Math.floor(Math.random() * CREATION_MESSAGES.length)];
    setPiskenTrigger({ msg });
  }

  async function handleTaskSave(id: string | null, data: Omit<Task, 'id' | 'done' | 'created_at' | 'sort_order'>) {
    if (id) {
      await supabase.from('tasks').update(data).eq('id', id);
    } else {
      const now = Date.now();
      await supabase.from('tasks').insert({ id: uid(), done: false, created_at: now, sort_order: now, ...data });
      triggerCreationMessage();
    }
  }
  async function handleTaskDelete(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
  }
  async function handleTaskToggle(id: string) {
    const t = tasks.find(t => t.id === id);
    if (t) {
      const nowDone = !t.done;
      const isLast = nowDone && completedCount + 1 === allItems.length;
      if (nowDone) {
        if (isLast) playVictoryMusic();
        else playFanfare();
      }
      await supabase.from('tasks').update({ done: nowDone }).eq('id', id);
      if (nowDone) {
        celebrate(t.assignee);
        recordProgress();
        if (!walkAnim) setWalkAnim({ from: completedCount, to: completedCount + 1 });
        if (isLast) setTimeout(() => setShowCompletion(true), 3200);
      } else {
        recordReversal();
        if (!walkAnim && completedCount > 0) setWalkAnim({ from: completedCount, to: completedCount - 1 });
      }
    }
  }
  async function handleTaskReorder(id: string, newOrder: number) {
    await supabase.from('tasks').update({ sort_order: newOrder }).eq('id', id);
  }

  // Shop CRUD
  async function handleShopSave(id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'created_at' | 'sort_order'>) {
    if (id) {
      await supabase.from('shop_items').update(data).eq('id', id);
    } else {
      const now = Date.now();
      await supabase.from('shop_items').insert({ id: uid(), bought: false, created_at: now, sort_order: now, ...data });
      triggerCreationMessage();
    }
  }
  async function handleShopDelete(id: string) {
    await supabase.from('shop_items').delete().eq('id', id);
  }
  async function handleShopToggle(id: string) {
    const s = shopItems.find(s => s.id === id);
    if (s) {
      const nowBought = !s.bought;
      const isLast = nowBought && completedCount + 1 === allItems.length;
      if (nowBought) {
        if (isLast) playVictoryMusic();
        else playFanfare();
      }
      await supabase.from('shop_items').update({ bought: nowBought }).eq('id', id);
      if (nowBought) {
        celebrate(s.assignee);
        recordProgress();
        if (!walkAnim) setWalkAnim({ from: completedCount, to: completedCount + 1 });
        if (isLast) setTimeout(() => setShowCompletion(true), 3200);
      } else {
        recordReversal();
        if (!walkAnim && completedCount > 0) setWalkAnim({ from: completedCount, to: completedCount - 1 });
      }
    }
  }
  async function handleShopReorder(id: string, newOrder: number) {
    await supabase.from('shop_items').update({ sort_order: newOrder }).eq('id', id);
  }

  if (!ready) return (
    <>
      <div className="sky-bg" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Baloo 2', cursive", fontSize: 22, color: '#1A3A5C', fontWeight: 800 }}>
        Laster Badekartet...
      </div>
    </>
  );

  return (
    <>
      <div className="sky-bg" />
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
      <div className="sun" /><div className="grass" />
      {(hasOverdueItems || forceOverdue) && <OverdueRain />}
      {showCompletion && <CompletionScreen onClose={() => setShowCompletion(false)} onDiplom={() => { setShowCompletion(false); setShowDiploma(true); }} />}
      {showDiploma && <DiplomaScreen onClose={() => setShowDiploma(false)} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {toast && (
        <div className="praise-toast" key={toast + Date.now()}>
          {toast}
        </div>
      )}

      <button className="info-btn" onClick={() => setShowInfo(true)} title="Om Badekartet">ℹ</button>

      <div className="wrap">
        <div className="game-header">
          <div className="header-img-clip">
            <img className="header-bg" src={`${import.meta.env.BASE_URL}header.png`} alt="Badekartet" />
          </div>
          <div className="header-chars">
            <div className="hc">
              <div className="hc-figure">
                <img className="hc-img nina-img" src={`${import.meta.env.BASE_URL}nina.png`} alt="Nina" />
              </div>
            </div>
            <div className="hc">
              <div className="hc-figure">
                <img className="hc-img" src={`${import.meta.env.BASE_URL}stig.png`} alt="Stig" />
              </div>
            </div>
          </div>
        </div>

        <MapPage
          items={allItems}
          completedCount={completedCount}
          tasks={tasks}
          shopItems={shopItems}
          lastProgressTime={lastProgressTime}
          lastReversalTime={lastReversalTime}
          piskenTrigger={piskenTrigger}
          onTaskToggle={handleTaskToggle}
          onTaskSave={handleTaskSave}
          onTaskDelete={handleTaskDelete}
          onShopToggle={handleShopToggle}
          onShopSave={handleShopSave}
          onShopDelete={handleShopDelete}
          onTaskReorder={handleTaskReorder}
          onShopReorder={handleShopReorder}
          walkAnim={walkAnim}
          onWalkDone={handleWalkDone}
        />
      </div>
    </>
  );
}
