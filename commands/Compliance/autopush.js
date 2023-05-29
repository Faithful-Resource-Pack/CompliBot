const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json');
const strings = require('../../resources/strings.json');

const { date } = require('../../helpers/date')
const { pushTextures } = require('../../functions/textures/admission/pushTextures')
const { downloadResults } = require('../../functions/textures/admission/downloadResults')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'autopush',
	description: strings.command.description.autopush,
	category: 'Compliance',
	guildOnly: false,
	uses: strings.command.use.admins,
	syntax: `${prefix}autopush [all/32/64]`,
	example: `${prefix}autopush 32`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		if (!args.length) return warnUser(message, strings.command.args.invalid.generic)

		if (args[0] == 'all') {
			for (let packName in settings.submission) {
				await downloadResults(client, settings.submission[packName].channels.results)
			}
		}

		else if (args[0] == "32") {
			await downloadResults(client, settings.submission.faithful_32x.channels.results)
		}

		else if (args[0] == '64') {
			await downloadResults(client, settings.submission.faithful_64x.channels.results)
		}

		else return warnUser(message, strings.command.args.invalid.generic);

		await pushTextures(`Manual push, executed by: ${message.author.username} (${date()})`);	// Push them through GitHub

		return await message.react(settings.emojis.upvote);
	}
}