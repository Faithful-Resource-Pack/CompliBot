const settings = require("../../resources/settings.json");
const { addDeleteReact } = require("../../helpers/addDeleteReact");
/**
 * Sends raw image
 * @author Evorp
 * @param {DiscordMessage} message
 * @param {String} url Image URL
 * @param {DiscordUserID} gotocomplichannel if set, the message is send to the corresponding #complibot
 * @returns Send a message with the raw image
 */
async function viewRaw(message, url, gotocomplichannel = undefined, redirectMessage = undefined) {
    const attachment = url;
    let complichannel;
    if (gotocomplichannel) {
        if (message.guild.id == settings.guilds.c32.id) complichannel = message.guild.channels.cache.get(settings.channels.bot_commands);
    }
    let embedMessage;
    if (gotocomplichannel) {
        try {
            const member = await message.guild.members.cache.get(gotocomplichannel);
            embedMessage = await member.send({ files: [attachment] });
        } catch (e) {
            embedMessage = await complichannel.send({ content: `<@!${gotocomplichannel}>`, files: [attachment] });
        }
    } else embedMessage = await message.reply({ files: [attachment] });
    if (redirectMessage) addDeleteReact(embedMessage, redirectMessage, true);
    else addDeleteReact(embedMessage, message, true);

    return attachment;
}
exports.viewRaw = viewRaw;
