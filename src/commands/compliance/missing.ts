import { SlashCommand, SyncSlashCommandBuilder } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "@client";
import { MessageAttachment } from "discord.js";
import {
	compute,
	computeAll,
	computeAndUpdate,
	computeAndUpdateAll,
	MissingOptions,
	MissingResult,
	MissingResults,
} from "@functions/missing";
import axios from "axios";
import { doNestedArr } from "@helpers/arrays";

export const PACKS: Array<[name: string, value: string]> = [
	["Compliance 32x", "compliance_32x"],
	["Compliance 64x", "compliance_64x"],
	["Classic Faithful 32x", "classic_faithful_32x"],
	["Classic Faithful 64x", "classic_faithful_64x"],
	["Classic Faithful 32x Programmer Art", "classic_faithful_32x_progart"],
];

/**
 * Get the displayed name for the value property
 * @param pack {string}
 * @returns {string}
 */
export const getDisplayNameForPack = (pack: string): string => {
	return PACKS.filter((p) => p[1] === pack)[0][0];
};

export const command: SlashCommand = {
	servers: ["compliance", "compliance_extra", "classic_faithful"],
	data: async (client: Client): Promise<SyncSlashCommandBuilder> => {
		let versions = Object.values((await axios.get(`${client.config.apiUrl}settings/versions`)).data).flat();
		versions.splice(versions.indexOf("versions"), 1); // remove "versions" key id (API issue)

		return (
			new SlashCommandBuilder()
				.setName("missing")
				.setDescription("Displays the missing textures for a particular resource pack")
				.addStringOption((option) =>
					option
						.setName("pack")
						.setDescription("The resource pack.")
						.addChoices(PACKS)
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("edition")
						.setDescription("The resource pack edition.")
						.addChoices([
							["Java", "java"],
							["Bedrock", "bedrock"],
							["All", "all"],
							// ["Minecraft Dungeons", "dungeons"], //todo: make dirs corresponding to the same setup for 32x & default repos
						])
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("version")
						.setDescription("The Minecraft version.")
						.addChoices(doNestedArr(versions))
						.setRequired(false),
				)
		);
	},
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();

		const edition: string = interaction.options.getString("edition", true);
		const pack: string = interaction.options.getString("pack", true);
		const updateChannels: boolean =
			interaction.options.getBoolean("update_channels") === null
				? false
				: interaction.options.getBoolean("update_channels");
		const version: string =
			interaction.options.getString("version") === null ? "latest" : interaction.options.getString("version");

		const embed: MessageEmbed = new MessageEmbed()
			.setTitle("Searching for missing textures...")
			.setDescription("This takes some times, please wait...")
			.setThumbnail(`${(interaction.client as Client).config.images}bot/loading.gif`)
			.addField("Steps", "Steps will be listed here");

		await interaction.editReply({ embeds: [embed] });
		let steps: Array<string> = [];

		let stepCallback = async (step: string) => {
			if (step === "") steps = ["Next one..."];
			else {
				if (steps.length === 1 && steps[0] === "Next one...") steps = [];
				steps.push(step);
			}

			embed.fields[0].value = steps.join("\n");
			await interaction.editReply({ embeds: [embed] });
		};

		const catchErr = (err: string | Error, options: MissingOptions): MissingResult => {
			let errMessage: string = (err as Error).message;
			if (!errMessage) {
				console.error(err);
				errMessage =
					"An error occured when launching missing command. Please check console error output for more infos";
			}

			return [null, [errMessage], options];
		};

		let responses: MissingResults;

		if (edition === "all") {
			if (updateChannels)
				responses = await computeAndUpdateAll(interaction.client as Client, pack, version, stepCallback).catch(
					(err) => {
						return [catchErr(err, { completion: 0, pack: pack, version: version, edition: edition })];
					},
				);
			else
				responses = await computeAll(interaction.client as Client, pack, version, stepCallback).catch((err) => {
					return [catchErr(err, { completion: 0, pack: pack, version: version, edition: edition })];
				});
		} else {
			if (updateChannels)
				responses = [
					await computeAndUpdate(interaction.client as Client, pack, edition, version, stepCallback).catch((err) =>
						catchErr(err, { completion: 0, pack: pack, version: version, edition: edition }),
					),
				];
			else
				responses = [
					await compute(interaction.client as Client, pack, edition, version, stepCallback).catch((err) =>
						catchErr(err, { completion: 0, pack: pack, version: version, edition: edition }),
					),
				];
		}

		const files: Array<MessageAttachment> = [];
		const embed2: MessageEmbed = new MessageEmbed();

		responses.forEach((response: MissingResult) => {
			// no repo found for the asked pack + edition
			if (response[0] === null)
				embed2.addField(
					`${getDisplayNameForPack(response[2].pack)} - ${response[2].edition} - ${response[2].version}`,
					`${response[2].completion}% complete\n> ${response[1][0]}`,
				);
			else {
				files.push(new MessageAttachment(response[0], `missing-${response[2].pack}-${response[2].edition}.txt`));
				embed2.addField(
					`${getDisplayNameForPack(response[2].pack)} - ${response[2].edition} - ${response[2].version}`,
					`${response[2].completion}% complete\n> ${response[1].length} textures missing.`,
				);
			}
		});

		return interaction.editReply({ embeds: [embed2], files: files });
	},
};
