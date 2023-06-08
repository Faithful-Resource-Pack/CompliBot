const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json');
const strings = require('../../resources/strings.json');

const { retrieveSubmission } = require('../../functions/textures/submission/retrieveSubmission')
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
		if (!args.length) return warnUser(message, strings.command.args.none_given);

        let packs = [settings.submission.packs[args[0]]]
		if (args[0] == 'all') packs = Object.values(settings.submission.packs);
        if (!packs[0]) return warnUser(message, strings.command.args.invalid.generic)

        for (let pack of packs) {
            if (pack.council_disabled) {
                await retrieveSubmission ( // send directly to results
                    client,
                    pack.channels.submit,
                    pack.channels.results,
                    false,
                    pack.vote_time,
                    true
                )

            } else {
                await retrieveSubmission ( // send to results
                    client,
                    pack.channels.council,
                    pack.channels.results,
                    false,
                    pack.council_time
                )

                await retrieveSubmission ( // send to council
                    client,
                    pack.channels.submit,
                    pack.channels.council,
                    true,
                    pack.vote_time
                )
            }
        }

		return await message.react(settings.emojis.upvote);
	}
}