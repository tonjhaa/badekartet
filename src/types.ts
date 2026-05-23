export type Assignee = 'Nina' | 'Stig' | 'Begge';

export interface Task {
  id: string;
  name: string;
  assignee: Assignee;
  deadline: string;
  done: boolean;
  created_at: number;
}

export interface ShopItem {
  id: string;
  name: string;
  assignee: Assignee;
  bought: boolean;
  created_at: number;
}

export type MapItem = {
  id: string;
  name: string;
  done: boolean;
  kind: 'task' | 'shop';
  created_at: number;
};
