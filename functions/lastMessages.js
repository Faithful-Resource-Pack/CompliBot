require('dotenv').config()

const NB_MESSAGES_MEMORY = process.env.NB_MESSAGES_MEMORY || 5

const lastMessagesURLs = []
let lastMesssageIndex = 0

module.exports = {
  addMessage: function(message) {
    lastMessagesURLs[lastMesssageIndex] = message.url
    lastMesssageIndex = (lastMesssageIndex + 1) % NB_MESSAGES_MEMORY
  },
  getLastMessages: function() {
    return lastMessagesURLs
  }
}