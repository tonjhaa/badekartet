import { useState } from 'react';
import './index.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Task, ShopItem, MapItem } from './types';
import MapPage from './components/MapPage';
import TasksPage from './components/TasksPage';

const DEFAULT_TASKS: Task[] = [
  { id: '1', name: 'Ringe Glenn', assignee: 'Stig', deadline: 'Uke 22', done: true, createdAt: 1 },
  { id: '2', name: 'Handle benkeplate', assignee: 'Begge', deadline: 'Uke 22', done: false, createdAt: 2 },
  { id: '3', name: 'Avtale henting av benkeplate', assignee: 'Begge', deadline: 'Lørdag 30.05', done: false, createdAt: 3 },
  { id: '4', name: 'Ordne og vaske vaskerom', assignee: 'Begge', deadline: 'Uke 23', done: false, createdAt: 4 },
  { id: '5', name: 'Ringe rørlegger Rune', assignee: 'Stig', deadline: 'Uke 23', done: false, createdAt: 5 },
  { id: '6', name: 'Riving av bad', assignee: 'Begge', deadline: '5.–7. juni', done: false, createdAt: 6 },
];

const DEFAULT_SHOP: ShopItem[] = [
  { id: 's1', name: 'Benkeplate', assignee: 'Begge', bought: true, createdAt: 7 },
  { id: 's2', name: 'Speil × 2', assignee: 'Nina', bought: false, createdAt: 8 },
  { id: 's3', name: 'Dusjkabinett', assignee: 'Stig', bought: false, createdAt: 9 },
  { id: 's4', name: 'Do', assignee: 'Begge', bought: false, createdAt: 10 },
  { id: 's5', name: 'Spilevegg', assignee: 'Stig', bought: false, createdAt: 11 },
  { id: 's6', name: 'Maling', assignee: 'Nina', bought: false, createdAt: 12 },
  { id: 's7', name: 'Fugemasse', assignee: 'Stig', bought: false, createdAt: 13 },
  { id: 's8', name: 'Lister', assignee: 'Begge', bought: false, createdAt: 14 },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function App() {
  const [page, setPage] = useState<'map' | 'tasks'>('map');
  const [tasks, setTasks] = useLocalStorage<Task[]>('bdk-tasks', DEFAULT_TASKS);
  const [shopItems, setShopItems] = useLocalStorage<ShopItem[]>('bdk-shop', DEFAULT_SHOP);

  // Combined map items ordered by createdAt
  const allItems: MapItem[] = [
    ...tasks.map(t => ({ id: t.id, name: t.name, done: t.done, kind: 'task' as const, createdAt: t.createdAt })),
    ...shopItems.map(s => ({ id: s.id, name: s.name, done: s.bought, kind: 'shop' as const, createdAt: s.createdAt })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  const completedCount = allItems.filter(i => i.done).length;

  // Task CRUD
  function handleTaskSave(id: string | null, data: Omit<Task, 'id' | 'done' | 'createdAt'>) {
    if (id) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    } else {
      setTasks(prev => [...prev, { id: uid(), done: false, createdAt: Date.now(), ...data }]);
    }
  }
  function handleTaskDelete(id: string) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function handleTaskToggle(id: string) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)); }

  // Shop CRUD
  function handleShopSave(id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'createdAt'>) {
    if (id) {
      setShopItems(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    } else {
      setShopItems(prev => [...prev, { id: uid(), bought: false, createdAt: Date.now(), ...data }]);
    }
  }
  function handleShopDelete(id: string) { setShopItems(prev => prev.filter(s => s.id !== id)); }
  function handleShopToggle(id: string) { setShopItems(prev => prev.map(s => s.id === id ? { ...s, bought: !s.bought } : s)); }

  return (
    <>
      <div className="sky-bg" />
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
      <div className="sun" /><div className="grass" />

      <div className="wrap">
        {/* Header */}
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

        {/* Nav */}
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
