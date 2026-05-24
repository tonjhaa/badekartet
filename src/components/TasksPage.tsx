import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  onTaskSave: (id: string | null, data: Omit<Task, 'id' | 'done' | 'created_at' | 'sort_order'>) => void;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (id: string) => void;
  onTaskReorder: (id: string, newSortOrder: number) => void;
  onShopSave: (id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'created_at' | 'sort_order'>) => void;
  onShopDelete: (id: string) => void;
  onShopToggle: (id: string) => void;
  onShopReorder: (id: string, newSortOrder: number) => void;
}

function SortableTaskCard({ task, onToggle, onEdit, onDelete }: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`task-card${task.done ? ' done' : ''}`}>
      <div className="task-top">
        <span className="drag-handle" {...attributes} {...listeners}>
          <i className="fa-solid fa-grip-lines" />
        </span>
        <div className="task-name">{task.name}</div>
        <span className={`status-pill ${task.done ? 's-done' : 's-pending'}`}>
          {task.done ? 'Fullført' : 'Ikke startet'}
        </span>
      </div>
      <div className="task-meta">
        <span>{task.assignee === 'Begge' ? 'Nina og Stig' : task.assignee}</span>
        {task.deadline && <span>{formatDeadline(task.deadline)}</span>}
      </div>
      <div className="task-btns">
        {task.done ? (
          <button className="btn-angre" onClick={onToggle}>
            <i className="fa-solid fa-rotate-left" /> Angre fullføring
          </button>
        ) : (
          <button className="btn-done" onClick={onToggle}>Merk fullført</button>
        )}
        <button className="btn-icon" onClick={onEdit} title="Endre">
          <i className="fa-solid fa-pen" />
        </button>
        <button className="btn-icon delete" onClick={onDelete} title="Slett">
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
}

function SortableShopRow({ item, onToggle, onEdit, onDelete }: {
  item: ShopItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'rgba(255,255,255,0.9)' : undefined,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="shop-item">
      <span className="drag-handle" {...attributes} {...listeners} style={{ color: '#a0b4c0', fontSize: 13, cursor: 'grab' }}>
        <i className="fa-solid fa-grip-lines" />
      </span>
      <div className={`shop-cb${item.bought ? ' chk' : ''}`} onClick={onToggle}>
        {item.bought && '✓'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className={`shop-name${item.bought ? ' kjopt' : ''}`}>{item.name}</span>
        {item.deadline && (
          <span style={{ display: 'block', fontSize: 10, color: '#5a8fa8', fontWeight: 700, marginTop: 1 }}>
            {formatDeadline(item.deadline)}
          </span>
        )}
      </div>
      <span className="shop-assignee">{item.assignee === 'Begge' ? 'Begge' : item.assignee}</span>
      <div className="shop-actions">
        <button className="btn-icon" onClick={onEdit} title="Endre">
          <i className="fa-solid fa-pen" style={{ fontSize: 10 }} />
        </button>
        <button className="btn-icon delete" onClick={onDelete} title="Slett">
          <i className="fa-solid fa-trash" style={{ fontSize: 10 }} />
        </button>
      </div>
    </div>
  );
}

function newSortOrder(items: { sort_order: number }[], fromIdx: number, toIdx: number): number {
  const reordered = [...items];
  const [moved] = reordered.splice(fromIdx, 1);
  reordered.splice(toIdx, 0, moved);
  const before = reordered[toIdx - 1]?.sort_order ?? (reordered[toIdx + 1]?.sort_order ?? 0) - 2000;
  const after = reordered[toIdx + 1]?.sort_order ?? (reordered[toIdx - 1]?.sort_order ?? 0) + 2000;
  return (before + after) / 2;
}

export default function TasksPage({
  tasks, shopItems,
  onTaskSave, onTaskDelete, onTaskToggle, onTaskReorder,
  onShopSave, onShopDelete, onShopToggle, onShopReorder,
}: Props) {
  const [modal, setModal] = useState<Modal>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  function handleTaskDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = pending.findIndex(t => t.id === active.id);
    const toIdx = pending.findIndex(t => t.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    onTaskReorder(active.id as string, newSortOrder(pending, fromIdx, toIdx));
  }

  function handleShopDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = shopItems.findIndex(s => s.id === active.id);
    const toIdx = shopItems.findIndex(s => s.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    onShopReorder(active.id as string, newSortOrder(shopItems, fromIdx, toIdx));
  }

  return (
    <>
      <div className="page-title">Gjøremål</div>
      <div className="page-subtitle">{pending.length} gjenstår · {done.length} fullført</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
        <SortableContext items={pending.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {pending.map(t => (
            <SortableTaskCard
              key={t.id}
              task={t}
              onToggle={() => onTaskToggle(t.id)}
              onEdit={() => setModal({ kind: 'task', item: t })}
              onDelete={() => { if (confirm('Slette oppgaven?')) onTaskDelete(t.id); }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {done.map(t => (
        <SortableTaskCard
          key={t.id}
          task={t}
          onToggle={() => onTaskToggle(t.id)}
          onEdit={() => setModal({ kind: 'task', item: t })}
          onDelete={() => { if (confirm('Slette oppgaven?')) onTaskDelete(t.id); }}
        />
      ))}

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: '#5a8fa8', padding: '20px', fontWeight: 600 }}>
          Ingen gjøremål ennå — trykk + for å legge til!
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-title" style={{ margin: '22px 0 11px' }}>Handleliste</div>
        <button className="btn-icon" onClick={() => setModal({ kind: 'shop', item: null })} style={{ marginTop: 10 }} title="Legg til vare">
          <i className="fa-solid fa-plus" />
        </button>
      </div>

      {shopItems.length > 0 && (
        <div className="shop-list">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleShopDragEnd}>
            <SortableContext items={shopItems.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {shopItems.map(s => (
                <SortableShopRow
                  key={s.id}
                  item={s}
                  onToggle={() => onShopToggle(s.id)}
                  onEdit={() => setModal({ kind: 'shop', item: s })}
                  onDelete={() => { if (confirm('Slette varen?')) onShopDelete(s.id); }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {shopItems.length === 0 && (
        <div style={{ textAlign: 'center', color: '#5a8fa8', padding: '16px', fontWeight: 600 }}>
          Ingen handlelistevarer ennå
        </div>
      )}

      <button className="fab" onClick={() => setModal({ kind: 'task', item: null })} title="Nytt gjøremål">+</button>

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
