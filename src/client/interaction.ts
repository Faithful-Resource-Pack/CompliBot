import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Role,
	StringSelectMenuInteraction,
	EmbedBuilder,
} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { JSONFiles, StringOutput, en_US } from "@helpers/strings";

export type PermissionType = "manager" | "dev" | "moderator" | "council";

declare module "discord.js" {
	interface ChatInputCommandInteraction {
		strings(): StringOutput;
		/**
		 * @see {@link checkPermissions} for implementation details
		 */
		hasPermission(type: PermissionType): boolean;
	}

	interface ButtonInteraction {
		strings(): StringOutput;
	}

	interface StringSelectMenuInteraction {
		strings(): StringOutput;
	}
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

function strings(): StringOutput {
	const countryCode = this.locale;
	let lang: typeof en_US;
	for (let i = 0; JSONFiles[i]; i++)
		lang = { ...lang, ...require(`@/lang/en-US/${JSONFiles[i]}.json`) }; // fallback

	if (countryCode !== "en-GB" && countryCode !== "en-US")
		// because the fallback is already IN ENGLISH
		for (let i = 0; JSONFiles[i]; i++)
			try {
				//* We try the import before spreading the object to avoid issues, we only want to check if the file exists
				const lang2 = require(`@/lang/${countryCode}/${JSONFiles[i]}.json`);
				lang = { ...lang, ...lang2 };
			} catch {} // file not found

	return lang;
}

ChatInputCommandInteraction.prototype.hasPermission = hasPermission;
ButtonInteraction.prototype.strings = strings;
StringSelectMenuInteraction.prototype.strings = strings;
ChatInputCommandInteraction.prototype.strings = strings;

export { ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction };
