/**
 * @brief File made to safely handle files and json more particularly.
 * Goal is to have dynamic paths
 */
const fs = require('fs')
const { dirname } = require('path')

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

    // operations queue
    this.ticket = 0
    this.currentTicket = 0

    // ESSENTIAL because always by pair
    this.locked = false
  }

  _getTicket() {
    // prevent overflow
    const res = this.ticket % MAX_TICKETS

    // update ticket number
    this.ticket = (res + 1) % MAX_TICKETS

    return res
  }

  _increaseTicket() {
    // prevent overflow
    this.currentTicket = (this.currentTicket + 1) % MAX_TICKETS
  }

  read(lock = true) {
    // you cannot get a ticket while someone is reading, because the following must be a write ticket
    while(this.locked){}

    // get a ticket
    let ticket = this._getTicket()

    // waiting my turn
    while(ticket != this.currentTicket) {}

    // now I am reading, and no one will occ
    if(lock)
      this.locked = true

    let fileContent
    let err = undefined
    try {
      fileContent = fs.readFileSync(this.filepath)

      if(this.isJson) {
        fileContent = JSON.parse(fileContent)
      }
    } catch (_error) {
      fileContent = this.defaultValue
    }

    // ALWAYS ALWAYS increase current ticket
    this._increaseTicket()

    // eventually return value
    return fileContent
  }

  write(content, unlock=true) {
    // get a ticket
    // the ticket following a read ticket is always a write ticket from the same script
    let ticket = this._getTicket()

    // create the folders recusively
    fs.mkdirSync(dirname(this.filepath), { recursive: true })

    // this content is transformed in JSON if needed
    if(content !== 'string' && this.isJson)
      content = JSON.stringify(content, JSON_WRITE_REPLACER, JSON_WRITE_SPACES)

    while(ticket != this.currentTicket){}

    let err = undefined
    try {
      fs.writeFileSync(this.filepath, content, { flag: 'w' })
    } catch (error) {
      err = error
    }

    // ALWAYS ALWAYS increase current ticket
    this._increaseTicket()

    // unlock if necessary
    if(unlock)
      this.locked = false

    // throw error after increasing ticket
    if(err)
      throw err
  }
}

module.exports = {
  FileHandler : FileHandler,

  jsonContributionsBedrock: new FileHandler(JSON_PATH_CONTRIBUTIONS_BEDROCK, JSON_DEFAULT_CONTRIBUTIONS),
  jsonContributionsJava: new FileHandler(JSON_PATH_CONTRIBUTIONS_JAVA, JSON_DEFAULT_CONTRIBUTIONS),
  jsonModeration: new FileHandler(JSON_PATH_MODERATION, JSON_DEFAULT_MODERATION, true),
  jsonProfiles: new FileHandler(JSON_PATH_PROFILES, JSON_DEFAULT_PROFILES)
}