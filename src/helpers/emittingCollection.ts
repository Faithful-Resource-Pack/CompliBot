import { Collection } from "discord.js";
import EventEmitter from "events";

/**
 * Extends a regular collection to emit an event on set and delete (used for saving collections to static JSONs)
 * @author Juknum
 */
export class EmittingCollection<K, V> extends Collection<K, V> {
	// ! events should be emitted after everything
	public readonly events = new EventEmitter();

	public set(key: K, value: V) {
		super.set(key, value);
		this.events.emit("dataSet", key, value);
		return this;
	}

	public delete(key: K) {
		const success = super.delete(key);
		this.events.emit("dataDeleted", key);
		return success;
	}
}
