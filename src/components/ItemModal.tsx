import { useState, useEffect } from 'react';
import type { Task, ShopItem, Assignee } from '../types';

type ModalMode =
  | { kind: 'task'; item: Task | null; onSave: (t: Omit<Task, 'id' | 'done' | 'created_at'>) => void; onDelete?: () => void }
  | { kind: 'shop'; item: ShopItem | null; onSave: (s: Omit<ShopItem, 'id' | 'bought' | 'created_at'>) => void; onDelete?: () => void };

interface Props {
  mode: ModalMode;
  onClose: () => void;
}

export default function ItemModal({ mode, onClose }: Props) {
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState<Assignee>('Begge');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (mode.kind === 'task' && mode.item) {
      setName(mode.item.name);
      setAssignee(mode.item.assignee);
      setDeadline(mode.item.deadline);
    } else if (mode.kind === 'shop' && mode.item) {
      setName(mode.item.name);
      setAssignee(mode.item.assignee);
    } else {
      setName(''); setAssignee('Begge'); setDeadline('');
    }
  }, []);

  const isEdit = mode.kind === 'task' ? !!mode.item : !!mode.item;
  const title = mode.kind === 'task'
    ? (isEdit ? 'Endre gjøremål' : 'Nytt gjøremål')
    : (isEdit ? 'Endre handlelistevare' : 'Ny handlelistevare');

  function save() {
    if (!name.trim()) return;
    if (mode.kind === 'task') {
      mode.onSave({ name: name.trim(), assignee, deadline });
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
            <input
              type="text"
              placeholder="f.eks. Uke 23 eller 5. juni"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
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
