const settings = require('../ressources/settings')

/**
 * Manage roles using reactions in the Extra Compliance Server
 */
async function manageExtraRoles(client, reaction, user) {
	const reactID = reaction.emoji.id

	const server = await client.guilds.cache.get(settings.CEXTRAS_ID) || undefined
	const member = server === undefined ? undefined : await server.members.cache.get(user.id)

	if (member === undefined) return

	switch (reactID) {
		case '782350092106465300': // addons
			if (member.roles.cache.some(r => r.id === '860462015864111114')) member.roles.remove('860462015864111114')
			else member.roles.add('860462015864111114')
			break
		case '782350111694651452': // tweaks
			if (member.roles.cache.some(r => r.id === '860462167249780737')) member.roles.remove('860462167249780737')
			else member.roles.add('860462167249780737')
			break
		case '782350147119218718': // mods
			if (member.roles.cache.some(r => r.id === '860462150615302144')) member.roles.remove('860462150615302144')
			else member.roles.add('860462150615302144')
			break
		case '782350138550648833': // dungeons
			if (member.roles.cache.some(r => r.id === '860462126765703179')) member.roles.remove('860462126765703179')
			else member.roles.add('860462126765703179')
			break

		default:
			break
	}

	await reaction.users.remove(user.id)
}

exports.manageExtraRoles = manageExtraRoles


// const Discord = require('discord.js')
// const colors  = require('../ressources/colors')

// exports.sendReactionMsg = async (message) =>  {
//     var embed = new Discord.MessageEmbed()
// 		.setDescription(`test`)
// 		.setColor(colors.BLUE)

// 	const messageEmbed = await message.channel.send(embed)
//     await messageEmbed.react('782350092106465300') //Add-ons
//     await messageEmbed.react('782350111694651452') //Tweaks
//     await messageEmbed.react('782350147119218718') //Mods
//     await messageEmbed.react('782350138550648833') //Dungeons
// }

// exports.listenReaction = async (reaction, user) => {

//     console.log('lmao 1')
//     let reactionRole = '';

//     if (reaction.emoji.id === '782350092106465300') reactionRole = '860462015864111114'
//     if (reaction.emoji.id === '782350111694651452') reactionRole = '860462167249780737'
//     if (reaction.emoji.id === '782350147119218718') reactionRole = '860462150615302144'
//     if (reaction.emoji.id === '782350138550648833') reactionRole = '860462126765703179'

//     console.log('lmao 2')
//     await addRemoveRole(reaction, reactionRole, user);

// }

// async function addRemoveRole(reaction, reactionRole, user) {
//     const message = await reaction.message.fetch()
//     const member  = await message.guild.members.cache.get(user.id)

//     /* Code from somewhere that I also tried out and isn't working

//     const { guild } = reaction.message
//     const role = guild.roles.cache.find((role) => role.name === 'CAdd-ons')
//     const member = guild.members.cache.find((member) => member.id === user.id)
//     */

//     if (member.roles.cache.has(reactionRole)) await member.roles.remove(reactionRole)
//     else await member.roles.add(reactionRole)
//     console.log('lmao 3')
// }