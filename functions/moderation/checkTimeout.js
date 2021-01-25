const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors.js');
const fs       = require('fs');

const { removeMutedRole } = require('../moderation/removeMutedRole.js');

function checkTimeout(client) {
	var warnList = JSON.parse(fs.readFileSync('./json/moderation.json'));

	for (var i = 0; i < warnList.length; i++) {
		if (warnList[i].timeout > 0) {
			warnList[i].timeout = warnList[i].timeout - 30;
			if (warnList[i].timeout < 0 && warnList[i].timeout > -30) {
				warnList[i].timeout = 0;
			}
			if (warnList[i].timeout == 0) {
				removeMutedRole(client, warnList[i].user);
				warnList[i].muted = false;
			}
		}
	}

	fs.writeFileSync('./json/moderation.json', JSON.stringify(warnList, null, 2));
}

exports.checkTimeout = checkTimeout;