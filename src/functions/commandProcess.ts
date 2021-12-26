const path = require('path');
const { existsSync } = require('fs');
const fs = require('fs/promises');

const COUNTER_FOLDER = path.resolve('~/json/');
const COUNTER_FILE_PATH = path.resolve(COUNTER_FOLDER, 'commandsProcessed.txt');
const SAVE_EVERY = 20; // save file every n commands triggered

let number: number;

export function get(): Promise<number> {
	let prom;
	if (number === undefined) {
		prom = fs
			.readFile(COUNTER_FILE_PATH)
			.catch(() => {
				return '0';
			})
			.then((content) => {
				number = parseInt(content.toString());

				return number;
			});
	} else {
		prom = Promise.resolve(number);
	}

	return prom;
}

export function increase() {
	return get().then(() => {
		number = number + 1;

		//if the number is one or number is divisible by SAVE_EVERY with no remainders:
		if (number === 1 || number % SAVE_EVERY === 0) {
			const folderCreate = existsSync(COUNTER_FOLDER) ? Promise.resolve() : fs.mkdir(COUNTER_FOLDER, { recursive: true });
			return (
				folderCreate
					//tab char code dont worry
					.then(() => fs.writeFile(COUNTER_FILE_PATH, '' + number))
					.catch((e) => {
						console.error(e);
					})
			);
		}
	});
}
