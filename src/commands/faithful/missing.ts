import { SlashCommand, SyncSlashCommandBuilder } from "@interfaces/commands";
import { FaithfulPack } from "@interfaces/firestorm";
import { Client, ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { SlashCommandBuilder, Message, AttachmentBuilder } from "discord.js";
import {
	computeMissingResults,
	computeAllEditions,
	MissingData,
	MissingResult,
	updateVoiceChannel,
} from "@functions/missing";
import axios from "axios";
import formatPack from "@utility/formatPack";
import minecraftSorter from "@utility/minecraftSorter";
import { toTitleCase } from "@utility/methods";

export const command: SlashCommand = {
	async data(client: Client): Promise<SyncSlashCommandBuilder> {
		const versions: string[] = (await axios.get(`${client.tokens.apiUrl}textures/versions`)).data;
		return new SlashCommandBuilder()
			.setName("missing")
			.setDescription("Displays the missing textures for a particular resource pack")
			.addStringOption((option) =>
				option
					.setName("pack")
					.setDescription("The resource pack.")
					.addChoices(
						{ name: "Faithful 32x", value: "faithful_32x" },
						{ name: "Faithful 64x", value: "faithful_64x" },
						{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
						{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
						{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName("edition")
					.setDescription("The resource pack edition.")
					.addChoices(
						{ name: "Java", value: "java" },
						{ name: "Bedrock", value: "bedrock" },
						{ name: "All", value: "all" },
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName("version")
					.setDescription("The Minecraft version.")
					// map to usable choice parameters
					.addChoices(
						...versions
							.sort(minecraftSorter)
							.reverse() // newest at top
							.map((i: string) => ({ name: i, value: i })),
					)
					.setRequired(false),
			)
			.addBooleanOption((option) =>
				option
					.setName("nonvanilla")
					.setDescription("Show nonvanilla textures in addition to the missing list.")
					.setRequired(false),
			);
	},
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const edition = interaction.options.getString("edition", true);
		const pack = interaction.options.getString("pack", true) as FaithfulPack;
		const version =
			edition == "bedrock"
				? "latest" // always use latest bedrock version, easier to format
				: interaction.options.getString("version") ?? "latest";

		const updateChannels = version === "latest";

		const loading: string = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/images.loading`)
		).data;

		const loadingEmbed = new EmbedBuilder()
			.setTitle("Searching for missing textures...")
			.setDescription("This can take some time, please wait...")
			.setThumbnail(loading)
			.addFields({ name: "Steps", value: "\u200b" });

		await interaction
			.editReply({ embeds: [loadingEmbed] })
			.then((message: Message) => message.deleteButton());
		let steps: string[] = [];

		const stepCallback = async (step: string) => {
			// when in the computing function this function is called when a step is being executed
			if (step === "") steps = ["Next one..."];
			else {
				if (steps.length === 1 && steps[0] === "Next one...") steps = [];
				steps.push(step);
			}

			loadingEmbed.spliceFields(0, 1, { name: "Steps", value: steps.join("\n") });
			await interaction.editReply({ embeds: [loadingEmbed] });
		};

		const catchErr = (err: string | Error, options: MissingData): MissingResult => {
			let errMessage = (err as Error).message;
			if (!errMessage) {
				console.error(err);
				errMessage = `An error occured when running /missing.\n\nInformation: ${err}`;
			}

			return {
				diffFile: null,
				results: [errMessage],
				data: options,
			};
		};

		let responses: MissingResult[];

		if (edition === "all") {
			responses = await computeAllEditions(interaction.client, pack, version, stepCallback).catch(
				(err: any) => [catchErr(err, { completion: 0, pack, version, edition })],
			);
		} else {
			// the args and error handling here change so we can't just switch out the args
			responses = [
				await computeMissingResults(interaction.client, pack, edition, version, stepCallback).catch(
					(err: any) => catchErr(err, { completion: 0, pack, version, edition }),
				),
			];
		}

		const files: AttachmentBuilder[] = [];
		const resultEmbed = new EmbedBuilder();

		for (const response of responses) {
			const packName = formatPack(pack).name;
			if (updateChannels) await updateVoiceChannel(interaction.client, response.data);

			// no repo found for the asked pack + edition
			if (!response.diffFile)
				return resultEmbed.addFields({
					name: `${packName} – ${toTitleCase(edition)} ${toTitleCase(version)}`,
					value: response.results[0],
				});

			if (response.results.length)
				files.push(
					new AttachmentBuilder(response.diffFile, {
						name: `missing-${pack}-${edition}.txt`,
					}),
				);

			if (response.nonvanillaFile && interaction.options.getBoolean("nonvanilla", false))
				files.push(
					new AttachmentBuilder(response.nonvanillaFile, {
						name: `nonvanilla-${pack}-${edition}.txt`,
					}),
				);

			resultEmbed.addFields({
				name: `${packName} – ${toTitleCase(edition)} ${toTitleCase(version)}`,
				value: `${response.data.completion}% complete:\n> ${response.results.length} ${
					response.results.length == 1 ? "texture" : "textures"
				} missing of ${response.data.total} total.`,
			});
		}

		return interaction.editReply({ embeds: [resultEmbed], files: files });
	},
};
