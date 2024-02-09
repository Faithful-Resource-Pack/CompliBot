import { Client } from "@client";
import { AnyInteraction } from "./interactions";

// all components use same interface for reusable initialization
export interface Component<T extends AnyInteraction = AnyInteraction> {
	id: string;
	execute: ComponentExecute<T>;
}

export type ComponentExecute<T> = (client: Client, interaction: T) => Promise<any>;
