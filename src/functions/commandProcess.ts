const path = require('path');
const { existsSync } = require('fs');
import { readFileSync } from 'fs';
import * as fs from 'fs';
import ExtendedClient from '~/Client';

const COUNTER_FOLDER = path.resolve(__dirname, '../json/');
const COUNTER_FILE_PATH = path.resolve(COUNTER_FOLDER, 'commandsProcessed.json');
const SAVE_EVERY = 20; // save file every n commands triggered

function validateDirectory(): string {
	let jsonString: string;

	try {
		jsonString = fs.readFileSync(COUNTER_FILE_PATH).toString();
	}
	catch (err) { // when file/folder doesn't exist/is invalid
		// if folder doesn't exist
		if (!existsSync(COUNTER_FOLDER)) fs.mkdirSync(COUNTER_FOLDER, { recursive: true });

		// create file
		fs.writeFileSync(COUNTER_FILE_PATH, "{}") // empty object to avoid parse errors

		return validateDirectory();
	}

	return jsonString;
}

const commandsObj = JSON.parse(validateDirectory());
let commandsProcessed: { [commandName: string]: number } = JSON.parse(validateDirectory());

export function init(client: ExtendedClient) {
	client.commands.forEach((command) => {
		commandsProcessed[command.name] == commandsObj[command.name];
	});
}
export var total = () => Object.values(commandsProcessed).reduce((a, b) => a + b);
export var getUsage = function (commandName: string) {
	return commandsProcessed[commandName];
};

export function increase(name: string) {
	commandsProcessed[name] = (commandsProcessed[name] == undefined) ? 1 : commandsProcessed[name] + 1;

	if (commandsProcessed[name] == 1 || commandsProcessed[name] % SAVE_EVERY == 0) {
		validateDirectory(); // use to test if the file hasn't been deleted after bot start.
		fs.writeFileSync(COUNTER_FILE_PATH, JSON.stringify(commandsProcessed));
	}
}
