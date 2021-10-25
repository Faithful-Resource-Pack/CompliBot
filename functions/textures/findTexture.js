/* eslint-disable no-unused-vars */
/* global Buffer */

const strings  = require('../../resources/strings')
const settings = require('../../resources/settings')
const https    = require('https')

const textures = require('../../helpers/firestorm/texture')
const paths = require('../../helpers/firestorm/texture_paths')

module.exports =  {
  /**
   * 
   * @param {String} search Search string
   * @returns {Promise} Results found
   */
  find: function(search) {
    return new Promise(function(resolve, reject) {
      const result = undefined
      let prom = undefined
      if (search.startsWith('_') || search.endsWith('_')) {
        prom = textures.search([{
          field: "name",
          criteria: "includes",
          value: search
        }])
      }
      // looking for path + texture (block/stone -> stone)
      else if (search.startsWith('/') || search.endsWith('/')) {
        prom = paths.search([{
          field: "path",
          criteria: "includes",
          value: search
        }])
        .then(async (results) => {
          // transform paths results into textures
          let output = new Array()
          for (let i = 0; results[i]; i++) {
            let texture
            try {
              let use = await results[i].use()
              texture = await textures.get(use.textureID)
            } catch (err) { return reject(err) }
            output.push(texture)
          }
          
          return Promise.resolve(output)
        })
      }
      // looking for all exact matches (stone -> stone.png)
      else {
        prom = textures.search([{
          field: "name",
          criteria: "==",
          value: search
        }])
        .then(results => {
          if(results.length !== 0) return Promise.resolve(results)
          else return textures.search([{
            field: "name",
            criteria: 'includes',
            value: search
          }])
        })
      }

      prom.then(results => {
        resolve(results)
      })
      .catch(err => reject(err))
    })
  },

  /**
   * @param {String} path Texture path
   * @param {String} edition Resource pack edition
   * @param {Number} res Texture resolution
   * @param {String} version Minecraft version (1.17, 1.16.220)
   */
  pathToTextureURL: function(path, edition, res, version = undefined) {
    if(edition.toLowerCase() === 'java') {
      if (res == 16) return settings.DEFAULT_MC_JAVA_REPOSITORY + (version === undefined ? settings.LATEST_MC_JE_VERSION : version) + '/' + path
      if (res == 32) return settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA + (version === undefined ? settings.LATEST_MC_JE_VERSION : version) + '/' + path
      if (res == 64) return settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA + (version === undefined ? settings.LATEST_MC_JE_VERSION : version) + '/' + path
    }
    else if (edition.toLowerCase() === 'bedrock') {
      if (res == 16) return settings.DEFAULT_MC_BEDROCK_REPOSITORY + (version === undefined ? settings.LATEST_MC_BE_VERSION : version) + '/' + path
      if (res == 32) return settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA + (version === undefined ? settings.LATEST_MC_BE_VERSION : version) + '/' + path
      if (res == 64) return settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA + (version === undefined ? settings.LATEST_MC_BE_VERSION : version) + '/' + path
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