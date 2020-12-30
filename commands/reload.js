const prefix = process.env.PREFIX;

const speech   = require('../messages.js');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'reload',
	aliases: ['r'],
	description: 'Reloads a command',
	uses: 'Bot Developers',
	syntax: `${prefix}reload <command>`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			const commandName = args[0].toLowerCase();
			const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) return warnUser(message,`There is no command with name or alias \`${commandName}\`!`);

			delete require.cache[require.resolve(`./${command.name}.js`)];

			try {
				const newCommand = require(`./${command.name}.js`);
				message.client.commands.set(newCommand.name, newCommand);
				await message.react('✅');
			} catch (error) {
				console.error(error);
				await message.react('❌');
			}
		}
		else warnUser(message,speech.COMMAND_NO_PERMISSION);
	}
};
