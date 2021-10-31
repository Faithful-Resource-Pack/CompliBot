/* eslint-disable no-unused-vars */
/* global Buffer */

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const https = require('https')

const textures = require('../../helpers/firestorm/texture')
const paths = require('../../helpers/firestorm/texture_paths')
const { sorterMC } = require('../../helpers/sorterMC')

module.exports = {
  /**
   * 
   * @param {String} search Search string
   * @returns {Promise} Results found
   */
  find: function (search) {
    return new Promise(function (resolve, reject) {
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
            if (results.length !== 0) return Promise.resolve(results)
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
  pathToTextureURL: function (path, edition, res, version = undefined) {
    if (edition.toLowerCase() === 'java') {
      if (res == 16) return settings.repositories.raw.default.java + (version === undefined ? settings.versions.java.sort(sorterMC)[0] : version) + '/' + path
      if (res == 32) return settings.repositories.raw.c32.java + 'Jappa-' + (version === undefined ? settings.versions.java.sort(sorterMC)[0] : version) + '/' + path
      if (res == 64) return settings.repositories.raw.c64.java + 'Jappa-' + (version === undefined ? settings.versions.java.sort(sorterMC)[0] : version) + '/' + path
    }
    else if (edition.toLowerCase() === 'bedrock') {
      if (res == 16) return settings.repositories.raw.default.bedrock + (version === undefined ? settings.versions.bedrock[0] : version) + '/' + path
      if (res == 32) return settings.repositories.raw.c32.bedrock + 'Jappa-' + (version === undefined ? settings.versions.bedrock[0] : version) + '/' + path
      if (res == 64) return settings.repositories.raw.c64.bedrock + 'Jappa-' + (version === undefined ? settings.versions.bedrock[0] : version) + '/' + path
    }

    throw new Error(strings.command.args.invalid.generic)
  },
  /**
   * @param {String} imageURL Image url to get buffer
   * @return {Promise<Buffer>}
   */
  imageUrlToTextureBuffer: function (imageURL) {
    return new Promise((resolve, reject) => {
      https.get(imageURL, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
          chunks.push(chunk)
        }).on('end', function () {
          try {
            const buffer = Buffer.concat(chunks)
            resolve(buffer)
          } catch (error) {
            reject(error)
          }
        })
      }).on('error', function (error) {
        reject(error)
      })
    })
  }
}