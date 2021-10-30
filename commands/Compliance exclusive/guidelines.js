const prefix = process.env.PREFIX;

const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { string } = require('../../resources/strings');

module.exports = {
	name: 'guidelines',
	description: string('command.description.guidelines'),
	category: 'Compliance exclusive',
	guildOnly: true,
	uses: string('command.use.anyone'),
	syntax: `${prefix}guidelines`,
	async execute(client, message, _args) {
		const embedMessage = await message.reply({ content: 'https://docs.compliancepack.net/pages/textures/texturing-guidelines' });
		addDeleteReact(embedMessage, message, true)
	}
};
