module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	args: true,
	execute(message, args) {
    if(message.member.roles.cache.some(r=>["God", "Mod", "Server Manager"].includes(r.name)) ) {
		  const commandName = args[0].toLowerCase();
		  const command = message.client.commands.get(commandName)
		  	|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		  if (!command) {
        message.react('❌')
        return message.reply(`there is no command with name or alias \`${commandName}\`!`).then(msg => {
          msg.delete({timeout: 30000});
        });
		  }

		  delete require.cache[require.resolve(`./${command.name}.js`)];

		  try {
		  	const newCommand = require(`./${command.name}.js`);
		  	message.client.commands.set(newCommand.name, newCommand);
		  	message.react('✅')
		  } catch (error) {
		  	console.error(error);
		  	message.react('❌')
		  }
    } else {
      message.react('❌')
      message.reply("You don't have the permission to do that!").then(msg => {
          msg.delete({timeout: 30000});
        });
    }
	}
};