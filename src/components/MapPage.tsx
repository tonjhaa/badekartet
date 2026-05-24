import { useState } from 'react';
import {
  DndContext, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DynamicMap from './DynamicMap';
import ItemModal from './ItemModal';
import AnePisken from './AnePisken';
import type { MapItem, Task, ShopItem } from '../types';
import { isOverdue } from '../utils/deadline';


const LEVEL_TITLES = [
  'Planleggingspirater', 'Byggherrer på gli', 'Halvveis-helter',
  'Fliskrigerne', 'Nesten i mål!', 'Badekamper vunnet!',
];

function levelTitle(pct: number) {
  if (pct >= 100) return LEVEL_TITLES[5];
  if (pct >= 80) return LEVEL_TITLES[4];
  if (pct >= 60) return LEVEL_TITLES[3];
  if (pct >= 40) return LEVEL_TITLES[2];
  if (pct >= 20) return LEVEL_TITLES[1];
  return LEVEL_TITLES[0];
}

function formatDeadline(deadline: string): string {
  if (!deadline) return '';
  if (/^Uke\s*\d+$/i.test(deadline)) return deadline;
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const d = new Date(deadline + 'T12:00:00');
    return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  }
  return deadline;
}

function calcNewSortOrder(items: { sort_order: number }[], fromIdx: number, toIdx: number): number {
  const reordered = [...items];
  const [moved] = reordered.splice(fromIdx, 1);
  reordered.splice(toIdx, 0, moved);
  const before = reordered[toIdx - 1]?.sort_order ?? (reordered[toIdx + 1]?.sort_order ?? 0) - 2000;
  const after = reordered[toIdx + 1]?.sort_order ?? (reordered[toIdx - 1]?.sort_order ?? 0) + 2000;
  return (before + after) / 2;
}

type Modal =
  | { kind: 'task'; item: Task | null }
  | { kind: 'shop'; item: ShopItem | null }
  | null;

interface Props {
  items: MapItem[];
  completedCount: number;
  tasks: Task[];
  shopItems: ShopItem[];
  lastProgressTime: number;
  lastReversalTime: number;
  jubilantUntil: number;
  piskenTrigger: { msg: string } | null;
  onTaskToggle: (id: string) => void;
  onTaskSave: (id: string | null, data: Omit<Task, 'id' | 'done' | 'created_at' | 'sort_order'>) => void;
  onTaskDelete: (id: string) => void;
  onTaskReorder: (id: string, newOrder: number) => void;
  onShopToggle: (id: string) => void;
  onShopSave: (id: string | null, data: Omit<ShopItem, 'id' | 'bought' | 'created_at' | 'sort_order'>) => void;
  onShopDelete: (id: string) => void;
  onShopReorder: (id: string, newOrder: number) => void;
  walkAnim?: { from: number; to: number } | null;
  onWalkDone?: () => void;
  onCelebrate?: () => void;
}

function SortableQtRow({ id, done, name, deadline, overdue, onToggle, onEdit }: {
  id: string; done: boolean; name: string; deadline?: string; overdue?: boolean;
  onToggle: () => void; onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`quick-task-row${done ? ' done' : ''}${overdue ? ' overdue' : ''}`}>
      <span className="qt-drag-handle" {...attributes} {...listeners}>
        <i className="fa-solid fa-grip-lines" />
      </span>
      <div className={`qt-circle${done ? ' checked' : ''}${overdue ? ' overdue' : ''}`} onClick={onToggle}>
        {done
          ? <i className="fa-solid fa-check" style={{ fontSize: 12 }} />
          : overdue
            ? <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 11 }} />
            : <i className="fa-solid fa-check" style={{ fontSize: 12, opacity: 0 }} />}
      </div>
      <div className="qt-info" onClick={onToggle}>
        <span className={`qt-name${done ? ' done' : ''}${overdue ? ' overdue' : ''}`}>{name}</span>
        {deadline && <span className={`qt-meta${overdue ? ' overdue' : ''}`}>{formatDeadline(deadline)}</span>}
      </div>
      <button className="qt-edit-btn" onClick={onEdit} title="Endre">
        <i className="fa-solid fa-pen" />
      </button>
    </div>
  );
}

