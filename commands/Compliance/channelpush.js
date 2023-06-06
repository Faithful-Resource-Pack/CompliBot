const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json');
const strings = require('../../resources/strings.json');

const { retrieveSubmission } = require('../../functions/textures/submission/retrieveSubmission')
const { councilSubmission } = require('../../functions/textures/submission/councilSubmission')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'channelpush',
	description: strings.command.description.channelpush,
	category: 'Compliance',
	guildOnly: false,
	uses: strings.command.use.admins,
	syntax: `${prefix}channelpush [all/f32/f64]`,
	example: `${prefix}channelpush f32`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission);
        if (!args.length) return warnUser(message, strings.command.args.none_given)

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

        for (let pack of packs) {
            await retrieveSubmission (
                client,
                pack.channels.submit,
                pack.channels.council,
                pack.vote_time
            )

            await councilSubmission (
                client,
                pack.channels.council,
                pack.channels.results,
                pack.council_time
            )
        }

		return await message.react(settings.emojis.upvote);
	}
}