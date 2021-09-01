const client = require('../index').Client

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (!client.commands.has(interaction.commandName)) return;

    try {
      await client.commands.get(interaction.commandName).execute(interaction)
    } catch (err) {
      console.trace(err)
      return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
}