export default function MapPage({
  items, completedCount, tasks, shopItems, lastProgressTime, lastReversalTime, jubilantUntil, piskenTrigger, onCelebrate,
  onTaskToggle, onTaskSave, onTaskDelete, onTaskReorder,
  onShopToggle, onShopSave, onShopDelete, onShopReorder,
  walkAnim, onWalkDone,
}: Props) {
  const [modal, setModal] = useState<Modal>(null);

  const total = items.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const remaining = total - completedCount;

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);
  const pendingShop = shopItems.filter(s => !s.bought);
  const doneShop = shopItems.filter(s => s.bought);

  const overdueTasks = new Set(pendingTasks.filter(t => isOverdue(t.deadline)).map(t => t.id));
  const overdueShop = new Set(pendingShop.filter(s => isOverdue(s.deadline ?? '')).map(s => s.id));
  const hasOverdueItems = overdueTasks.size > 0 || overdueShop.size > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleTaskDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = pendingTasks.findIndex(t => t.id === active.id);
    const toIdx = pendingTasks.findIndex(t => t.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    onTaskReorder(active.id as string, calcNewSortOrder(pendingTasks, fromIdx, toIdx));
  }

  function handleShopDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = pendingShop.findIndex(s => s.id === active.id);
    const toIdx = pendingShop.findIndex(s => s.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    onShopReorder(active.id as string, calcNewSortOrder(pendingShop, fromIdx, toIdx));
  }

  return (
    <>
      <div className="level-card">
        <div className="level-card-inner">
          <div className="level-progress-area">
            <div className="level-header-label">🛁 Fremgang mot ferdig bad</div>
            <div className="level-top">
              <div className="level-name">{levelTitle(pct)}</div>
              <div className="level-pill">{pct}% · {completedCount} av {total} steg</div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.max(pct, 2)}%` }}>
                <div className="progress-star">
                  <i className="fa-solid fa-star" style={{ fontSize: 11 }} />
                </div>
              </div>
            </div>
            <div className="steps-left">
              {remaining > 0
                ? `${remaining} veipunkt gjenstår til ferdig bad`
                : '🎉 Ferdig! Drømmebad levert!'}
            </div>
          </div>
          <AnePisken
            lastProgressTime={lastProgressTime}
            lastReversalTime={lastReversalTime}
            jubilantUntil={jubilantUntil}
            completedCount={completedCount}
            pendingTasks={pendingTasks}
            pendingShop={pendingShop}
            forcedMessage={piskenTrigger}
            hasOverdueItems={hasOverdueItems}
          />
        </div>
      </div>

      <div className="map-layout">
        <div className="map-wrap">
          <DynamicMap items={items} completedCount={completedCount} walkAnim={walkAnim} onWalkDone={onWalkDone} onCelebrate={onCelebrate} />
        </div>

        <div className="quick-tasks">
          {/* Tasks */}
          <div className="qs-section-header">
            <span className="quick-tasks-title">Gjøremål</span>
            <div className="qs-header-right">
              <span className="quick-tasks-count">{pendingTasks.length} igjen</span>
              <button className="qs-add-btn" onClick={() => setModal({ kind: 'task', item: null })} title="Ny oppgave">
                <i className="fa-solid fa-plus" />
              </button>
            </div>
          </div>
          <div className="quick-tasks-list">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
              <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {pendingTasks.map(t => (
                  <SortableQtRow
                    key={t.id} id={t.id} done={false}
                    name={t.name} deadline={t.deadline}
                    overdue={overdueTasks.has(t.id)}
                    onToggle={() => onTaskToggle(t.id)}
                    onEdit={() => setModal({ kind: 'task', item: t })}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {doneTasks.map(t => (
              <SortableQtRow
                key={t.id} id={t.id} done
                name={t.name}
                onToggle={() => onTaskToggle(t.id)}
                onEdit={() => setModal({ kind: 'task', item: t })}
              />
            ))}
            {tasks.length === 0 && <div className="qs-empty">Ingen gjøremål</div>}
          </div>

          <div className="qs-divider" />

          {/* Shop */}
          <div className="qs-section-header">
            <span className="quick-tasks-title">Handleliste</span>
            <button className="qs-add-btn" onClick={() => setModal({ kind: 'shop', item: null })} title="Ny vare">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
          <div className="quick-tasks-list">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleShopDragEnd}>
              <SortableContext items={pendingShop.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {pendingShop.map(s => (
                  <SortableQtRow
                    key={s.id} id={s.id} done={false}
                    name={s.name} deadline={s.deadline}
                    overdue={overdueShop.has(s.id)}
                    onToggle={() => onShopToggle(s.id)}
                    onEdit={() => setModal({ kind: 'shop', item: s })}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {doneShop.map(s => (
              <SortableQtRow
                key={s.id} id={s.id} done
                name={s.name}
                onToggle={() => onShopToggle(s.id)}
                onEdit={() => setModal({ kind: 'shop', item: s })}
              />
            ))}
            {shopItems.length === 0 && <div className="qs-empty">Ingen varer</div>}
          </div>
        </div>
      </div>

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
