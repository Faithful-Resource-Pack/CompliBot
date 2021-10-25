const { readFile, writeFile } = require('fs').promises
const { join } = require('path')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms)
    }, ms);
  })
}

/**
 * 
 * @param {import('discord.js').Client} client Discord client
 */
exports.restartAutoDestroy = async function (client) {
  readFile(join(process.cwd(), 'json', 'restart_message.txt'))
    .then((buffer) => {
      const res = buffer.toString('utf-8')
      
      return Promise.resolve(res.split('\n'))
    })
    .then(async (ids) => {
      const channel_id = ids[1]
      const msg_id = ids[2]

      const channel = await client.channels.fetch(channel_id);
      const msg = await channel.messages.fetch(msg_id)
      const emb = msg.embeds[0]
      
      for(let i = 5; i > 0; --i) {
        const name = "Reboot successful"
        const value = "This message will self-destruct in " + String(i) + " second" + ((i > 1) ? "s" : "")
        const index = emb.fields.map(fi => fi.name).indexOf(name)
        if(index != -1) {
          emb.spliceFields(index, 1, {name: name, value: value, inline: false })
        } else {
          emb.addField(name, value, false)
        }
        await msg.edit({embeds: [emb]})
        await sleep(1000)
      }

      await msg.delete()

      return Promise.resolve(true)
    })
    .then(() => {
      return writeFile(join(process.cwd(), 'json', 'restart_message.txt'), "")
    })
    .catch(() => {
      // console.trace(err) errors wil happen
    })
}