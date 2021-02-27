/**
 * @brief File made to safely handle files and json more particularly.
 * Goal is to have dynamic paths
 */
const fs = require('fs')
const { dirname, normalize, join, resolve } = require('path')
const { Mutex } = require('async-mutex')

const JSON_WRITE_SPACES = 2
const JSON_WRITE_REPLACER = null

// default values because I am fed up to always set try catches everywhere, unknow paths and I want dynamic paths
const JSON_DEFAULT_MODERATION = []
const JSON_PATH_MODERATION = './json/moderation.json'

const JSON_DEFAULT_CONTRIBUTIONS = []
const JSON_PATH_CONTRIBUTIONS_JAVA = './json/contributors/java.json'
const JSON_PATH_CONTRIBUTIONS_BEDROCK = './json/contributors/bedrock.json'

const JSON_PATH_PROFILES = './json/profiles.json'
const JSON_DEFAULT_PROFILES = []

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// PROS: prevent integer overflow
// CONS: at the end two tickets can have the same number (i dont think you will have 10k simultaneous accesses)
const MAX_TICKETS = 10000

class FileHandler {
  constructor(filepath, defaultValue = '', isJson = true) {
    this.filepath = filepath
    this.isJson = isJson
    this.defaultValue = defaultValue

    // time to go serious with mutex locks
    // if you are curious https://www.youtube.com/watch?v=9lAuS6jsDgE
    this.mutex = new Mutex();
    this.release = undefined
  }

  read(lock = true) {
    return new Promise((resolve, reject) => {
      if(!lock) {
        // if no lock, go on, take the file and get out
        try {
          let res = fs.readFileSync(this.filepath)
          
          if(this.isJson) res = JSON.parse(res)

          resolve(res)
        } catch (error) {
          // if no file found, give default
          if(error.code === 'ENOENT') {
            resolve(this.defaultValue)
          } else {
            console.error(error)
            reject(error)
          }
        }

        return
      }

      // else we will have a problem

      // the mutex is a lock and you need to acquuire it to be authorized to do an action
      this.mutex.acquire()
      .then((release) => {

        // wow you have the lock, now get the file, release and get out
        try {
          let res = fs.readFileSync(this.filepath)
          
          if(this.isJson) res = JSON.parse(res)

          // yeah yeah store the release function
          this.release = release
          resolve(res)
        } catch (error) {
          // if no file found, give default
          if(error.code === 'ENOENT') {
            resolve(this.defaultValue)
          } else {
            console.error(error)

            // if there is a real error, release it then and reject
            release()
            reject(error) 
          }
        }
      })
      .catch((err) => {
        // should never, never happend, but we don't know
        reject(err)
      })
    })
  }

  write(content) {
    // create the folders recusively if not existing
    fs.mkdirSync(dirname(this.filepath), { recursive: true })

    // this content is transformed in JSON if needed
    if(content !== 'string' && this.isJson)
      content = JSON.stringify(content, JSON_WRITE_REPLACER, JSON_WRITE_SPACES)

    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(join(process.cwd(), normalize(this.filepath)), content, { flag: 'w' })

        // write and release
        if(this.release)
          this.release()

        resolve()
      } catch (error) {
        this.release()
        reject(error)
      }
    })
  }
}

module.exports = {
  FileHandler : FileHandler,

  jsonContributionsBedrock: new FileHandler(JSON_PATH_CONTRIBUTIONS_BEDROCK, JSON_DEFAULT_CONTRIBUTIONS),
  jsonContributionsJava: new FileHandler(JSON_PATH_CONTRIBUTIONS_JAVA, JSON_DEFAULT_CONTRIBUTIONS),
  jsonModeration: new FileHandler(JSON_PATH_MODERATION, JSON_DEFAULT_MODERATION, true),
  jsonProfiles: new FileHandler(JSON_PATH_PROFILES, JSON_DEFAULT_PROFILES)
}