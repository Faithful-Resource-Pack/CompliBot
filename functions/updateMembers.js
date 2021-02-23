async function updateMembers(client, serverID, channelID) {
	let guild = client.guilds.cache.get(serverID);
	
	if(guild !== undefined && guild.channels !== undefined)
		await guild.channels.cache.get(channelID).setName('Members: ' + guild.memberCount);
}

exports.updateMembers = updateMembers;