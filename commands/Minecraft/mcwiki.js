const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const settings = require('../../resources/settings')
const colors = require('../../resources/colors')
const { string } = require('../../resources/strings')
const { warnUser } = require('../../helpers/warnUser')
const { default: axios } = require("axios")
const cheerio = require('cheerio')
const html2text = require('html-to-text')

const MC_WIKI_PAGE_PREFIX = 'https://minecraft.fandom.com/wiki/Special:Search?fulltext=1&query='

const HEADERS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
  }
}

module.exports = {
  name: 'mcwiki',
  aliases: ['wiki'],
  description: string('command.description.mcwiki'),
  category: 'Minecraft',
  guildOnly: false,
  uses: string('command.use.anyone'),
  syntax: `${prefix}mcwiki <searchTerms>`,
  example: `${prefix}mcwiki dog\n${prefix}mcwiki Java Edition 1.17.0`,
  /**
   * 
   * @param {Discord.Client} client 
   * @param {Discord.Message} message 
   * @param {String[]} args 
   */
  async execute(_client, message, args) {
    const search = args.join(' ')
    const searchTerm = encodeURI(search)

    const wikiURL = `${MC_WIKI_PAGE_PREFIX}${searchTerm}`
    axios.get(wikiURL, HEADERS)
      .then(res => {
        const $ = cheerio.load(res.data)

        const results = $('.unified-search__results .unified-search__result article h1 a').toArray().map(e => e.attribs.href).filter(e => e != undefined).filter(e => e !== '')

        if (results.length === 0) {
          const error = new Error('No matching result')
          error.res = {
            status: 404
          }
          return Promise.reject(error)
        }
        else {
          return axios.get(results.shift(), HEADERS)
        }

      }).then(res => {
        const $ = cheerio.load(res.data)

        const wikiPage = $('link[rel="canonical"]').attr("href") || ''
        const title = ($('meta[property="og:title"]').attr('content') || '').substring(0, 256)
        const imageURL = $('meta[property="og:image"]').last().attr('content') || ''

        // super useful to convert &lt; to < and &gt; to > // try with Java Edition 1.17.1
        const description = html2text.convert($('meta[name="description"]').attr('content') || '', {
          wordwrap: false
        }).substring(0, 4096)

        const embed = new Discord.MessageEmbed()
          .setAuthor(string('command.mcwiki.embed_link_text'), settings.VANILLA_IMG, wikiPage)
          .setTitle(title)
          .setThumbnail(imageURL)
          .setColor(colors.BLUE)
          .setDescription(description)

        message.reply({ embeds: [embed] })
      })
      .catch(err => {
        if (err.res && err.res.status == 404) {
          return warnUser(message, string('command.mcwiki.no_result_found').replace('%term%', search))
        } else {
          return Promise.reject(err)
        }
      })
  }
};
