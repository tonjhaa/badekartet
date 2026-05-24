export type Assignee = 'Nina' | 'Stig' | 'Begge';

export interface Task {
  id: string;
  name: string;
  assignee: Assignee;
  deadline: string;
  done: boolean;
  created_at: number;
  sort_order: number;
}

export interface ShopItem {
  id: string;
  name: string;
  assignee: Assignee;
  deadline: string;
  bought: boolean;
  created_at: number;
  sort_order: number;
}

export type MapItem = {
  id: string;
  name: string;
  done: boolean;
  kind: 'task' | 'shop';
  created_at: number;
};
