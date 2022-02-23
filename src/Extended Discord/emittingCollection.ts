import { Collection } from "discord.js";
import EventEmitter from "events";

export class EmittingCollection<K, V> extends Collection<K, V> {
  public events: EventEmitter = new EventEmitter();

  public set(key: K, value: V): this {
    this.events.emit("dataSet", key, value);
    return super.set(key, value);
  }

  public delete(key: K): boolean {
    this.events.emit("dataDeleted", key);
    return super.delete(key);
  }
}