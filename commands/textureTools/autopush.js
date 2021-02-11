const settings = require('../../settings');
const prefix   = process.env.PREFIX;

const { doPush } = require('../../functions/doPush.js');
const { getResults } = require('../../functions/textures_submission/getResults.js');

module.exports = {
	name: 'autopush',
	description: 'Use: `/autopush` to push textures from #results to GitHub!',
	uses: 'Moderators',
	syntax: `${prefix}autopush`,
	async execute(client, message, args) {
    if (message.member.hasPermission('ADMINISTRATOR')) {
			
			await getResults(client, settings.C64_RESULTS);
			await getResults(client, settings.C32_RESULTS);
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
