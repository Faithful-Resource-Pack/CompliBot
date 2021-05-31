/* eslint-disable no-unused-vars */
/* global Buffer */

const strings  = require('../../ressources/strings')
const settings = require('../../ressources/settings')
const https    = require('https')

const { FileHandler, jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler')

/**
 * @typedef {Object} SearchResult
 * @property {Number} index Content index in JSON
 * @property {Object} raw Raw content of element in JSON
 * @property {String} path Full texture path
 * @property {String?} bedrockPath Full texture path
 * @property {String} criteria Context criteria chosen
 */

/**
 * @typedef {Object} AllResults
 * @property {SearchResult[]} java
 * @property {SearchResult[]} bedrock
 */

module.exports =  {
  /**
   * 
   * @param {String} search Search string
   * @returns {Promise<AllResults>} Results found
   */
  find: function(search) {
    return new Promise((resolve, reject) => {
      /** @type {AllResults} */
      let res = {}
      let finished = 0

      this.findJava(search)
      .then(results => {
        res.java = results
      })
      .catch(() => {
        res.java = []
      })
      .finally(() => {
        ++finished
        if(finished == 2) {
          if(res.length) resolve(res)
          reject()
        }
      })

      this.findBedrock(search)
      .then(results => {
        res.bedrock = results
      })
      .catch(() => {
        res.bedrock = []
      })
      .finally(() => {
        ++finished
        if(finished == 2) {
          if(res.length) resolve(res)
          reject()
        }
      })
    })
  },

  /**
   * 
   * @param {Object} content File content to search
   * @param {Function} path Path indice
   * @param {Function} criteria Arrow function to get criteria
   * @param {String} search Search term you are comparing
   * @param {Boolean?} [start = False] Filter with StartWith
   * @return {Promise<Array<SearchResult>>}
   */
  beginSearch: function(content, path, criteria, search, start = false) {
    /** @type {Array<SearchResult>} */
    const searchItems = content.map((el, index) => {
      /** @type {SearchResult} */
      const res = {
        index: index,
        raw: el,
        path: '',
        criteria: ''
      }

      // added bedrock path to search
      if(el.isBedrock) {
        res.bedrockPath = el.bedrock[strings.LATEST_MC_BE_VERSION]
      }

      try {
        res.path = path(el)
        res.criteria = criteria(res.path)
      // eslint-disable-next-line no-empty
      } catch (_error) {}

      return res
    }).filter(item => item.path)

    const results = start ? searchItems.filter(item => item.criteria.startsWith(search)) : searchItems.filter(item => item.criteria.includes(search))

    return (results && results.length) ? results : []
  },

  /**
   * 
   * @param {String} search Search string
   * @returns {Promise<SearchResult[]>} Results found
   */
  findJava: function(search) {
    return new Promise((resolve, reject) => {
      jsonContributionsJava.read(false)
      .then(content => {
        let res = []
        if(search.startsWith('_'))
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_JE_VERSION], path => path.split("/").pop(), search)]
        else if(search.endsWith('/'))
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_JE_VERSION], path => path, search)]
        else
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_JE_VERSION], path => path.split("/").pop(), search, true)]

        if(res.length)
          resolve(res)
        reject(new Error(strings.TEXTURE_DOESNT_EXIST))
      })
      .catch(err => reject(err))
    })
  },

  /**
   * 
   * @param {String} search Search string
   * @returns {Promise<SearchResult[]>} Results found
   */
  findBedrock: function(search) {
    return new Promise((resolve, reject) => {
      jsonContributionsBedrock.read(false)
      .then(content => {
        let res = []
        if(search.startsWith('_'))
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_BE_VERSION], path => path.split("/").pop(), search)]
        else if(search.endsWith('/'))
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_BE_VERSION], path => path, search)]
        else
          res = [ ...res, ...this.beginSearch(content, tex => tex.version[strings.LATEST_MC_BE_VERSION], path => path.split("/").pop(), search, true)]

        if(res.length)
          resolve(res)
        reject(new Error(strings.TEXTURE_DOESNT_EXIST))
      })
      .catch(err => reject(err))
    })
  },

  /**
   * @param {String} path Texture path
   * @param {String} edition Resource pack edition
   * @param {Number} res Texture resolution
   */
  pathToTextureURL: function(path, edition, res) {
    if(edition.toLowerCase() === 'java') {
      if (res == 16)  return settings.DEFAULT_MC_JAVA_TEXTURE + path
      if (res == 32)  return 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/' + path
      if (res == 64)  return 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/' + path
    } else {
      if (res == 16) return settings.DEFAULT_MC_BEDROCK_TEXTURE + path
      if (res == 32) return 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-1.16.200/' + path
      if (res == 64) return 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-1.16.200/' + path
    }

    throw(new Error(strings.COMMAND_WRONG_ARGUMENTS_GIVEN))
  },
  /**
   * @param {String} imageURL Image url to get buffer
   * @return {Promise<Buffer>}
   */
  imageUrlToTextureBuffer: function(imageURL) {
    return new Promise((resolve, reject) => {
      https.get(imageURL, function(response) {
        const chunks = []
        response.on('data', function(chunk) {
          chunks.push(chunk)
        }).on('end', function() {
          try {
            const buffer = Buffer.concat(chunks)
            resolve(buffer)
          } catch(error) {
            reject(error)
          }
        })
      }).on('error', function(error) {
        reject(error)
      })
    })
  }
}