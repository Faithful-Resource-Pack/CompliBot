import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Role,
	StringSelectMenuInteraction,
} from "discord.js";
import { string, keys, Placeholder } from "@helpers/locales";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { EmbedBuilder } from "@client";

export type PermissionType = "manager" | "dev" | "moderator" | "council";

declare module "discord.js" {
	interface ChatInputCommandInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
		/**
		 * @see {@link checkPermissions} for implementation details
		 */
		hasPermission(type: PermissionType): boolean;
	}

	interface ButtonInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}

	interface StringSelectMenuInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}
}
interface TextOptions {
	string: keys;
	placeholders?: Placeholder;
}
async function getEphemeralString(options: TextOptions): Promise<string> {
	return await string(this.locale, options.string, options.placeholders);
}

function hasPermission(type: PermissionType): boolean {
	const hasManager = this.member.permissions.has(PermissionFlagsBits.Administrator);
	const hasModerator = this.member.permissions.has(PermissionFlagsBits.ManageMessages);
	const hasCouncil = this.member.roles.cache.some((role: Role) =>
		role.name.toLowerCase().includes("council"),
	);

	const hasDev = this.client.tokens.developers.includes(this.member.id);

	const noPermission = new EmbedBuilder()
		.setTitle("You don't have permission to do that!")
		.setDescription(`Only ${type}s can use this command.`);

	let out: boolean;
	switch (type) {
		case "manager":
			out = hasManager;
		case "council":
			out = hasCouncil;
		case "dev":
			out = hasDev;
		case "moderator":
			out = hasModerator;
	}

	if (!out) this.reply({ embeds: [noPermission], ephemeral: true });
	return out;
}

ChatInputCommandInteraction.prototype.getEphemeralString = getEphemeralString;
ButtonInteraction.prototype.getEphemeralString = getEphemeralString;
StringSelectMenuInteraction.prototype.getEphemeralString = getEphemeralString;
ChatInputCommandInteraction.prototype.hasPermission = hasPermission;

export { ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction };
