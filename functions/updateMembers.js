/**
 * Update member count of a server
 * @param {DiscordClient} client 
 * @param {String} serverID server from where the count is established
 * @param {String} channelID use to set the count
 */
async function updateMembers(client, serverID, channelID) {
	let guild = client.guilds.cache.get(serverID);
	
	if(guild !== undefined && guild.channels !== undefined)
		await guild.channels.cache.get(channelID).setName('Members: ' + guild.memberCount);
}

exports.updateMembers = updateMembers;