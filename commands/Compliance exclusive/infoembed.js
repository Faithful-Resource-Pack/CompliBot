const prefix = process.env.PREFIX;
const Discord = require('discord.js')

const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

module.exports = {
	name: 'infoembed',
	description: strings.command.description.infoembed,
	category: 'Compliance exclusive',
	guildOnly: true,
	uses: strings.command.use.devs,
	syntax: `${prefix}discords`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (args[0] === 'discords') {
				if (message.guild.id === settings.guilds.c32.id || args[1] === '32x') {
					await message.channel.send({ content: 'This server:\n> https://discord.gg/sN9YRQbBv7' });
					await message.channel.send({ content: 'Compliance 64x:\n> https://discord.gg/Tqtwtgh' });
					await message.channel.send({ content: 'Compliance Extras:\n> https://discord.gg/qVeDfZw' });
					await message.channel.send({ content: 'Minecraft:\n> https://discord.gg/minecraft' });
					await message.delete()
				}
				else if (message.guild.id === settings.guilds.c64.id || args[1] === '64x') {
					await message.channel.send({ content: 'This server:\n> https://discord.gg/Tqtwtgh' });
					await message.channel.send({ content: 'Compliance 32x:\n> https://discord.gg/sN9YRQbBv7' });
					await message.channel.send({ content: 'Compliance Extras:\n> https://discord.gg/qVeDfZw' });
					await message.channel.send({ content: 'Minecraft:\n> https://discord.gg/minecraft' });
					await message.delete()
				}
				else if (message.guild.id === settings.guilds.cextras.id || args[1] === 'extras') {
					await message.channel.send({ content: 'This server:\n> https://discord.gg/qVeDfZw' });
					await message.channel.send({ content: 'Compliance 32x:\n> https://discord.gg/sN9YRQbBv7' });
					await message.channel.send({ content: 'Compliance 64x:\n> https://discord.gg/Tqtwtgh' });
					await message.channel.send({ content: 'Minecraft:\n> https://discord.gg/minecraft' });
					await message.channel.send({ content: 'Minecraft Dungeons:\n> https://discord.gg/minecraftdungeons' });
					await message.channel.send({ content: 'Optifine:\n> https://discord.gg/3mMpcwW' });
					await message.channel.send({ content: 'Blockbench:\n> https://discord.gg/fZQbxbg' });
					await message.delete()
				} else return
			}
			else if (args[0] === 'media') {
				var websiteEmbed = new Discord.MessageEmbed()
					.setTitle('Compliance Website')
					.setDescription('https://compliancepack.net/')
					.setColor(settings.colors.C32)
					.setThumbnail(settings.images.c32)

				var twitterEmbed = new Discord.MessageEmbed()
					.setTitle('Compliance Twitter')
					.setDescription('https://twitter.com/CompliancePack')
					.setColor(settings.colors.twitter)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Twitter_Logo_as_of_2021.svg/1280px-Twitter_Logo_as_of_2021.svg.png')

				var youtubeEmbed = new Discord.MessageEmbed()
					.setTitle('Compliance Youtube')
					.setDescription('https://www.youtube.com/channel/UCQFajwwCLyFKLhZsAkHSGJA')
					.setColor(settings.colors.youtube)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png')

				var patreonEmbed = new Discord.MessageEmbed()
					.setTitle('Compliance Patreon')
					.setDescription('https://www.patreon.com/Compliance')
					.setColor(settings.colors.patreon)
					.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Patreon_logomark.svg/1024px-Patreon_logomark.svg.png')

				await message.channel.send({ embeds: [websiteEmbed, twitterEmbed, youtubeEmbed, patreonEmbed] })
				await message.delete()
			}
		} else return
	}
};
