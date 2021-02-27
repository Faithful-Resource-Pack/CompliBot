const Discord  = require('discord.js');
const settings = require('../../settings.js');
const colors   = require('../../res/colors.js');
const { jsonModeration } = require('../../helpers/fileHandler');
const fs       = require('fs');

const { removeMutedRole } = require('../moderation/removeMutedRole.js');

async function checkTimeout(client) {
	let warnList = await jsonModeration.read();

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

	await jsonModeration.write(warnList);
}

exports.checkTimeout = checkTimeout;