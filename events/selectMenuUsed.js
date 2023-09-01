const client = require("@index").Client;
const { MessageEmbed } = require("discord.js");

const strings = require("@resources/strings.json");
const settings = require("@resources/settings.json");
const makeEmbed = require("@submission/makeEmbed");
const getAuthors = require("@submission/utility/getAuthors");
const { default: axios } = require("axios");

/**
 * "fake" event created to split up the generic interaction event
 * @author Evorp
 * @see interactionCreate
 */
module.exports = {
	name: "selectMenuUsed",
	async execute(interaction) {
		switch (interaction.customId.split("_")[0]) {
			case "choiceEmbed":
				await interaction.deferUpdate();
				const choiceMessage = interaction.message;
				if (choiceMessage.deletable && choiceMessage.reference) {
					const message = await choiceMessage.channel.messages.fetch(
						choiceMessage.reference.messageId,
					);

					if (message.deletable && message.author.id == interaction.user.id) {
						const [id, index] = interaction.values[0].split("__");
						const attachments = Array.from(message.attachments.values());

						const param = {
							description: message.content,
							authors: await getAuthors(message),
						};

						/** @type {import("../helpers/jsdoc").Texture} */
						const texture = (await axios.get(`${process.env.API_URL}textures/${id}/all`)).data;
						if (choiceMessage.deletable) await choiceMessage.delete();

						return await makeEmbed(client, message, texture, attachments[index], param);
					}
				}

				return await interaction.reply({
					content: "Only the submission author can select a texture!",
					ephemeral: true,
				});
			default:
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setTitle(strings.bot.error)
							.setThumbnail(settings.images.error)
							.setDescription(
								strings.bot.missing_interaction.replace("%INTERACTION%", "selection menu"),
							)
							.setColor(settings.colors.red),
					],
					ephemeral: true,
				});
		}
	},
};
