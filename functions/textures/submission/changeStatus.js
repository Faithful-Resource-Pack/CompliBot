/*
 * Change status of embed
 * @author Evorp
 * @param {Discord.message} message
 * @param {String} string
 * @param {String} color
 */
async function changeStatus(message, string, color=null) {
    let embed = message.embeds[0]
    embed.fields[1].value = string
    embed.color = color ?? embed.color;
    await message.edit({ embeds: [embed] })
}

exports.changeStatus = changeStatus