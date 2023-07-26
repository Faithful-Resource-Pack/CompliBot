const { magnifyAttachment } = require("../functions/textures/magnify");
const tile = require("../functions/textures/tile");
const palette = require("../functions/textures/palette");
const difference = require("../functions/textures/difference");

const textures = require("../helpers/firestorm/texture");
const minecraftSorter = require("../helpers/minecraftSorter");
const { MessageEmbed } = require("discord.js");

const strings = require("../resources/strings.json");
const settings = require("../resources/settings.json");

/**
 * "fake" event created to split up the generic interaction event
 * @author Evorp
 * @see interactionCreate
 */
module.exports = {
	name: "buttonUsed",
	async execute(interaction) {
		const message = interaction.message;
		const image =
			interaction.message?.embeds[0]?.thumbnail?.url ??
			interaction.message.attachments.first()?.url;

		switch (interaction.customId) {
			case "magnifyButton":
				return await interaction.reply({
					files: [await magnifyAttachment(image)],
					ephemeral: true,
				});
			case "tileButton":
				// tile + magnify
				const tileBuffer = await tile(interaction, image);
				if (!tileBuffer) return;
				return await interaction.reply({
					files: [await magnifyAttachment(tileBuffer)],
					ephemeral: true,
				});
			case "paletteButton":
				// since there's multiple components in palette it's easier to reply there
				return palette(interaction, image);
			case "viewRawButton":
			case "diffButton":
				// finding which pack the channel "belongs" to
				let repoKey;
				for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
					if (Object.values(packValue.channels).includes(message.channel.id)) {
						repoKey = packKey;
						break;
					}
				}

				const id = (message.embeds?.[0]?.title?.match(/(?<=\[\#)(.*?)(?=\])/) ?? [null])[0];
				if (!id) return;
				const texture = await textures.get(id);
				const uses = await texture.uses();
				const paths = await uses[0].paths();
				const info = {
					path: paths[0].path,
					version: paths[0].versions.sort(minecraftSorter).reverse()[0],
					edition: uses[0].editions[0],
				};
				const currentUrl = `${settings.repositories.raw[repoKey][info.edition.toLowerCase()]}${
					info.version
				}/${info.path}`;
				const proposedUrl = message.embeds[0].thumbnail?.url;

				if (proposedUrl && currentUrl) {
					await interaction.deferReply({ ephemeral: true });
					const diff = await difference(proposedUrl, currentUrl);
					if (!diff) {
						return await interaction.editReply({
							embeds: [
								new MessageEmbed()
									.setTitle(strings.bot.error)
									.setDescription("There is no existing texture to find the difference of!")
									.setColor(settings.colors.red)
									.setThumbnail(settings.images.error),
							],
							ephemeral: true,
						});
					}
					return await interaction.editReply({
						embeds: [
							new MessageEmbed()
								.setTitle("Image Difference")
								.setDescription(
									"- Blue: Changed pixels\n- Green: Added pixels\n- Red: Removed pixels",
								)
								.setColor(settings.colors.blue)
								.setImage("attachment://diff.png"),
						],
						files: [diff],
						ephemeral: true,
					});
				}

				return await interaction.editReply({
					content: "something went wrong",
					ephemeral: true,
				});

			case "deleteButton":
				let original;
				if (message?.reference && message.deletable) {
					try {
						original = await message.channel.messages.fetch(message.reference.messageId);
					} catch {
						/* message deleted */
					}
				}

				// if there's no way to determine the author we can assume anyone can delete it
				if ((!original || original.author.id == interaction.user.id) && message.deletable)
					return await message.delete();
				return await interaction.reply({
					content: "Only the person who interacted can delete this message!",
					ephemeral: true,
				});
			default:
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(strings.bot.error)
							.setThumbnail(settings.images.error)
							.setDescription(strings.bot.missing_interaction.replace("%INTERACTION%", "button"))
							.setColor(settings.colors.red),
					],
					ephemeral: true,
				});
		}
	},
};
