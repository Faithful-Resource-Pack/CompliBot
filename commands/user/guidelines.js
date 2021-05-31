const prefix = process.env.PREFIX;

const strings = require('../../ressources/strings');

module.exports = {
	name: 'guidelines',
	description: strings.HELP_DESC_GUIDELINES,
	guildOnly: true,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}guidelines`,
	async execute(client, message, args) {
		const embedMessage = await message.inlineReply('https://docs.compliancepack.net/pages/textures/texturing-guidelines');
		await embedMessage.react('🗑️');

		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					await embedMessage.delete();
					await message.delete();
				}
			})
			.catch(async () => {
				await embedMessage.reactions.cache.get('🗑️').remove();
			});
	}
};
