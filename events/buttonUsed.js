const { magnifyAttachment } = require("../functions/textures/magnify");
const tile = require("../functions/textures/tile");
const palette = require("../functions/textures/palette");

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
                return await interaction.reply({
                    files: [image],
                    ephemeral: true,
                });
            case "deleteButton":
                let original;
                if (message?.reference)
                    original = await message.channel.messages.fetch(message.reference.messageId);

                // if there's no way to determine the author we can assume anyone can delete it
                if (!original || original.author.id == interaction.user.id) return await message.delete();
                return await interaction.reply({
                    content: "Only the person who called this message can delete it!",
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
    }
}