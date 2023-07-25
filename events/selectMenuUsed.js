const client = require("../index").Client;
const { MessageEmbed } = require("discord.js");

const strings = require("../resources/strings.json");
const settings = require("../resources/settings.json");
const makeEmbed = require("../functions/submission/makeEmbed");
const getAuthors = require("../functions/submission/getAuthors");
const textures = require("../helpers/firestorm/texture");

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
				const choiceMessage = interaction.message;
				if (choiceMessage.deletable && choiceMessage.reference) {
					const message = await choiceMessage.channel.messages.fetch(
						choiceMessage.reference.messageId,
					);
					if (message.deletable && message.author.id == interaction.user.id) {
						// sends the "thinking" message
						await interaction.deferReply();
						const [id, index] = interaction.values[0].split("__");
						const attachments = Array.from(message.attachments.values());

						const param = {
							description: message.content,
							authors: await getAuthors(message),
						};

						const texture = await textures.get(id);
						// "complete" interaction and immediately delete message
						const followUp = await interaction.editReply({ content: "** **" });
						if (followUp.deletable) await followUp.delete();

						if (choiceMessage.deletable) await choiceMessage.delete();
						// only delete message if this is the last attachment being submitted
						if (index >= attachments.length - 1) await message.delete();
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
