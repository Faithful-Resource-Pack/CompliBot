const { resolve } = require("path");
const { existsSync } = require("fs");
const { readFile, mkdir, writeFile } = require("fs/promises");

// eslint-disable-next-line no-undef
const COUNTER_FOLDER = resolve(__dirname, "..", "json");
const COUNTER_FILE_PATH = resolve(COUNTER_FOLDER, "commandsProcessed.txt");
const SAVE_EVERY = 20; // save file every n messages sent

let number = undefined;

/**
 * @returns {Promise<number>}
 */
const __loadNumber = function () {
	let prom;
	if (number === undefined) {
		prom = readFile(COUNTER_FILE_PATH)
			.catch(() => {
				return "0";
			})
			.then((content) => {
				number = parseInt(content.toString());

				return number;
			});
	} else {
		prom = Promise.resolve(number);
	}

	return prom;
};

module.exports = {
	async increase() {
		await __loadNumber();
		number += 1;
		if (number === 1 || number % SAVE_EVERY === 0) {
			const folderCreate = existsSync(COUNTER_FOLDER)
				? Promise.resolve()
				: mkdir(COUNTER_FOLDER, { recursive: true });
			return folderCreate
				.then(() => writeFile(COUNTER_FILE_PATH, "" + number))
				.catch((e) => {
					console.error(e);
				});
		}
	},
	get() {
		return __loadNumber();
	},
};
