const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { string } = require('../../resources/strings');

module.exports = {
	name: 'behave',
	description: string('command.description.behave'),
	category: 'Developer exclusive',
	guildOnly: false,
	uses: string('command.use.devs'),
	syntax: `${prefix}behave`,
	/**
	 * 
	 * @param {Discord.Client} client Current Discord bot client
	 * @param {Discord.Message} message Message that triggered the command
	 * @param {String[]} args The arguments to the command
	 * @returns 
	 */
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			if (args && Array.isArray(args) && args.length > 0 && args[0].includes('/channels/')) {
				let ids
				const link = args[0]
				const url = new URL(link).pathname
				if (link.startsWith('https://canary.discord.com/channels/'))
					ids = url.replace('/channels/', '').split('/')
				else if (link.startsWith('https://discord.com/channels/'))
					ids = url.replace('/channels/', '').replace('message', '').split('/')
				else if (link.startsWith('https://discordapp.com/channels/'))
					ids = url.replace('/channels/', '').split('/')
				else
					return await message.reply({ content: string('command.behave.answer') })

				/** @type {Discord.TextChannel} */
				const channel = message.guild.channels.cache.get(ids[1])
				const messageToBehave = await channel.messages.fetch(ids[2])

				// delete command message
				await message.delete();

				// reply to link message
				return await messageToBehave.reply({ content: string('command.behave.answer') })
			}

			return await message.reply({ content: string('command.behave.answer') })
		} else return await message.reply({ content: 'lol no' });
	}
};
