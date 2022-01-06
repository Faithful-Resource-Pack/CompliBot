const client = require('../index').Client
const cron = require('cron')

const DEV = (process.env.DEV.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')
const PREFIX = process.env.PREFIX

const jiraJE = require('../functions/minecraftUpdates/jira-je')
const jiraBE = require('../functions/minecraftUpdates/jira-be')
const minecraft = require('../functions/minecraftUpdates/minecraft')

const settings = require('../resources/settings.json')

const { retrieveSubmission } = require('../functions/textures/submission/retrieveSubmission')
const { councilSubmission } = require('../functions/textures/submission/councilSubmission')
const { revoteSubmission } = require('../functions/textures/submission/revoteSubmission')
const { downloadResults } = require('../functions/textures/admission/downloadResults')
const { pushTextures } = require('../functions/textures/admission/pushTextures')

const { updateMembers } = require('../functions/moderation/updateMembers')
const { syncMembers } = require('../functions/moderation/syncMembers')
const { checkTimeout } = require('../functions/moderation/checkTimeout')
const { restartAutoDestroy } = require('../functions/restartAutoDestroy')
const { saveDB } = require('../functions/saveDB')
const { doCheckLang } = require('../functions/strings/doCheckLang')
const { doCheckSettings } = require('../functions/settings/doCheckSettings')
const { computeAndUpdate } = require('../commands/Compliance/missing')
const unhandledRejection = require('./unhandledRejection')

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob('0 0 * * *', async () => {
  // Compliance 32x
  await retrieveSubmission(client, settings.channels.submit_textures.c32, settings.channels.submit_council.c32, 3)
  await councilSubmission(client, settings.channels.submit_council.c32, settings.channels.submit_results.c32, settings.channels.submit_revote.c32, 1)
  await revoteSubmission(client, settings.channels.submit_revote.c32, settings.channels.submit_results.c32, 3)

  // Compliance 64x
  await retrieveSubmission(client, settings.channels.submit_textures.c64, settings.channels.submit_council.c64, 3)
  await councilSubmission(client, settings.channels.submit_council.c64, settings.channels.submit_results.c64, settings.channels.submit_revote.c64, 1)
  await revoteSubmission(client, settings.channels.submit_revote.c64, settings.channels.submit_results.c64, 3)
})
const downloadToBot = new cron.CronJob('15 0 * * *', async () => {
  await downloadResults(client, settings.channels.submit_results.c32)
  await downloadResults(client, settings.channels.submit_results.c64)
})
let pushToGithub = new cron.CronJob('30 0 * * *', async () => {
  await pushTextures()
  await saveDB(`Daily Backup`)
})

const updatePercentages = new cron.CronJob('45 0 * * *', async () => {
  const editions = settings.editions.map(e => e.toLowerCase())
  const resolutions = settings.resolutions.map(r => String(parseInt(r)))
  const editions_and_resolutions = editions.map(e => resolutions.map(r => [e, r])).flat()
  const updatePromises = editions_and_resolutions.map(er => computeAndUpdate(client, er[1], er[0], () => {}))

  const prom = Promise.all(updatePromises)
  return prom.catch(err => {
    unhandledRejection(client, err, prom, undefined)
  })
})

function doMCUpdateCheck() {
  jiraJE.updateJiraVersions(client)
  jiraBE.updateJiraVersions(client)
  minecraft.updateMCVersions(client)
}

module.exports = {
  name: 'ready',
  once: true,
  // eslint-disable-next-line no-unused-vars
  async execute() {
    console.log(`┌─────────────────────────────────────────────────────────────┐`)
    console.log(`│                                                             │`)
    console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                           │`)
    console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`)
    console.log(`│                                                             │`)
    console.log(`└─────────────────────────────────────────────────────────────┘\n\n`)

    if (MAINTENANCE) client.user.setPresence({ activities: [{ name: 'maintenance' }], status: 'dnd' })
    else client.user.setActivity(`${PREFIX}help`, { type: 'LISTENING' })

    await restartAutoDestroy(client)

    if (DEV) {
      setInterval(() => {
        doCheckLang()
        doCheckSettings()
      }, 20000); // 20 seconds
    }

    if (DEV) return

    /**
     * START TEXTURE SUBMISSION PROCESS
     * @see submissionProcess
     * @see downloadToBot
     * @see pushToGithub
     */
    submissionProcess.start()
    downloadToBot.start()
    pushToGithub.start()
    updatePercentages.start()

    await jiraJE.loadJiraVersions()
    await jiraBE.loadJiraVersions()
    await minecraft.loadMCVersions()

    /**
     * LOOP EVENTS
     * @event doMCUpdateCheck() -> each minute | MINECRAFT UPDATE DETECTION INTERVAL
     * @event doCheckLang()     -> each minute | LANG FILE UPDATE
     * @event checkTimeout()    -> every 30s   | MODERATION MUTE SYSTEM UPDATE INTERVAL
     */
    setInterval(() => {
      doMCUpdateCheck()
      doCheckLang()
      doCheckSettings()
    }, 60000);
    setInterval(() => {
      checkTimeout(client)
    }, 30000);

    // UPDATE MEMBERS
    updateMembers(client, settings.guilds.c32.id, settings.channels.counters.c32)

    // FETCH MEMBERS DATA
    syncMembers(client, [settings.guilds.c32.id, settings.guilds.c64.id, settings.guilds.cextras.id])
  }
}
