import { Client } from "@src/Extended Discord";
import { SelectMenuInteraction } from "discord.js";

interface Execute {
  (client: Client, interaction: SelectMenuInteraction): void;
}

export interface SelectMenu {
  selectMenuId: string;
  execute: Execute;
}