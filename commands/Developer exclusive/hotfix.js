/* eslint-disable no-unused-vars */
const prefix = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const fs = require('fs')

const emojis = require('../../resources/emojis')
const settings = require('../../resources/settings')
const colors = require('../../resources/colors')
const allCollection = require('../../helpers/firestorm/all')
const { retrieveSubmission } = require('../../functions/textures/submission/retrieveSubmission')
const { councilSubmission } = require('../../functions/textures/submission/councilSubmission')
const { revoteSubmission } = require('../../functions/textures/submission/revoteSubmission')
const { downloadResults } = require('../../functions/textures/admission/downloadResults')
const { pushTextures } = require('../../functions/textures/admission/pushTextures')
const { saveDB } = require('../../functions/saveDB')

const { string, stringsStartsWith } = require('../../resources/strings')

module.exports = {
	name: 'hotfix',
	aliases: ['fix'],
	description: string('command.description.hotfix'),
	category: 'Developer exclusive',
	guildOnly: false,
	uses: string('command.use.devs'),
	syntax: `${prefix}hotfix <something>`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

		} else return
	}
}
