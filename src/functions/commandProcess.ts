const path = require('path');
const { existsSync } = require('fs');
import { readFileSync } from 'fs';
import * as fs from 'fs';
import ExtendedClient from '~/Client';

const COUNTER_FOLDER = path.resolve(__dirname, '../json/');
const COUNTER_FILE_PATH = path.resolve(COUNTER_FOLDER, 'commandsProcessed.json');
const SAVE_EVERY = 20; // save file every n commands triggered

const jsonString = fs.readFileSync(COUNTER_FILE_PATH).toString();
const commandsObj = JSON.parse(jsonString);

let commandsProcessed: { [commandName: string]: number } = JSON.parse(fs.readFileSync(COUNTER_FILE_PATH).toString());

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
	if (commandsProcessed[name] == undefined) commandsProcessed[name] = 1;
	else {
		commandsProcessed[name]++;
	}

	if (commandsProcessed[name] == 1 || commandsProcessed[name] % SAVE_EVERY == 0) {
		fs.writeFileSync(COUNTER_FILE_PATH, JSON.stringify(commandsProcessed));
	}
}
