/*eslint-env node*/

const prefix = process.env.PREFIX;

const Discord    = require('discord.js');
const axios      = require('axios').default;
const strings    = require('../../res/strings');
const colors     = require('../../res/colors');
const settings   = require('../../settings.js');
const asyncTools = require('../../helpers/asyncTools.js');

const { magnify }  = require('../../functions/magnify.js');
const { palette }  = require('../../functions/palette.js');
const { getMeta }  = require('../../functions/getMeta.js');
const { warnUser } = require('../../functions/warnUser.js');
const { timestampConverter } = require ('../../functions/timestampConverter');

const allowed = ['vanilla', '16', '32', '64'];
const used = ['16', '32', '64'];

module.exports = {
  name: 'texture',
  aliases: ['textures'],
  description: strings.HELP_DESC_TEXTURE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  syntax: `${prefix}texture <16/32/64> <texture_name>\n${prefix}texture <16/32/64> <_name>\n${prefix}texture <16/32/64> </folder/>`,
  example: `${prefix}texture 16 dirt`,
  async execute(_client, message, args) {

    let results    = []
    const textures = require('../../helpers/firestorm/texture')
    const paths    = require('../../helpers/firestorm/texture_paths')

    // no args given
    if (args == '') return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

    let res    = args[0]
    let search = args[1]

    // no valids args given
    if (!allowed.includes(args[0])) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)
    // no search field given
    if (!args[1]) return warnUser(message, strings.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN)
    else args[1] = String(args[1])

    // universal args
    if (args[0].includes('16') || args[0] === 'vanilla') res = '16'
    if (args[0].includes('32')) res = '32'
    if (args[0].includes('64')) res = '64'

    // partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
    if (search.startsWith('_')) {
      results = await textures.search([{
        field: "name",
        criteria: "includes",
        value: search
      }])
    }
    // looking for path + texture (block/stone -> stone)
    else if (search.endsWith('/')) {
      results = await paths.search([{
        field: "path",
        criteria: "includes",
        value: search
      }])
    }
    // looking for all exact matches (stone -> stone.png)
    else {
      results = await textures.search([{
        field: "name",
        criteria: "==",
        value: search
      }])

      if(results.length == 0) {
        // no equal result, searching with includes
        results = await textures.search([{
          field: "name",
          criteria: 'includes',
          value: search
        }])
      }
    }

    if (results.length > 1) getMultipleTexture(message, results, search, res)
    else if (results.length == 1) getTexture(message, res, results[0])
    else return await warnUser(message, strings.TEXTURE_DOESNT_EXIST)
  }
}

/**
 * TODO : make this function in it's own file?
 * Show an embed an let the user choose which texture he wiould to see
 * @param {DiscordMessage} message discord message
 * @param {Array} results array of textures
 * @param {String} search texture name search
 * @param {String} res texture resolution
 */
async function getMultipleTexture(message, results, search, res) {
  const emoji_num = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']

  var embed = new Discord.MessageEmbed()
    //.setAuthor('Note: this command isn\'t updated for 21w20a yet')
    .setTitle(`${results.length} results, react to choose one!`)
		.setColor(colors.BLUE)
    .setFooter(message.client.user.username, settings.BOT_IMG)

  var description = strings.TEXTURE_SEARCH_DESCRIPTION

  for (let i = 0; i < results.length; i++) {
    if (i < emoji_num.length) {
      let uses     = await results[i].uses()
      let paths    = await uses[0].paths()
      
      description += `${emoji_num[i]} — \`[#${results[i].id}]\` ${paths[0].path.replace(search, `**${search}**`).replace(/_/g, '＿')}\n`
    }
  }
  embed.setDescription(description)

  const embedMessage = await message.inlineReply(embed)
  asyncTools.react(embedMessage, emoji_num.slice(0, results.length))

  const filter_num = (reaction, user) => {
    return emoji_num.includes(reaction.emoji.name) && user.id === message.author.id
  }

  embedMessage.awaitReactions(filter_num, { max: 1, time: 60000, errors: ['time'] })
  .then(async collected => {
    const reaction = collected.first()
    if (emoji_num.includes(reaction.emoji.name)) {
      embedMessage.delete()
      return getTexture(message, res, results[emoji_num.indexOf(reaction.emoji.name)])
    }
  }).catch(async () => {
    for (let i = 0; i < results.length; i++) {
      if (i < emoji_num.length) {
        if (message.channel.type !== 'dm') embedMessage.reactions.cache.get(emoji_num[i]).remove()
      }
    }
  })
}

