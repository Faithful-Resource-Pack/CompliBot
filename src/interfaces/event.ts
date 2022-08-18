import { Client } from '@client';

export interface IEvent {
  name: string;
  run: (client: Client, ...args: any[]) => void;
}
