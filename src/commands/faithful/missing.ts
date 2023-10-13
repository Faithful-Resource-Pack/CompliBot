import { SlashCommand, SyncSlashCommandBuilder } from "@interfaces";
import { Client, ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { SlashCommandBuilder, Message, AttachmentBuilder } from "discord.js";
import {
	compute,
	computeAll,
	computeAndUpdate,
	computeAndUpdateAll,
	MissingOptions,
	MissingResult,
} from "@functions/missing";
import axios from "axios";
import formatName from "@utility/formatName";
import minecraftSorter from "@utility/minecraftSorter";

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
							.map((i: string) => {
								return { name: i, value: i };
							}),
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
		const pack = interaction.options.getString("pack", true);
		const version = interaction.options.getString("version") ?? "latest";

		const updateChannels = version === "latest";

		const loading: string = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/images.loading`)
		).data;

		const loadingEmbed = new EmbedBuilder()
			.setTitle("Searching for missing textures...")
			.setDescription("This can take some time, please wait...")
			.setThumbnail(loading)
			.addFields({ name: "Steps", value: "\u200b" });

		await interaction.editReply({ embeds: [loadingEmbed] });
		let steps: string[] = [];

		let stepCallback = async (step: string) => {
			// when in the computing function this function is called when a step is being executed
			if (step === "") steps = ["Next one..."];
			else {
				if (steps.length === 1 && steps[0] === "Next one...") steps = [];
				steps.push(step);
			}

			loadingEmbed.spliceFields(0, 1, { name: "Steps", value: steps.join("\n") });
			await interaction.editReply({ embeds: [loadingEmbed] });
		};

		const catchErr = (err: string | Error, options: MissingOptions): MissingResult => {
			let errMessage = (err as Error).message;
			if (!errMessage) {
				console.error(err);
				errMessage =
					"An error occured when running /missing. Please check the console error output for more information.";
			}

			return [null, [errMessage], options];
		};

		let responses: MissingResult[];

		if (edition === "all") {
			// you can edit the function being called so you don't need like 50 different if statements with the same args
			const updateCallback: Function = updateChannels ? computeAndUpdateAll : computeAll;
			responses = await updateCallback(interaction.client, pack, version, stepCallback).catch(
				(err: any) => [
					catchErr(err, { completion: 0, pack: pack, version: version, edition: edition }),
				],
			);
		} else {
			// the args and error handling here change so we can't just switch out the args
			const updateCallback: Function = updateChannels ? computeAndUpdate : compute;
			responses = [
				await updateCallback(interaction.client, pack, edition, version, stepCallback).catch(
					(err: any) =>
						catchErr(err, { completion: 0, pack: pack, version: version, edition: edition }),
				),
			];
		}

		const files: AttachmentBuilder[] = [];
		const resultEmbed = new EmbedBuilder();

		responses.forEach((response: MissingResult) => {
			// no repo found for the asked pack + edition
			if (response[0] === null)
				resultEmbed.addFields({
					name: `${formatName(response[2].pack)[0]} - ${response[2].version}`,
					value: `${response[2].completion}% complete\n> ${response[1][0]}`,
				});
			else {
				if (response[1].length !== 0)
					files.push(
						new AttachmentBuilder(response[0], {
							name: `missing-${response[2].pack}-${response[2].edition}.txt`,
						}),
					);

				if (response[3]?.length && interaction.options.getBoolean("nonvanilla", false)) {
					files.push(
						new AttachmentBuilder(response[3], {
							name: `nonvanilla-${response[2].pack}-${response[2].edition}.txt`,
						}),
					);
				}

				resultEmbed.addFields({
					name: `${formatName(response[2].pack)[0]} - ${
						response[2].version
					}`,
					value: `${response[2].completion}% complete\n> ${response[1].length} ${
						response[1].length == 1 ? "texture" : "textures"
					} missing of ${response[2].total} total.`,
				});
			}
		});

		return interaction
			.editReply({ embeds: [resultEmbed], files: files })
			.then((message: Message) => message.deleteButton());
	},
};
