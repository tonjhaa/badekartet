import { useState, useEffect } from 'react';
import './index.css';
import { supabase } from './lib/supabase';
import type { Task, ShopItem, MapItem } from './types';
import MapPage from './components/MapPage';
import TasksPage from './components/TasksPage';

const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  { name: 'Ringe Glenn', assignee: 'Stig', deadline: 'Uke 22', done: true, created_at: 1 },
  { name: 'Handle benkeplate', assignee: 'Begge', deadline: 'Uke 22', done: false, created_at: 2 },
  { name: 'Avtale henting av benkeplate', assignee: 'Begge', deadline: 'Lørdag 30.05', done: false, created_at: 3 },
  { name: 'Ordne og vaske vaskerom', assignee: 'Begge', deadline: 'Uke 23', done: false, created_at: 4 },
  { name: 'Ringe rørlegger Rune', assignee: 'Stig', deadline: 'Uke 23', done: false, created_at: 5 },
  { name: 'Riving av bad', assignee: 'Begge', deadline: '5.–7. juni', done: false, created_at: 6 },
];

const DEFAULT_SHOP: Omit<ShopItem, 'id'>[] = [
  { name: 'Benkeplate', assignee: 'Begge', bought: true, created_at: 7 },
  { name: 'Speil × 2', assignee: 'Nina', bought: false, created_at: 8 },
  { name: 'Dusjkabinett', assignee: 'Stig', bought: false, created_at: 9 },
  { name: 'Do', assignee: 'Begge', bought: false, created_at: 10 },
  { name: 'Spilevegg', assignee: 'Stig', bought: false, created_at: 11 },
  { name: 'Maling', assignee: 'Nina', bought: false, created_at: 12 },
  { name: 'Fugemasse', assignee: 'Stig', bought: false, created_at: 13 },
  { name: 'Lister', assignee: 'Begge', bought: false, created_at: 14 },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

async function loadTasks() {
  const { data } = await supabase.from('tasks').select('*').order('created_at');
  return (data ?? []) as Task[];
}

async function loadShop() {
  const { data } = await supabase.from('shop_items').select('*').order('created_at');
  return (data ?? []) as ShopItem[];
}

export default function App() {
  const [page, setPage] = useState<'map' | 'tasks'>('map');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [ready, setReady] = useState(false);

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

  // Combined map items
  const allItems: MapItem[] = [
    ...tasks.map(t => ({ id: t.id, name: t.name, done: t.done, kind: 'task' as const, created_at: t.created_at })),
    ...shopItems.map(s => ({ id: s.id, name: s.name, done: s.bought, kind: 'shop' as const, created_at: s.created_at })),
  ].sort((a, b) => a.created_at - b.created_at);

  const completedCount = allItems.filter(i => i.done).length;

  // Task CRUD
  async function handleTaskSave(id: string | null, data: Omit<Task, 'id' | 'done' | 'created_at'>) {
    if (id) {
      await supabase.from('tasks').update(data).eq('id', id);
    } else {
      await supabase.from('tasks').insert({ id: uid(), done: false, created_at: Date.now(), ...data });
    }
  }
  async function handleTaskDelete(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
  }
  async function handleTaskToggle(id: string) {
    const t = tasks.find(t => t.id === id);
    if (t) await supabase.from('tasks').update({ done: !t.done }).eq('id', id);
  }

  // Shop CRUD
  async function handleShopSave(id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'created_at'>) {
    if (id) {
      await supabase.from('shop_items').update(data).eq('id', id);
    } else {
      await supabase.from('shop_items').insert({ id: uid(), bought: false, created_at: Date.now(), ...data });
    }
  }
  async function handleShopDelete(id: string) {
    await supabase.from('shop_items').delete().eq('id', id);
  }
  async function handleShopToggle(id: string) {
    const s = shopItems.find(s => s.id === id);
    if (s) await supabase.from('shop_items').update({ bought: !s.bought }).eq('id', id);
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

      <div className="wrap">
        <div className="game-header">
          <img className="header-bg" src="/header.png" alt="Badekartet" />
          <div className="header-chars">
            <div className="hc">
              <div className="hc-figure">
                <img className="hc-img nina-img" src="/nina.png" alt="Nina" />
              </div>
            </div>
            <div className="hc">
              <div className="hc-figure">
                <img className="hc-img" src="/stig.png" alt="Stig" />
              </div>
            </div>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-btn${page === 'map' ? ' active' : ''}`} onClick={() => setPage('map')}>Kartet</button>
          <button className={`nav-btn${page === 'tasks' ? ' active' : ''}`} onClick={() => setPage('tasks')}>Gjøremål</button>
        </nav>

        {page === 'map' && <MapPage items={allItems} completedCount={completedCount} />}
        {page === 'tasks' && (
          <TasksPage
            tasks={tasks}
            shopItems={shopItems}
            onTaskSave={handleTaskSave}
            onTaskDelete={handleTaskDelete}
            onTaskToggle={handleTaskToggle}
            onShopSave={handleShopSave}
            onShopDelete={handleShopDelete}
            onShopToggle={handleShopToggle}
          />
        )}
      </div>
    </>
  );
}
