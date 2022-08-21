import { Client } from '@client';

export interface IEvent {
  id: string;
  run: (client: Client, ...args: any[]) => void;
}
