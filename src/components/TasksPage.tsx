import { useState } from 'react';
import type { Task, ShopItem } from '../types';
import ItemModal from './ItemModal';

function formatDeadline(deadline: string): string {
  if (!deadline) return '';
  if (/^Uke\s*\d+$/i.test(deadline)) return deadline;
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const d = new Date(deadline + 'T12:00:00');
    return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  }
  return deadline;
}

type Modal =
  | { kind: 'task'; item: Task | null }
  | { kind: 'shop'; item: ShopItem | null }
  | null;

interface Props {
  tasks: Task[];
  shopItems: ShopItem[];
  onTaskSave: (id: string | null, data: Omit<Task, 'id' | 'done' | 'created_at'>) => void;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (id: string) => void;
  onShopSave: (id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'created_at'>) => void;
  onShopDelete: (id: string) => void;
  onShopToggle: (id: string) => void;
}

export default function TasksPage({ tasks, shopItems, onTaskSave, onTaskDelete, onTaskToggle, onShopSave, onShopDelete, onShopToggle }: Props) {
  const [modal, setModal] = useState<Modal>(null);

  const done = tasks.filter(t => t.done);
  const pending = tasks.filter(t => !t.done);

  return (
    <>
      <div className="page-title">Gjøremål</div>
      <div className="page-subtitle">{pending.length} gjenstår · {done.length} fullført</div>

      {/* Pending tasks */}
      {pending.map(t => (
        <div key={t.id} className="task-card">
          <div className="task-top">
            <div className="task-name">{t.name}</div>
            <span className="status-pill s-pending">Ikke startet</span>
          </div>
          {(t.assignee !== 'Begge' || t.deadline) && (
            <div className="task-meta">
              {t.assignee !== 'Begge' && <span>{t.assignee}</span>}
              {t.assignee === 'Begge' && <span>Nina og Stig</span>}
              {t.deadline && <span>{formatDeadline(t.deadline)}</span>}
            </div>
          )}
          {t.assignee === 'Begge' && !t.deadline && (
            <div className="task-meta"><span>Nina og Stig</span></div>
          )}
          <div className="task-btns">
            <button className="btn-done" onClick={() => onTaskToggle(t.id)}>Merk fullført</button>
            <button className="btn-icon" onClick={() => setModal({ kind: 'task', item: t })} title="Endre">
              <i className="fa-solid fa-pen" />
            </button>
            <button className="btn-icon delete" onClick={() => { if (confirm('Slette oppgaven?')) onTaskDelete(t.id); }} title="Slett">
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      ))}

      {/* Done tasks */}
      {done.map(t => (
        <div key={t.id} className="task-card done">
          <div className="task-top">
            <div className="task-name ferdig">{t.name}</div>
            <span className="status-pill s-done">Fullført</span>
          </div>
          {(t.assignee || t.deadline) && (
            <div className="task-meta">
              <span>{t.assignee === 'Begge' ? 'Nina og Stig' : t.assignee}</span>
              {t.deadline && <span>{formatDeadline(t.deadline)}</span>}
            </div>
          )}
          <div className="task-btns">
            <button className="btn-angre" onClick={() => onTaskToggle(t.id)}>
              <i className="fa-solid fa-rotate-left" /> Angre fullføring
            </button>
            <button className="btn-icon" onClick={() => setModal({ kind: 'task', item: t })} title="Endre">
              <i className="fa-solid fa-pen" />
            </button>
            <button className="btn-icon delete" onClick={() => { if (confirm('Slette oppgaven?')) onTaskDelete(t.id); }} title="Slett">
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: '#5a8fa8', padding: '20px', fontWeight: 600 }}>
          Ingen gjøremål ennå — trykk + for å legge til!
        </div>
      )}

      {/* Shopping list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-title" style={{ margin: '22px 0 11px' }}>Handleliste</div>
        <button className="btn-icon" onClick={() => setModal({ kind: 'shop', item: null })} style={{ marginTop: 10 }} title="Legg til vare">
          <i className="fa-solid fa-plus" />
        </button>
      </div>

      {shopItems.length > 0 && (
        <div className="shop-list">
          {shopItems.map(s => (
            <div key={s.id} className="shop-item">
              <div className={`shop-cb${s.bought ? ' chk' : ''}`} onClick={() => onShopToggle(s.id)}>
                {s.bought && '✓'}
              </div>
              <span className={`shop-name${s.bought ? ' kjopt' : ''}`}>{s.name}</span>
              <span className="shop-assignee">{s.assignee === 'Begge' ? 'Begge' : s.assignee}</span>
              <div className="shop-actions">
                <button className="btn-icon" onClick={() => setModal({ kind: 'shop', item: s })} title="Endre">
                  <i className="fa-solid fa-pen" style={{ fontSize: 10 }} />
                </button>
                <button className="btn-icon delete" onClick={() => { if (confirm('Slette varen?')) onShopDelete(s.id); }} title="Slett">
                  <i className="fa-solid fa-trash" style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shopItems.length === 0 && (
        <div style={{ textAlign: 'center', color: '#5a8fa8', padding: '16px', fontWeight: 600 }}>
          Ingen handlelistevarer ennå
        </div>
      )}

      {/* FAB for new task */}
      <button className="fab" onClick={() => setModal({ kind: 'task', item: null })} title="Nytt gjøremål">+</button>

      {/* Modal */}
      {modal?.kind === 'task' && (
        <ItemModal
          mode={{
            kind: 'task',
            item: modal.item,
            onSave: data => onTaskSave(modal.item?.id ?? null, data),
            onDelete: modal.item ? () => onTaskDelete(modal.item!.id) : undefined,
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'shop' && (
        <ItemModal
          mode={{
            kind: 'shop',
            item: modal.item,
            onSave: data => onShopSave(modal.item?.id ?? null, data),
            onDelete: modal.item ? () => onShopDelete(modal.item!.id) : undefined,
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
