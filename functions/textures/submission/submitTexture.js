const { warnUser } = require("../../warnUser")
const Discord  = require('discord.js')
const settings = require('../../../settings')
const colors   = require('../../../res/colors')
const strings  = require('../../../res/strings')
/**
 * Check if the given texture exist, and embed it if true
 * @param {DiscordMessage} message
 */
async function submitTexture(message) {
  let args = message.content.split(' ')
  let id = args.filter(el => el.startsWith('[#') && el.endsWith(']') && !isNaN(el.slice(2).slice(0, -1))).map(el => el.slice(2).slice(0, -1))
  id = id[0]

  let name = args.filter(el => el.startsWith('[') && el.endsWith(']')).map(el => el.slice(1).slice(0, -1))
  name = name[0]

  if (!id && !name) return invalidSubmission(message, 'No valid id/name given')
  
  console.log(id, name)
}

async function invalidSubmission(message) {
  //if (message.member.hasPermission('ADMINISTRATOR')) return
  
  try {
    var embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor(colors.RED)
      .setTitle(strings.BOT_AUTOREACT_ERROR)
      .setFooter('Submission will be removed in 30 seconds, please re-submit', settings.BOT_IMG)

    const msg = await message.inlineReply(embed);
    if (!msg.deleted) await msg.delete({ timeout: 30000 })
    if (!message.deleted) await message.delete({ timeout: 10 })
  } catch (error) {
    console.error(error)
  }
}

exports.submitTexture = submitTexture