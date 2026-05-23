import { useState, useEffect } from 'react';
import type { Task, ShopItem, Assignee } from '../types';

type ModalMode =
  | { kind: 'task'; item: Task | null; onSave: (t: Omit<Task, 'id' | 'done' | 'created_at'>) => void; onDelete?: () => void }
  | { kind: 'shop'; item: ShopItem | null; onSave: (s: Omit<ShopItem, 'id' | 'bought' | 'created_at'>) => void; onDelete?: () => void };

interface Props {
  mode: ModalMode;
  onClose: () => void;
}

type DeadlineMode = 'date' | 'week';

function parseDeadline(deadline: string): { mode: DeadlineMode; date: string; week: string } {
  const weekMatch = deadline.match(/^Uke\s*(\d+)$/i);
  if (weekMatch) return { mode: 'week', date: '', week: weekMatch[1] };
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { mode: 'date', date: deadline, week: '' };
  return { mode: 'date', date: '', week: '' };
}

export default function ItemModal({ mode, onClose }: Props) {
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState<Assignee>('Begge');
  const [deadlineMode, setDeadlineMode] = useState<DeadlineMode>('date');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineWeek, setDeadlineWeek] = useState('');

  useEffect(() => {
    if (mode.kind === 'task' && mode.item) {
      setName(mode.item.name);
      setAssignee(mode.item.assignee);
      const parsed = parseDeadline(mode.item.deadline);
      setDeadlineMode(parsed.mode);
      setDeadlineDate(parsed.date);
      setDeadlineWeek(parsed.week);
    } else if (mode.kind === 'shop' && mode.item) {
      setName(mode.item.name);
      setAssignee(mode.item.assignee);
    } else {
      setName(''); setAssignee('Begge');
      setDeadlineMode('date'); setDeadlineDate(''); setDeadlineWeek('');
    }
  }, []);

  function getDeadlineValue(): string {
    if (deadlineMode === 'week') return deadlineWeek ? `Uke ${deadlineWeek}` : '';
    return deadlineDate;
  }

  const isEdit = !!mode.item;
  const title = mode.kind === 'task'
    ? (isEdit ? 'Endre gjøremål' : 'Nytt gjøremål')
    : (isEdit ? 'Endre handlelistevare' : 'Ny handlelistevare');

  function save() {
    if (!name.trim()) return;
    if (mode.kind === 'task') {
      mode.onSave({ name: name.trim(), assignee, deadline: getDeadlineValue() });
    } else {
      mode.onSave({ name: name.trim(), assignee });
    }
    onClose();
  }

  function del() {
    if (mode.onDelete && confirm('Er du sikker på at du vil slette?')) {
      mode.onDelete();
      onClose();
    }
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>

        <div className="field">
          <label>{mode.kind === 'task' ? 'Oppgave' : 'Vare'}</label>
          <input
            type="text"
            placeholder={mode.kind === 'task' ? 'Hva skal gjøres?' : 'Hva skal kjøpes?'}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
        </div>

        <div className="field">
          <label>Ansvarlig</label>
          <select value={assignee} onChange={e => setAssignee(e.target.value as Assignee)}>
            <option value="Begge">Begge</option>
            <option value="Nina">Nina</option>
            <option value="Stig">Stig</option>
          </select>
        </div>

        {mode.kind === 'task' && (
          <div className="field">
            <label>Frist</label>
            <div className="deadline-toggle">
              <button
                type="button"
                className={`dl-tab${deadlineMode === 'date' ? ' active' : ''}`}
                onClick={() => setDeadlineMode('date')}
              >Dato</button>
              <button
                type="button"
                className={`dl-tab${deadlineMode === 'week' ? ' active' : ''}`}
                onClick={() => setDeadlineMode('week')}
              >Uke</button>
            </div>
            {deadlineMode === 'date' ? (
              <input
                type="date"
                value={deadlineDate}
                onChange={e => setDeadlineDate(e.target.value)}
                style={{ marginTop: 6 }}
              />
            ) : (
              <div className="week-input-wrap" style={{ marginTop: 6 }}>
                <span className="week-prefix">Uke</span>
                <input
                  type="number"
                  min={1}
                  max={53}
                  placeholder="25"
                  value={deadlineWeek}
                  onChange={e => setDeadlineWeek(e.target.value)}
                  className="week-input"
                />
              </div>
            )}
          </div>
        )}

        <div className="modal-btns">
          {isEdit && mode.onDelete && (
            <button className="modal-delete" onClick={del}>Slett</button>
          )}
          <button className="modal-cancel" onClick={onClose}>Avbryt</button>
          <button className="modal-save" onClick={save}>
            {isEdit ? 'Lagre' : 'Legg til'}
          </button>
        </div>
      </div>
    </div>
  );
}
