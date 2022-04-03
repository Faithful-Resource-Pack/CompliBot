export interface User {
  id: string;
  username: string;
  notes: Notes
}

export interface Notes {
  [key: string]: Array<Note>
}

export interface Note {
  from: string;
  note: string;
  timestamp: number;
}