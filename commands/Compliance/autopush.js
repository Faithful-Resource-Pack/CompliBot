const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json');
const strings = require('../../resources/strings.json');

const { date } = require('../../helpers/date')
const { pushTextures } = require('../../functions/textures/admission/pushTextures')
const { downloadResults } = require('../../functions/textures/admission/downloadResults')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'autopush',
	description: strings.command.description.autopush,
	category: 'Compliance',
	guildOnly: false,
	uses: strings.command.use.admins,
	syntax: `${prefix}autopush [all/f32/f64]`,
	example: `${prefix}autopush f32`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given);

		let packs;
		switch (args[0]) {
            case 'all':
                packs = Object.values(settings.submission.packs);
                break;
            case "f32":
                packs = [settings.submission.packs.faithful_32x]
                break;
            case "f64":
                packs = [settings.submission.packs.faithful_64x]
                break;
            default:
                return warnUser(message, strings.command.args.invalid.generic);
		}

		for (let pack of packs) await downloadResults(client, pack.channels.results)

		await pushTextures(`Manual push executed by ${message.author.username} on ${date()}`);	// Push them through GitHub

		return await message.react(settings.emojis.upvote);
	}
}