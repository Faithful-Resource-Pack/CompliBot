const settings = require('../../settings');
const prefix   = process.env.PREFIX;
const strings  = require('../../res/strings');

const { doPush }     = require('../../functions/doPush.js');
const { getResults } = require('../../functions/textures_submission/getResults.js');
const { warnUser }   = require('../../functions/warnUser.js');

module.exports = {
	name: 'autopush',
	description: 'Use: `/autopush` to push textures from #results to GitHub!',
	guildOnly: false,
	uses: 'Moderators',
	syntax: `${prefix}autopush <both/c32/c64>`,
	async execute(client, message, args) {
    if (message.member.hasPermission('ADMINISTRATOR')) {

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
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}