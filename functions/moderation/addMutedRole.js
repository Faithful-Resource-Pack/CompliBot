const Discord  = require('discord.js');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');

async function addMutedRole(client, userID) {
	const servers = [settings.CDUNGEONS_ID, settings.CMODS_ID, settings.CTWEAKS_ID, settings.CADDONS_ID, settings.C64_ID, settings.C32_ID, '814198513847631944']
	for (var i = 0; i < servers.length; i++) {
		var server = await client.guilds.cache.get(servers[i]) || undefined;
		var member = await server.members.cache.get(userID) || undefined;
		var role   = await server.roles.cache.find(r => r.name === 'Muted');
		if (server != undefined && member != undefined) {
			await member.roles.add(role);
		}
	}
}

exports.addMutedRole = addMutedRole;