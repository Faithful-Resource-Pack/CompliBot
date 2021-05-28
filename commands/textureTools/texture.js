/*eslint-env node*/

const prefix = process.env.PREFIX;

const Discord     = require('discord.js');
const axios       = require('axios').default;
const strings     = require('../../res/strings');
const colors      = require('../../res/colors');
const settings    = require('../../settings.js');
const asyncTools  = require('../../helpers/asyncTools.js');
const choiceEmbed = require('../../helpers/choiceEmbed')

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

		var waitEmbed = new Discord.MessageEmbed()
        .setTitle(`Searching for your texture, please wait...`)
        .setColor(colors.BLUE)
		const waitEmbedMessage = await message.inlineReply(waitEmbed);

    // partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
    if (search.startsWith('_') || search.endsWith('_')) {
      results = await textures.search([{
        field: "name",
        criteria: "includes",
        value: search
      }])
    }
    // looking for path + texture (block/stone -> stone)
    else if (search.startsWith('/') || search.endsWith('/')) {
      results = await paths.search([{
        field: "path",
        criteria: "includes",
        value: search
      }])
      // transform paths results into textures
      let output = new Array()
      for (let i = 0; results[i]; i++) {
        let use = await results[i].use()
        output.push(await textures.get(use.textureID))
      }
      results = output
    }
    // looking for all exact matches (stone -> stone.png)
    else {
      results = await textures.search([{
        field: "name",
        criteria: "==",
        value: search
      }])

      if (results.length == 0) {
        // no equal result, searching with includes
        results = await textures.search([{
          field: "name",
          criteria: 'includes',
          value: search
        }])
      }
    }

    if (results.length > 1) {

      let choice = [];
      for (let i = 0; results[i]; i++) {
        let uses = await results[i].uses()
        let paths = await uses[0].paths()

        choice.push(`\`[#${results[i].id}]\` ${results[i].name.replace(search, `**${search}**`).replace(/_/g, '\\_')} — ${paths[0].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
      }

			if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
      choiceEmbed(message, {
        title: `${results.length} results, react to choose one!`,
        description: strings.TEXTURE_SEARCH_DESCRIPTION,
        footer: `${message.client.user.username}`,
        propositions: choice
      })
      .then(choice => {
        return getTexture(message, res, results[choice.index])
      })
      .catch((message, error) => {
        if (process.env.DEBUG) console.error(message, error)
      })
    }
    else if (results.length == 1) {
			await getTexture(message, res, results[0])
			if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
		}
    else {
			await warnUser(message, strings.TEXTURE_DOESNT_EXIST)
			if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
		}
  }
}

/**
 * TODO: make this function in it's own file?
 * Show the asked texture
 * @param {String} res texture resolution
 * @param {Object} texture
 */
async function getTexture(message, res, texture) {
  var imgURL = undefined;

  const uses = await texture.uses()
  const path = (await uses[0].paths())[0].path

  let pathsText = []
  for (let x = 0; uses[x]; x++) {
    let paths = await uses[x].paths()
    for (let i = 0; paths[i]; i++) pathsText.push(`\`[${paths[i].versions[paths[i].versions.length - 1]}+]\` ${paths[i].path}`)
  }

  if (res == '16') imgURL = settings.DEFAULT_MC_JAVA_TEXTURE + path;
  if (res == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-' + strings.LATEST_MC_JE_VERSION + '/assets/' + path;
  if (res == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-' + strings.LATEST_MC_JE_VERSION + '/assets/' + path;
  
  if (path.startsWith('textures')) { // hacks to get the right url with bedrock textures
    if (res == '16') imgURL = settings.DEFAULT_MC_BEDROCK_TEXTURE + path;
    if (res == '32') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-' + strings.LATEST_MC_BE_VERSION + '/' + path;
    if (res == '64') imgURL = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-' + strings.LATEST_MC_BE_VERSION + '/' + path;
  }

  axios.get(imgURL).then(() => {
    getMeta(imgURL).then(async dimension => {
      const size = dimension.width + '×' + dimension.height;

      var embed = new Discord.MessageEmbed()
				.setAuthor('Note: this command isn\'t updated for 1.17 Pre-Release 1 yet')
        .setTitle(`[#${texture.id}] ${texture.name}`)
        .setColor(colors.BLUE)
        //.setURL(imgURL) TODO: add a link to the website gallery where more information could be found about the texture
        .setImage(imgURL)
        .addField('Resolution:', size,true)

      if (res === '16' || res === '16b') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
      if (res === '32' || res === '32b') embed.setFooter('Compliance 32x', settings.C32_IMG)
      if (res === '64' || res === '64b') embed.setFooter('Compliance 64x', settings.C64_IMG)

      let lastContribution = await texture.lastContribution((res == '32' || res == '64') ? `c${res}` : undefined);
      let contributors = lastContribution ? lastContribution.contributors.map(contributor => { return `<@!${contributor}>` }) : 'None'
      let date = lastContribution ? timestampConverter(lastContribution.date) : 'None'

      /**
       * TODO: fix the authors using the new database first
       */
      /*if (res != '16') {
        embed.addFields(
          { name: 'Author(s)', value: contributors, inline: true },
          { name: 'Added', value: date, inline: true },
        )
			}*/
      embed.addField('Paths', pathsText.join('\n'), false)

      const embedMessage = await message.inlineReply(embed);
      await embedMessage.react('🗑️');
      if (dimension.width <= 128 && dimension.height <= 128) {
        await embedMessage.react('🔎');
      }
      await embedMessage.react('🌀');
      await embedMessage.react('🎨');

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
          if (!embedMessage.deleted) await embedMessage.delete()
          return getTexture(message, used[(used.indexOf(res) + 1) % used.length], texture)
        }
      })
      .catch(async () => {
        if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
        if (dimension.width <= 128 && dimension.height <= 128) {
          if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🔎').remove()
        }
        if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🌀').remove()
        if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🎨').remove()
      })

    })
  }).catch((error) => {
    return warnUser(message, strings.TEXTURE_FAILED_LOADING + '\n' + error + `: [link](${imgURL})`)
  })
}