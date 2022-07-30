const prefix = process.env.PREFIX;

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')

const strings = require('../../resources/strings.json')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'reactionroles',
	description: 'none',
	guildOnly: true,
	uses: strings.command.use.admins,
	category: 'Compliance',
	syntax: `${prefix}reactionroles`,
	flags: '',
	example: `${prefix}reactionroles`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		let embed, embedMessage

		if (message.guild.id == settings.guilds.c32.id || message.guild.id == settings.guilds.cdevs.id) {
			embed = new Discord.MessageEmbed()
				.setColor(settings.colors.c32)
				.setDescription(
`*Thank you for being interested in helping Faithful out! Before you get started though, it's necessary for you to understand how everything's going to work with your textures. To find everything out, please read the following agreement.*

__By submitting a texture, you agree to allow:__
• The texture to be used in any public or development version of Faithful.
• The texture to be used directly or in a modified state in other projects under the Faithful project. (Classic Faithful, Faithful Dungeons, Faithful Tweaks/Add-ons etc.)
• The texture to be used in/as a base for other textures meant for Faithful.
• Others to edit your texture without any required prior notice, and allow them to submit the edited texture to Faithful, with appropriate credit.
• Managers of the respective Faithful resource pack to license the usage of your texture to third parties on your behalf (You can override this yourself if you so choose.)
				
We guarantee that your work will not be sold for monetary profit at any time on any platform, including the Minecraft Marketplace.
				
It's important to understand that **your texture will remain yours, and you will retain all the rights to it.** You are simply licensing your texture to the Faithful project – we will not take ownership of it.
However, for your texture to remain in Faithful, you need to be in agreement with these terms. If, at any point in time, you don't agree with them anymore, you can revoke your agreement and have your textures removed from Faithful. To do so, please contact any of the Managers. To have your textures removed from Add-ons or Tweaks, please contact the creator of the respective pack.
				
Finally, we advise you to read our [license](https://faithfulpack.net/license) and the [contributor's handbook](https://docs.faithfulpack.net/pages/textures/contributor-handbook.html).
				
*By clicking the button below you're confirming that you have read and understood these terms and are ready to gain access to the submission channels.*`
				)
			embedMessage = await message.channel.send({ embeds: [embed] })
			await embedMessage.react(settings.emojis.upvote)
		}

		else if (message.guild.id == settings.guilds.cextras.id) {
			embed = new Discord.MessageEmbed()
				.setTitle('React with the appropriate emote to receive access to a project channel category.')
				.setColor(settings.colors.c32)
				.setThumbnail(settings.images.cextras)
				.setDescription('If you already have a role, you can react again to remove it. \n\n<:f_addons:962443509963579482> Add-ons \n\n <:f_mods:962443510986969088>  Mods \n\n <:f_dungeons:962443509896458321> Dungeons')
			embedMessage = await message.channel.send({ embeds: [embed] })
			await embedMessage.react(settings.emojis.caddons) //Add-ons
			await embedMessage.react(settings.emojis.cmods) //Mods
			await embedMessage.react(settings.emojis.cdungeons) //Dungeons
		}

		await message.delete()
	}
}