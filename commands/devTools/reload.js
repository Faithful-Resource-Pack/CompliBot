const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { warnUser } = require('../../functions/warnUser.js');
const { walkSync } = require('../../functions/walkSync');

module.exports = {
	name: 'reload',
	aliases: ['r'],
	description: strings.HELP_DESC_RELOAD,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}reload <command>`,
	example: `${prefix}reload magnify`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			const commandName = args[0].toLowerCase();
			const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) return warnUser(message, `There is no command with name or alias \`${commandName}\`!`);

			var commandPath = walkSync('./commands').filter(file => file.includes(command.name))[0].replace('./commands/', '../');

			delete require.cache[require.resolve(commandPath)];

			try {
				const newCommand = require(commandPath);
				message.client.commands.set(newCommand.name, newCommand);
				await message.react('✅');
			} catch (error) {
				console.error(error);
				await message.react('❌');
			}
		}
		else warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
