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
        switch (interaction.customId) {
            default:
                return await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(strings.bot.error)
                            .setThumbnail(settings.images.error)
                            .setDescription(strings.command.missing_interaction.replace("%INTERACTION%", "selection menu"))
                            .setColor(settings.colors.red),
                    ],
                    ephemeral: true,
                });
        }
    }
}
