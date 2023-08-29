const { magnifyAttachment } = require("../functions/images/magnify");
const tile = require("../functions/images/tile");
const palette = require("../functions/images/palette");
const difference = require("../functions/images/difference");

const minecraftSorter = require("../helpers/minecraftSorter");
const { default: axios } = require("axios");
const { MessageEmbed } = require("discord.js");

const strings = require("../resources/strings.json");
const settings = require("../resources/settings.json");
const getPackByChannel = require("../functions/submission/utility/getPackByChannel");

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
				const packName = await getPackByChannel(message.channel.id);

				const id = (message.embeds?.[0]?.title?.match(/(?<=\[\#)(.*?)(?=\])/) ?? [
					"NO ID FOUND",
				])[0];
				if (!id) break;
				await interaction.deferReply({ ephemeral: true });
				/** @type {import("../helpers/jsdoc").Texture} */
				const texture = (await axios.get(`https://api.faithfulpack.net/v2/textures/${id}/all`)).data;
				const currentUrl = `${
					settings.repositories.raw[packName][texture.uses[0].edition.toLowerCase()]
				}${texture.paths[0].versions.sort(minecraftSorter)[0]}/${texture.paths[0].name}`;
				const proposedUrl = message.embeds[0].thumbnail?.url;

				const diff = await difference(currentUrl, proposedUrl);
				if (!diff || !proposedUrl) {
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
