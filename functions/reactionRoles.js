const Discord = require('discord.js')
const colors  = require('../ressources/colors')

exports.sendReactionMsg = async (message) =>  {
    var embed = new Discord.MessageEmbed()
		.setDescription(`test`)
		.setColor(colors.BLUE)

	const messageEmbed = await message.channel.send(embed)
    await messageEmbed.react('782350092106465300') //Add-ons
    await messageEmbed.react('782350111694651452') //Tweaks
    await messageEmbed.react('782350147119218718') //Mods
    await messageEmbed.react('782350138550648833') //Dungeons
}

exports.listenReaction = async (reaction, user) => {

    console.log('lmao 1')
    let reactionRole = '';

    if (reaction.emoji.id === '782350092106465300') reactionRole = '860462015864111114'
    if (reaction.emoji.id === '782350111694651452') reactionRole = '860462167249780737'
    if (reaction.emoji.id === '782350147119218718') reactionRole = '860462150615302144'
    if (reaction.emoji.id === '782350138550648833') reactionRole = '860462126765703179'

    console.log('lmao 2')
    await addRemoveRole(reaction, reactionRole, user);

}

async function addRemoveRole(reaction, reactionRole, user) {
    const message = await reaction.message.fetch()
    const member  = await message.guild.members.cache.get(user.id)

    /* Code from somewhere that I also tried out and isn't working

    const { guild } = reaction.message
    const role = guild.roles.cache.find((role) => role.name === 'CAdd-ons')
    const member = guild.members.cache.find((member) => member.id === user.id)
    */

    if (member.roles.cache.has(reactionRole)) await member.roles.remove(reactionRole)
    else await member.roles.add(reactionRole)
    console.log('lmao 3')
}