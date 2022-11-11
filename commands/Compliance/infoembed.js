const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { MessageEmbed } = require('discord.js')

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

module.exports = {
	name: 'infoembed',
	description: strings.command.description.infoembed,
	category: 'Compliance',
	guildOnly: true,
	uses: strings.command.use.devs,
	syntax: `${prefix}discords\n${prefix}media`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || "331073143613423616") {
			if (args[0] === 'discords') {
				if (message.guild.id === settings.guilds.c32.id || args[1] === '32x') {
					await message.channel.send({ content: 'This server:\n> https://discord.gg/sN9YRQbBv7' });
					await message.channel.send({ content: 'Classic Faithful:\n> https://discord.gg/KSEhCVtg4J' });
					await message.channel.send({ content: 'Minecraft:\n> https://discord.gg/minecraft' });
					await message.delete()
				} else return
			}
			else if (args[0] === 'media') {
				var websiteEmbed = new MessageEmbed()
					.setTitle('Website')
					.setDescription('https://faithfulpack.net')
					.setColor(settings.colors.c32)
					.setThumbnail('https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/logos/transparent/512/plain_logo.png')

				var githubEmbed = new MessageEmbed()
					.setTitle('Github')
					.setDescription('https://github.com/Faithful-Resource-Pack')
					.setColor(settings.colors.github)
					.setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')

				var twitterEmbed = new MessageEmbed()
					.setTitle('Twitter')
					.setDescription('https://twitter.com/FaithfulPack')
					.setColor(settings.colors.twitter)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/512px-Twitter-logo.svg.png')

				var curseforgeEmbed = new MessageEmbed()
					.setTitle('CurseForge')
					.setDescription('https://www.curseforge.com/members/faithful_resource_pack/projects')
					.setColor(settings.colors.curseforge)
					.setThumbnail('https://gist.githubusercontent.com/thecodewarrior/110057b210551c4ecf2c9be6d58ff824/raw/38748511ca1eb5677f009092fb3fcd71cc76cdf0/logo.png')

				var modrinthEmbed = new MessageEmbed()
					.setTitle('Modrinth')
					.setDescription('https://modrinth.com/user/Faithful-Resource-Pack')
					.setColor(settings.colors.modrinth)
					.setThumbnail('https://cdn-raw.modrinth.com/modrinth-new.png')
				
				var planetMinecraftEmbed = new MessageEmbed()
					.setTitle('Planet Minecraft')
					.setDescription('https://www.planetminecraft.com/member/faithful_resource_pack/')
					.setColor(settings.colors.planetminecraft)
					.setThumbnail('https://www.planetminecraft.com/images/layout/favicon-128.png')

				var mcpedlEmbed = new MessageEmbed()
					.setTitle('MCPEDL')
					.setDescription('https://mcpedl.com/user/faithful-resource-pack/')
					.setColor(settings.colors.mcpedl)
					.setThumbnail('https://mcpedl.com/_nuxt/img/logo.e39b598.png')

				var youtubeEmbed = new MessageEmbed()
					.setTitle('Youtube')
					.setDescription('https://www.youtube.com/channel/UCQFajwwCLyFKLhZsAkHSGJA')
					.setColor(settings.colors.youtube)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png')

				var redditEmbed = new MessageEmbed()
					.setTitle('Reddit')
					.setDescription('https://www.reddit.com/r/faithfulpack/')
					.setColor(settings.colors.reddit)
					.setThumbnail('https://www.redditinc.com/assets/images/site/reddit-logo.png')

				var patreonEmbed = new MessageEmbed()
					.setTitle('Patreon')
					.setDescription('https://www.patreon.com/Faithful_Resource_Pack')
					.setColor(settings.colors.patreon)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Patreon_logomark.svg/1024px-Patreon_logomark.svg.png')

				await message.channel.send({ embeds: [websiteEmbed, githubEmbed, twitterEmbed, curseforgeEmbed, modrinthEmbed, planetMinecraftEmbed, mcpedlEmbed, youtubeEmbed, redditEmbed, patreonEmbed] })
			}
		} else return
	}
};
