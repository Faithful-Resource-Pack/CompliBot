const prefix = process.env.PREFIX
const { addDeleteReact } = require('../../helpers/addDeleteReact')
const strings = require('../../resources/strings.json')

module.exports = {
	name: 'guidelines',
	description: strings.command.description.guidelines,
	category: 'Compliance exclusive',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}guidelines`,
	async execute(client, message, _args) {
		const embedMessage = await message.reply({ content: 'https://docs.compliancepack.net/pages/textures/texturing-guidelines' })
		addDeleteReact(embedMessage, message, true)
	}
}
