import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Role,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	PermissionFlagsBits,
} from "discord.js";
import { JSONFiles, en_US } from "@helpers/strings";
import { EmbedBuilder } from "@client";
import { colors } from "@helpers/colors";
import { ExtendedClient } from "./client";

export type PermissionType = "manager" | "dev" | "moderator" | "council";

declare module "discord.js" {
	interface ChatInputCommandInteraction {
		client: ExtendedClient; // so you don't have to cast it every time
		strings(): typeof en_US;
		hasPermission(type: PermissionType): boolean;
	}

	interface ButtonInteraction {
		client: ExtendedClient;
		strings(): typeof en_US;
	}

	interface StringSelectMenuInteraction {
		client: ExtendedClient;
		strings(): typeof en_US;
	}

	interface ModalSubmitInteraction {
		client: ExtendedClient;
		strings(): typeof en_US;
	}
}

/**
 * Check whether a user can run a given command
 * @author Evorp
 * @param type what role to check for
 * @returns whether the user has permission or not
 */
function hasPermission(type: PermissionType): boolean {
	const hasManager = this.member.permissions.has(PermissionFlagsBits.Administrator);
	const hasModerator = this.member.permissions.has(PermissionFlagsBits.ManageMessages);
	const hasCouncil = this.member.roles.cache.some((role: Role) =>
		role.name.toLowerCase().includes("council"),
	);

	const hasDev = this.client.tokens.developers.includes(this.member.id);

	const noPermission = new EmbedBuilder()
		.setTitle("You don't have permission to do that!")
		.setDescription(`Only ${type}s can use this command.`)
		.setColor(colors.red);

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

/**
 * Load strings based on interaction language
 * @author Evorp
 * @returns string output in correct language
 */
function strings(): typeof en_US {
	const countryCode = this.locale;
	let lang: typeof en_US;
	// load all english strings into one lang object
	for (const json of JSONFiles)
		lang = {
			...lang,
			...require(`@/lang/en-US/${json}.json`), // fallback
		};

	if (countryCode == "en-GB" || countryCode == "en-US") return lang;

	// because the fallback is already IN ENGLISH
	for (const json of JSONFiles)
		try {
			//* We try the import before spreading the object to avoid issues, we only want to check if the file exists
			const lang2 = require(`@/lang/${countryCode}/${json}.json`);
			lang = { ...lang, ...lang2 };
		} catch {} // file not found

	return lang;
}

ChatInputCommandInteraction.prototype.hasPermission = hasPermission;
ButtonInteraction.prototype.strings = strings;
StringSelectMenuInteraction.prototype.strings = strings;
ChatInputCommandInteraction.prototype.strings = strings;
ModalSubmitInteraction.prototype.strings = strings;

export {
	ChatInputCommandInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
};
