/**
 * Update member count of a server
 * @param {DiscordClient} client 
 * @param {String} serverId server from where the count is established
 * @param {String} channelId use to set the count
 */
async function updateMembers(client, serverID, channelId) {
	var guild = client.guilds.cache.get(serverID);
	try {
		var memberChannel = guild.channels.cache.get(channelId);
	} catch (err) {
		return // return if channel can't be fetched
	}

	if (guild === undefined && guild.channels === undefined) return
	if (memberChannel.type === 'voice') await memberChannel.setName('Members: ' + guild.memberCount);
	else await memberChannel.setName('members-' + guild.memberCount);
}

exports.updateMembers = updateMembers;