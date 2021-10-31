const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'charshift',
  description: strings.command.description.charshift,
  category: 'Fun',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `${prefix}charshift <offset> <text>`,
  example: `${prefix}charshift 5 Devs are awesome`,
  async execute(_client, message, args) {
    if (!args.length || args.length < 2) return warnUser(message, strings.command.args.none_given)
    let offset = parseInt(args.shift())
    if (isNaN(offset)) return warnUser(message, `${strings.command.args.invalid.generic}\nFirst argument must be a number`)
    if (offset < 0) offset += 26

    const str = args.join(' ')
    let output = ''
    for (var i = 0; i < str.length; i++) {
      let c = str[i]
      if (c.match(/[a-z]/i)) {
        var code = str.charCodeAt(i)
        if (code >= 65 && code <= 90) c = String.fromCharCode(((code - 65 + offset) % 26) + 65)
        // Lowercase letters
        else if (code >= 97 && code <= 122) c = String.fromCharCode(((code - 97 + offset) % 26) + 97)
      }
      output += c
    }

    const embed = new Discord.MessageEmbed()
      .setTitle('**' + output + '**')
      .setColor(settings.colors.blue)

    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
