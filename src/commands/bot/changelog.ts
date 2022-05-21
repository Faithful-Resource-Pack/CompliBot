import { SlashCommand, SlashCommandI } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedFieldData, Message } from "discord.js";
import { Client, MessageEmbed } from "@client";
import { readFileSync } from "fs";
import path from "path";
import { changelogOptions } from "@/src";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("changelog")
		.setDescription("Gets a changelog version of the bot")
		.addStringOption((str) => {
			return str
				.addChoices(...changelogOptions())
				.setName("version")
				.setDescription("The version to fetch.")
				.setRequired(true);
		}),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const versionChoice = await interaction.options.getString("version");

		const changelogStr = readFileSync(path.join(__dirname, "../../../", "CHANGELOG.md").replace("dist\\", ""), "utf-8")
			.replaceAll("\r", "") // no more \r returns
			.replaceAll("**Warning**", "**⚠️ Warning**") //discord prefixes these two key terms with emojis and styles
			.replaceAll("**Note**", "**ℹ️ Note**"); //them unlike discord so this is adding them back.

		const allVersions = changelogStr.match(/(?<=## )([^]*?)(?=(\n## )|($))/g); //basically searches for strings between ## and another ## or the end of the file

		let versions = [
			[changelogOptions()[0][0], allVersions[0].substring(7)],
			[changelogOptions()[1][0], allVersions[1].substring(7)],
		];

		for (let i = 0; i < allVersions.length; i++) {
			versions.push([allVersions[i].substring(1, 7), allVersions[i].substring(8)]);
		}

		for (let i = 0; i < versions.length; i++) {
			if (versions[i][0] == versionChoice.split(" ")[0]) {
				let date = /\d{2}\/\d{2}\/\d{4}/i.exec(versions[i][1]); //gets date if any

				var timestamp;
				if (date != undefined) {
					//found on stack overflow
					timestamp = new Date(
						parseInt(date[0].split("/")[2], 10),
						parseInt(date[0].split("/")[1], 10) - 1,
						parseInt(date[0].split("/")[0], 10),
					);
				}
				let fields: EmbedFieldData[] = [];
				const cleanedTxt = versions[i][1]
					.replaceAll("-", "•") //yes
					.split("\n")
					.splice(2, versions[i][1].length) //removes first two lines because we have a title alr
					.join("\n")
					.split("### "); // for the following operation

				//pushes all subheadings (### <something>) into fields because cool
				for (let i = 1; i < cleanedTxt.length; i++) {
					const value = cleanedTxt[i].split("\n").splice(1, cleanedTxt[i].length).join("\n");

					fields.push({
						name: cleanedTxt[i].split("\n")[0],
						value: value.length == value.substring(0, 1021).length ? value : value.substring(0, 1021) + "...",
						inline: false,
					});
				}
				const cleanedVersion = (versionChoice.split(" ")[0] + "-" + (date ? date[0] : "TBA")).replaceAll(
					/(\/|\[|\]|v|\.)/g,
					"",
				);
				const url = `https://github.com/Faithful-Resource-Pack/Discord-Bot/blob/typescript/CHANGELOG.md#${cleanedVersion}`;
				const embed = new MessageEmbed()
					.setTitle(`${await interaction.getEphemeralString({ string: "Command.Changelog.Title" })}${versionChoice}: `)
					.setURL(url)
					.addFields(fields);
				timestamp
					? embed.setTimestamp().setFooter({ text: versionChoice })
					: embed.setFooter({ text: `${versionChoice} • To be announced` }); //the illusion of a timestamp xd
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}
	},
};
