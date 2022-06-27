const settings = require('../resources/settings.json')

async function manageAgreement(client, reaction, user) {
	const reactID = reaction.emoji.id

	const server = await client.guilds.cache.get('991031483089186826') || undefined
	const member = server === undefined ? undefined : await server.members.cache.get(user.id)

	if (member === undefined) return

	if (reactID == settings.emojis.upvote) {
		if (member.roles.cache.some(r => r.id === '991027210540437524')) member.roles.remove('991027210540437524')
		else member.roles.add('991027210540437524')
	}

	await reaction.users.remove(user.id)
}

exports.manageAgreement = manageAgreement