/**
 * TODO: make this function in it's own file?
 * Show the asked texture
 * @param {String} res texture resolution
 * @param {Object} texture
 */
async function getTexture(message, res, texture) {
  var imgURL = undefined;

  const uses  = await texture.uses()
  const paths = await uses[0].paths()
  const path  = paths[0].path

  if (res == '16') imgURL = settings.DEFAULT_MC_JAVA_TEXTURE + path;
  if (res == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/' + path;
  if (res == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/' + path;
  
  if (path.startsWith('textures')) { // hacks to get the right url with bedrock textures
    if (res == '16') imgURL = settings.DEFAULT_MC_BEDROCK_TEXTURE + path;
    if (res == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-1.16.200/' + path;
    if (res == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-1.16.200/' + path;
  }

  axios.get(imgURL).then((response) => {
    getMeta(imgURL).then(async dimension => {
      const size = dimension.width + '×' + dimension.height;

      var embed = new Discord.MessageEmbed()
        .setTitle(`[#${texture.id}] ${path}`)
        .setColor(colors.BLUE)
        .setURL(imgURL)
        .setImage(imgURL)
        .addField('Resolution:', size,true)

      if (res === '16' || res === '16b') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
      if (res === '32' || res === '32b') embed.setFooter('Compliance 32x', settings.C32_IMG)
      if (res === '64' || res === '64b') embed.setFooter('Compliance 64x', settings.C64_IMG)

      let lastContribution = await texture.lastContribution((res == '32' || res == '64') ? 'c'+res : undefined);
      let contributors = lastContribution ? lastContribution.contributors.map(contributor => { return `<@!${contributor}>` }) : 'None'
      let date = lastContribution ? timestampConverter(lastContribution.date) : 'None'

      if (res != '16') {
        embed.addFields(
          //{ name: 'Author(s)', value: contributors, inline: true },
          { name: 'Added', value: date, inline: true }
        )
      }

      embed.addField('Edition', path.startsWith('textures') ? 'Bedrock': 'Java', true)

      const embedMessage = await message.inlineReply(embed);
      embedMessage.react('🗑️');
      if (dimension.width <= 128 && dimension.height <= 128) {
        embedMessage.react('🔎');
      }
      embedMessage.react('🌀');
      embedMessage.react('🎨');

      const filter = (reaction, user) => {
        return ['🗑️', '🔎', '🌀', '🎨'].includes(reaction.emoji.name) && user.id === message.author.id;
      };

      embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first()
        if (reaction.emoji.name === '🗑️') {
          if (!embedMessage.deleted) embedMessage.delete()
          if (!message.deleted) message.delete()
        }
        if (reaction.emoji.name === '🎨') {
          return palette(embedMessage, embedMessage.embeds[0].image.url)
        }
        if (reaction.emoji.name === '🔎') {
          return magnify(embedMessage, embedMessage.embeds[0].image.url)
        }
        if (reaction.emoji.name === '🌀' && used.includes(res)) {
          if (!embedMessage.deleted) embedMessage.delete()
          return getTexture(message, used[(used.indexOf(res) + 1) % used.length], texture)
        }
      })
      .catch(async () => {
        if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
        if (dimension.width <= 128 && dimension.height <= 128) {
          if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🔎').remove()
        }
        if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🌀').remove()
        if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🎨').remove()
      })

    })
  }).catch((error) => {
    return warnUser(message, strings.TEXTURE_FAILED_LOADING + '\n' + error)
  })
}