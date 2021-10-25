/* eslint-disable no-unreachable */
const prefix = process.env.PREFIX

require('dotenv').config()
const getops = require('getopts')
const strings = require('../../resources/strings')
const { warnUser } = require('../../helpers/warnUser')
const compareFunction = require('../../functions/textures/compare')

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const EDITIONS_ALLOWED = [RES_JAVA, RES_BEDROCK]
const RES_ALLOWED = EDITIONS_ALLOWED.map(e => RES_SIDE.map(el => el + e)).flat()

module.exports = {
  name: 'compare',
  aliases: ['cmp'],
  description: strings.HELP_DESC_COMPARE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Minecraft',
  syntax: `${prefix}compare <search> <--resolution|--res|--r>=<${RES_ALLOWED.join('|')}> [<--scale|--s>=<1..10>]`,
  example: `${prefix}compare bucket --resolution 16j 32j 64j --s=2\n
${prefix}cmp bucket -r 16j 32j 64j -s 10\n
${prefix}cmp bucket 16j 32j 64j -s 2\n
${prefix}cmp --id 1208 16j 32j 64j -s 2`,

  /**
   * @param {import('discord.js').Client} client Incoming Discord client
   * @param {import('discord.js').Message} message Incomming command
   * @param {Array<String>} args Argument array after the command
   */
  async execute (_client, message, args) {
    const parsedArguments = getops(args, {
      alias: {
        id: 'id',
        resolution: ['res', 'r'],
        scale: ['s']
      }
    })

    // give default value to resolutions
    if (!parsedArguments.resolution) parsedArguments.resolution = []

    // else put in array to simplify comparaison
    else if (typeof (parsedArguments.resolution) === 'string') { parsedArguments.resolution = [parsedArguments.resolution] }

    if (!parsedArguments._) { parsedArguments._ = '' }

    const idSearch = !!parsedArguments.id
    let search, id
    if(idSearch) {
      id = parsedArguments.id
      parsedArguments.resolution.push(...parsedArguments._)
    } else {
      const searchTerms = []
      if (typeof (parsedArguments._) === 'string') {
        search = parsedArguments._
      } else {
        parsedArguments._.forEach(el => {
          if (RES_ALLOWED.includes(el)) {
            if(typeof parsedArguments.resolution !== 'string' && !Array.isArray(parsedArguments.resolution)) {
              return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)
            } else {
              if(typeof parsedArguments.resolution === 'string') parsedArguments.resolution = [parsedArguments.resolution]
              parsedArguments.resolution.push(el)
            }
          } else {
            searchTerms.push(el)
          }
        })
  
        search = searchTerms.join(' ')
      }
    }

    /** @type {import('../../functions/textures/compare').CompareOption} */
    const options = {
      response: message,
      scale: parsedArguments.scale
    }

    if(parsedArguments.resolution && parsedArguments.resolution.length) {
      options.resolutions = parsedArguments.resolution
    }

    if(idSearch) {
      options.id = id
    } else {
      options.search = search
    }

    if(message.attachments && message.attachments.size) {
      options.images = message.attachments.map(a => a.url)
    }

    return compareFunction(options)
  }
}
