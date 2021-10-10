const prefix   = process.env.PREFIX;

const settings = require('../../resources/settings');
const strings  = require('../../resources/strings');

const { date }            = require('../../helpers/date')
const { pushTextures }    = require('../../functions/textures/admission/pushTextures')
const { downloadResults } = require('../../functions/textures/admission/downloadResults')
const { warnUser }        = require('../../helpers/warnUser')

module.exports = {
	name: 'autopush',
	description: strings.HELP_DESC_AUTOPUSH,
	guildOnly: false,
	uses: strings.COMMAND_USES_ADMINS,
	syntax: `${prefix}autopush <both/c32/c64>`,
	example: `${prefix}autopush c32`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		if (!args.length) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)

		if (args[0] == 'both') {
			await downloadResults(client, settings.C64_RESULTS)
			await downloadResults(client, settings.C32_RESULTS)
		}
		else if (args[0] == 'c32') await downloadResults(client, settings.C32_RESULTS)
		else if (args[0] == 'c64') await downloadResults(client, settings.C64_RESULTS)
		else return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);

		await pushTextures(`Manual push, executed by: ${message.author.username} (${date()})`);	// Push them trough GitHub

		return await message.react('✅');
	}
}