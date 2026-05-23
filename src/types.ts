export type Assignee = 'Nina' | 'Stig' | 'Begge';

export interface Task {
  id: string;
  name: string;
  assignee: Assignee;
  deadline: string;
  done: boolean;
  createdAt: number;
}

export interface ShopItem {
  id: string;
  name: string;
  assignee: Assignee;
  bought: boolean;
  createdAt: number;
}

export type MapItem = {
  id: string;
  name: string;
  done: boolean;
  kind: 'task' | 'shop';
};
