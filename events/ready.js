const client = require("../index").Client;
const { CronJob } = require("cron");

const DEV = process.env.DEV.toLowerCase() == "true";
const MAINTENANCE = process.env.MAINTENANCE.toLowerCase() == "true";
const fetchSettings = require("../functions/fetchSettings");

const settings = require("../resources/settings.json");

const retrieveSubmission = require("../functions/submission/retrieveSubmission");
const downloadResults = require("../functions/submission/downloadResults");
const pushTextures = require("../functions/submission/pushTextures");
const restartAutoDestroy = require("../functions/restartAutoDestroy");
const saveDB = require("../functions/saveDB");

/**
 * Send submission messages to their respective channels
 * Runs each day at midnight CE(S)T
 * @author Evorp
 * @see retrieveSubmission
 */
const submissionProcess = new CronJob("0 0 * * *", async () => {
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
/**
 * Download passed textures
 * Runs each day at 00:15 CE(S)T
 * @author Evorp
 * @see downloadResults
 */
const downloadToBot = new CronJob("15 0 * * *", async () => {
	for (let pack of Object.values(settings.submission.packs)) {
		await downloadResults(client, pack.channels.results);
	}
});

/**
 * Push downloaded textures to GitHub, and back up DB
 * Runs each day at 00:30 CE(S)T
 * @author Evorp, Juknum
 * @see pushTextures
 * @see saveDB
 */
const pushToGithub = new CronJob("30 0 * * *", async () => {
	await pushTextures();
	await saveDB(`Daily Backup`);
});

module.exports = {
	name: "ready",
	once: true,
	async execute() {
		console.log(`┌─────────────────────────────────────────────────────────────┐`);
		console.log(`│                                                             │`);
		console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                           │`);
		console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`);
		console.log(`│                                                             │`);
		console.log(`└─────────────────────────────────────────────────────────────┘\n\n`);

		if (MAINTENANCE)
			client.user.setPresence({ activities: [{ name: "maintenance" }], status: "dnd" });
		else client.user.setActivity("submissions", { type: "LISTENING" });

		await restartAutoDestroy(client);

		if (DEV) {
			setInterval(() => {
				fetchSettings();
			}, 20000); // 20 seconds
		}

		if (DEV) return;

		/**
		 * START TEXTURE SUBMISSION PROCESS
		 */
		submissionProcess.start();
		downloadToBot.start();
		pushToGithub.start();

		/**
		 * LOOP EVENTS
		 */
		setInterval(() => {
			fetchSettings();
		}, 60000); // each minute
	},
};
