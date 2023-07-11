import { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from "discord.js";
import { string, keys, Placeholder } from "@helpers/locales";
import {
	checkPermissions, //<- hover over me (i know this is stupid its a jsdoc thing where you cant carry shit)
	permissionCodeEnum,
	permissionOptions,
} from "@helpers/permissions/slashCommandPermissions";
import { MessageEmbed } from "@client";

declare module "discord.js" {
	interface CommandInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
		/**
		 * @see {@link checkPermissions} for implementation details
		 * @example if (await interaction.perms({ servers: ["faithful", "dev"], roles: ["council", "administrator"]})) return;
		 */
		perms(options: permissionOptions): Promise<boolean>;
	}

	interface ButtonInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}

	interface SelectMenuInteraction {
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

/**
 * @author Juknum
 * @description a function for translating string keys into the guild language.
 * @important This function should be used in public response as the string depends on the locale of the guild.
 */
async function getString(options: TextOptions): Promise<string> {
	return await string(this.guildLocale, options.string, options.placeholders);
}

async function perms(options: permissionOptions): Promise<boolean> {
	const code = checkPermissions(this, options);
	let output: string = "";

	if (!code[permissionCodeEnum.users])
		output += "\n" + (await this.getEphemeralString({ string: "Permissions.temp.user" }));
	if (!code[permissionCodeEnum.servers])
		output += "\n" + (await this.getEphemeralString({ string: "Permissions.temp.server" }));
	if (!code[permissionCodeEnum.roles])
		output += "\n" + (await this.getEphemeralString({ string: "Permissions.temp.role" }));

	if (!code.every((v) => v == true)) {
		await this.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(await this.getEphemeralString({ string: "Permissions.temp.template" }))
					.setDescription(output)
					.setFooter({
						text: await this.getEphemeralString({ string: "Permissions.temp.notice" }),
					}),
			],
			ephemeral: true,
		});
		return true;
	}

	return false;
}

CommandInteraction.prototype.getEphemeralString = getEphemeralString;
ButtonInteraction.prototype.getEphemeralString = getEphemeralString;
SelectMenuInteraction.prototype.getEphemeralString = getEphemeralString;
CommandInteraction.prototype.perms = perms;

export { CommandInteraction, ButtonInteraction, SelectMenuInteraction };
