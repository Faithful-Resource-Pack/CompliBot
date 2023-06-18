const settings = require("../../resources/settings.json");
const { addDeleteReact } = require("../../helpers/addDeleteReact");
const { warnUser } = require('../../helpers/warnUser');

/**
 * Helper function for reaction menu in submissions
 * @author Evorp
 * @param {MessageAttachment} attachment attachment to send to user
 * @param {DiscordUserID} userID if set, the message is send to the corresponding #bot-commands
 * @returns the sent message
 */
async function sendAttachment(message, attachment, userID, embed = null) {
    let channel;
    for (let [key, value] of Object.entries(settings.guilds)) {
        if (message.guild.id == value) {
            // since the bot command and guild key names are the same
            channel = message.guild.channels.cache.get(settings.channels.bot_commands[key]);
            break;
        }
    }

    let embedMessage;

    try { // try to send in DMs
        const member = await message.guild.members.cache.get(userID);
        if (embed) embedMessage = await member.send({ embeds: [embed], files: [attachment] });
        else embedMessage = await member.send({ files: [attachment] });
    } catch { // user has DMs disabled
        // no valid #bot-commands was found, unnecessary info if using DMs so I put it here
        if (!channel) return warnUser(message, `You aren't in a valid server!`);
        embedMessage = await channel.send({ content: `<@!${userID}>`, embeds: [embed], files: [attachment] });
    }

    addDeleteReact(embedMessage, message, true);
    return embedMessage;
}

exports.sendAttachment = sendAttachment;
