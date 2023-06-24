const client = require("../index").Client;
const cron = require("cron");

const DEV = process.env.DEV.toLowerCase() == "true";
const MAINTENANCE = process.env.MAINTENANCE.toLowerCase() == "true";
const fetchSettings = require("../functions/fetchSettings");

const settings = require("../resources/settings.json");

const { retrieveSubmission } = require("../functions/textures/submission/retrieveSubmission");
const { downloadResults } = require("../functions/textures/admission/downloadResults");
const { pushTextures } = require("../functions/textures/admission/pushTextures");

const { restartAutoDestroy } = require("../functions/restartAutoDestroy");
const { saveDB } = require("../functions/saveDB");

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob("0 0 * * *", async () => {
	for (let pack of Object.values(settings.submission.packs)) {
		if (pack.council_disabled) {
			await retrieveSubmission(
				// send directly to results
				client,
				pack.channels.submit,
				pack.channels.results,
				false,
				pack.vote_time,
				true,
			);
		} else {
			await retrieveSubmission(
				// send to results
				client,
				pack.channels.council,
				pack.channels.results,
				false,
				pack.council_time,
			);

			await retrieveSubmission(
				// send to council
				client,
				pack.channels.submit,
				pack.channels.council,
				true,
				pack.vote_time,
			);
		}
	}
});
const downloadToBot = new cron.CronJob("15 0 * * *", async () => {
	for (let pack of Object.values(settings.submission.packs)) {
		await downloadResults(client, pack.channels.results);
	}
});
let pushToGithub = new cron.CronJob("30 0 * * *", async () => {
	await pushTextures();
	await saveDB(`Daily Backup`);
});

module.exports = {
	name: "ready",
	once: true,
	// eslint-disable-next-line no-unused-vars
	async execute() {
		console.log(`┌─────────────────────────────────────────────────────────────┐`);
		console.log(`│                                                             │`);
		console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                           │`);
		console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`);
		console.log(`│                                                             │`);
		console.log(`└─────────────────────────────────────────────────────────────┘\n\n`);

		if (MAINTENANCE) client.user.setPresence({ activities: [{ name: "maintenance" }], status: "dnd" });
		else client.user.setActivity("Pigstep", { type: "LISTENING" });

		await restartAutoDestroy(client);

		if (DEV) {
			setInterval(() => {
				fetchSettings();
			}, 20000); // 20 seconds
		}

		if (DEV) return;

		/**
		 * START TEXTURE SUBMISSION PROCESS
		 * @see submissionProcess
		 * @see downloadToBot
		 * @see pushToGithub
		 */
		submissionProcess.start();
		downloadToBot.start();
		pushToGithub.start();

		/**
		 * LOOP EVENTS
		 * @event doMCUpdateCheck() -> each minute | MINECRAFT UPDATE DETECTION INTERVAL
		 */
		setInterval(() => {
			fetchSettings();
		}, 60000);
	},
};
