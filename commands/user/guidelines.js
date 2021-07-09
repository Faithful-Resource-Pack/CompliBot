const prefix = process.env.PREFIX;

const { addDeleteReact } = require('../../helpers/addDeleteReact');
const strings = require('../../resources/strings');

module.exports = {
	name: 'guidelines',
	description: strings.HELP_DESC_GUIDELINES,
	guildOnly: true,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}guidelines`,
	async execute(client, message, _args) {
		const embedMessage = await message.inlineReply('https://docs.compliancepack.net/pages/textures/texturing-guidelines');
		addDeleteReact(embedMessage, message, true)
	}
};
