async function updateMembers(client, serverID, channelID) {
	let guild = client.guilds.cache.get(serverID);
	await guild.channels.cache.get(channelID).setName('Members: ' + guild.memberCount);
}

exports.updateMembers = updateMembers;