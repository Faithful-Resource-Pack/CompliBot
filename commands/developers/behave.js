const prefix  = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const strings = require('../../resources/strings');

module.exports = {
	name: 'behave',
	description: strings.HELP_DESC_BEHAVE,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
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
			if(args && Array.isArray(args) && args.length > 0 && args[0].includes('/channels/')) {
				let ids
				const link = args[0]
				const url = new URL(link).pathname
				if (link.startsWith('https://canary.discord.com/channels/'))
					ids = url.replace('/channels/','').split('/')
				else if (link.startsWith('https://discord.com/channels/'))
					ids = url.replace('/channels/','').replace('message','').split('/')
				else if (link.startsWith('https://discordapp.com/channels/'))
					ids = url.replace('/channels/','').split('/')
				else
					return await message.inlineReply(strings.BEHAVE_ANSWER)
				
				/** @type {Discord.TextChannel} */
				const channel = message.guild.channels.cache.get(ids[1])
				const messageToBehave = await channel.messages.fetch(ids[2])

				// delete command message
				await message.delete();

				// reply to link message
				return await messageToBehave.inlineReply(strings.BEHAVE_ANSWER)
			}
			
			return await message.inlineReply(strings.BEHAVE_ANSWER)
		} else return await message.inlineReply('lol no');
	}
};
