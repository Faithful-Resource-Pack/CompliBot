/*eslint-env node*/

const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const axios = require('axios').default;
const strings = require('../../res/strings');
const colors = require('../../res/colors');
const settings = require('../../settings.js');
const asyncTools = require('../../helpers/asyncTools.js');

const { magnify } = require('../../functions/magnify.js');
const { palette } = require('../../functions/palette.js');
const { getMeta } = require('../../functions/getMeta.js');
const { warnUser } = require('../../functions/warnUser.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

module.exports = {
  name: 'texture',
  aliases: ['textures'],
  description: strings.HELP_DESC_TEXTURE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  syntax: `${prefix}texture <16/32/64> <texture_name>\n${prefix}texture <16/32/64> <_name>\n${prefix}texture <16/32/64> </folder/>`,
  example: `${prefix}texture 16 dirt`,
  async execute(_client, message, args) {

    const allowed = ['vanilla', 'vanillabedrock', '16', '16j', '16b', '32', '32j', '32b', '64', '64j', '64b', '16x', '16xj', '16xb', '32x', '32xj', '32xb', '64x', '64xj', '64xb'];
    const java    = ['16', '32', '64'];
    const bedrock = ['16b', '32b', '64b'];

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
    if (args[0] === 'vanilla') res = '16';
    if (args[0] === 'vanillabedrock') res = '16b';
    if (args[0] === '16j' || args[0] === '16xj' || args[0] === '16x') res = '16';
    if (args[0] === '32j' || args[0] === '32xj' || args[0] === '32x') res = '32';
    if (args[0] === '64j' || args[0] === '64xj' || args[0] === '64x') res = '64';
    if (args[0] === '16b' || args[0] === '16xb') res = '16b';
    if (args[0] === '32b' || args[0] === '32xb') res = '32b';
    if (args[0] === '64b' || args[0] === '64xb') res = '64b';

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
    }

    console.log(results)

  }
}