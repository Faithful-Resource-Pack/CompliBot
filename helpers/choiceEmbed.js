const Discord    = require('discord.js')
const asyncTools = require('./asyncTools')
const settings   = require('../settings')
const colors     = require('../res/colors')

/**
 * 
 * @typedef {Object} ChoiceParameter
 * @property {String?} title Embed title
 * @property {String?} [separator=' — '] Emoji proposition separator
 * @property {(Array<String>|Object.<string, string>)} propositions Array or Set of emojis and propositions
 * @property {String?} footer Embed footer
 * @property {String?} imageURL Embed footer image URL
 * @property {Number?} [max=1] Max number of emojis
 * @property {Number?} [timeout=60000] Timeout in ms,
 */

/**
 * @typedef {Object} ChoiceResponse
 * @property {Number} index Result choice index
 * @property {String} emoji Result choice Emoji
 * @property {String} proposition Result choice proposition
 */

/**
 * @type {ChoiceParameter}
 */
const DEFAULT = {
  title: 'Choose proposition',
  description: 'Please choose one result using the associated reaction.\n',
  footer: 'chooseEmbed',
  color: colors.BLUE,
  max: 1,
  separator: ' — ',
  imageURL: settings.BOT_IMG,
  timeout: 60000
}

const DEFAULT_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']

/**
 * @author TheRolf
 * @param {Discord.Message} message Received message
 * @param {ChoiceParameter} params Settings
 * @return {Promise<ChoiceResponse>}
 */
module.exports = function(message, params) {
  return new Promise((resolve, reject) => {
    params = Object.assign({}, DEFAULT, params)

    if(!params.propositions) reject(new Error('No proposition in object'))

    let embed = new Discord.MessageEmbed()
      .setTitle(params.title)
      .setColor(params.color)
    
    if(params.imageURL)
      embed = embed.setFooter(params.footer, params.imageURL)
    else
      embed = embed.setFooter(params.footer)

    // popositions object
    let propObj
    if(Array.isArray(params.propositions)) {
      propObj = {}
      for(let i = 0; i < Math.min(params.propositions.length, DEFAULT_EMOJIS.length); ++i) {
        propObj[DEFAULT_EMOJIS[i]] = params.propositions[i]
      }
    } else {
      propObj = params.propositions
    }

    // create description
    let description = [params.description]
    const emojis = Object.keys(propObj)
    emojis.forEach(emoji => {
      description.push(`${emoji}${params.separator}${propObj[emoji]}`)
    })
    description = description.join('\n')

    if (description.length >= 2048) {
      description = description.slice(0, 2048)
      embed.addField('⚠️ WARNING', 'This description is too long for Discord Embeds (>2048), some elements have been deleted!', true)
    }

    embed.setDescription(description)

    // reply to the sent message
    /** @type {Discord.Message} */
    let embedMessage
    message.inlineReply(embed)
    .then(async function(embed_message) {
      embedMessage = embed_message
      return asyncTools.react(embedMessage, emojis)
    })
    .then(() => {
      const filter_num = (reaction, user) => {
        return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
      }

      return embedMessage.awaitReactions(filter_num, { max: params.max, time: params.timeout, errors: ['time'] })
    })
    .then(collected => {
      /** @type {Discord.MessageReaction} */
      const reaction = collected.first()
      if (emojis.includes(reaction.emoji.name)) {
        embedMessage.delete()

        /** @type {ChoiceResponse} */
        resolve({
          index: emojis.indexOf(reaction.emoji.name),
          emoji: reaction.emoji.name,
          proposition: propObj[reaction.emoji.name]
        })
        return
      }
    }).catch(error => {
      reject(error, embedMessage)
    })
  })
}