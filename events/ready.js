const client = require('../index').Client
const cron   = require('cron')

const DEV         = (process.env.DEV.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')
const PREFIX      = process.env.PREFIX

const jiraJE    = require('../functions/minecraftUpdates/jira-je')
const jiraBE    = require('../functions/minecraftUpdates/jira-be')
const minecraft = require('../functions/minecraftUpdates/minecraft')

const settings = require('../resources/settings')

const { retrieveSubmission } = require('../functions/textures/submission/retrieveSubmission')
const { councilSubmission }  = require('../functions/textures/submission/councilSubmission')
const { revoteSubmission }   = require('../functions/textures/submission/revoteSubmission')
const { downloadResults }    = require('../functions/textures/admission/downloadResults')
const { pushTextures }       = require('../functions/textures/admission/pushTextures')

const { updateMembers }      = require('../functions/moderation/updateMembers')
const { syncMembers }        = require('../functions/moderation/syncMembers')
const { checkTimeout }       = require('../functions/moderation/checkTimeout')
const { restartAutoDestroy } = require('../functions/restartAutoDestroy')
const { saveDB }             = require('../functions/saveDB')

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob('0 0 * * *', async () => {
  // Compliance 32x
  await retrieveSubmission(client, settings.C32_SUBMIT_TEXTURES, settings.C32_SUBMIT_COUNCIL, 3)
  await councilSubmission(client, settings.C32_SUBMIT_COUNCIL, settings.C32_RESULTS, settings.C32_SUBMIT_REVOTE, 1)
  await revoteSubmission(client, settings.C32_SUBMIT_REVOTE, settings.C32_RESULTS, 3)

  // Compliance 64x
  await retrieveSubmission(client, settings.C64_SUBMIT_TEXTURES, settings.C64_SUBMIT_COUNCIL, 3)
  await councilSubmission(client, settings.C64_SUBMIT_COUNCIL, settings.C64_RESULTS, settings.C64_SUBMIT_REVOTE, 1)
  await revoteSubmission(client, settings.C64_SUBMIT_REVOTE, settings.C64_RESULTS, 3)
})
const downloadToBot = new cron.CronJob('15 0 * * *', async () => {
  await downloadResults(client, settings.C32_RESULTS)
  await downloadResults(client, settings.C64_RESULTS)
})
let pushToGithub = new cron.CronJob('30 0 * * *', async () => {
  await pushTextures()
  await saveDB(`Daily Backup`)
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
    console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                         │`)
    console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`)
    console.log(`│                                                             │`)
    console.log(`└─────────────────────────────────────────────────────────────┘\n\n`)

    if (MAINTENANCE) client.user.setPresence({ activities: [{ name: 'maintenance' }], status: 'dnd' })
    else client.user.setActivity(`${PREFIX}help`, { type: 'LISTENING' })

    await restartAutoDestroy(client)

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

    /**
     * MINECRAFT UPDATE DETECTION INTERVAL
     * @param {int} TIME : in milliseconds
     */
    await jiraJE.loadJiraVersions()
    await jiraBE.loadJiraVersions()
    await minecraft.loadMCVersions()
    setInterval(() => doMCUpdateCheck(), 60000)

    /**
     * MODERATION MUTE SYSTEM UPDATE INTERVAL
     * @param {int} TIME : in milliseconds
     */
    setInterval(function () { checkTimeout(client) }, 30000)

    /**
     * UPDATE MEMBERS
     */
    updateMembers(client, settings.C32_ID, settings.C32_COUNTER)

    /**
     * FETCH MEMBERS DATA
     */
    syncMembers(client, [settings.C32_ID, settings.C64_ID, settings.CEXTRAS_ID])
  }
}