const prefix   = process.env.PREFIX;

const settings = require('../../settings');
const strings  = require('../../res/strings');

const { date }       = require('../../functions/utility/date.js')
const { doPush }     = require('../../functions/doPush.js');
const { getResults } = require('../../functions/textures_submission/getResults.js');
const { warnUser }   = require('../../functions/warnUser.js');

module.exports = {
	name: 'autopush',
	description: strings.HELP_DESC_AUTOPUSH,
	guildOnly: false,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}autopush <both/c32/c64>`,
	example: `${prefix}autopush c32`,
	async execute(client, message, args) {
    if(!message.member.hasPermission('ADMINISTRATOR')) return warnUser(message, strings.COMMAND_NO_PERMISSION);

		if (args[0] == '' || args[0] == undefined) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);

		if (args[0] == 'both') {
			await getResults(client, settings.C64_RESULTS);
			await getResults(client, settings.C32_RESULTS);
		}
		else if (args[0] == 'c32') await getResults(client, settings.C32_RESULTS);
		else if (args[0] == 'c64') await getResults(client, settings.C64_RESULTS);
		else return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);

		await doPush(`Manual AutoPush, executed by: ${message.author.username} (${date()})`);	// Push them trough GitHub

		return await message.react('✅');
	}
}