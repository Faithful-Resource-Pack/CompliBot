import { Collection } from "discord.js";
import EventEmitter from "events";

export class EmittingCollection<K, V> extends Collection<K, V> {
  public events: EventEmitter = new EventEmitter();

  constructor() { super(); }

  public set(key: K, value: V): this {
    super.set(key, value);
    this.events.emit("dataSet", key, value);
    return this;
  }
}