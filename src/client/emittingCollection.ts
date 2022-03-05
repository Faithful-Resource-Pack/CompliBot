import { Collection } from "discord.js";
import EventEmitter from "events";

/**
 * ! important note, the event should be emitted after everything
 */

export class EmittingCollection<K, V> extends Collection<K, V> {
	public events: EventEmitter = new EventEmitter();

	public set(key: K, value: V): this {
		super.set(key, value);
		this.events.emit("dataSet", key, value);
		return this;
	}

	public delete(key: K): boolean {
		let r: boolean = super.delete(key);
		this.events.emit("dataDeleted", key);
		return r;
	}
}
