const { existsSync } = require("fs");
import fs, { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Client } from "@src/Extended Discord";
import { getData } from "./getDataFromJSON";
import { setSid } from "./postSubmittedTextureEmbed";

const COUNTER_FOLDER = path.resolve(__dirname, "../json/");
const COUNTER_FILE_PATH = path.resolve(COUNTER_FOLDER, "commandsProcessed.json");
const SAVE_EVERY = 20; // save file every n commands triggered

const commandsObj = getData({ filename: "commandsProcessed.json", relative_path: "../json/" });
let commandsProcessed: { [commandName: string]: number } = getData({
	filename: "commandsProcessed.json",
	relative_path: "../json/",
}) as any;

export function init(client: Client) {
	//loads sid 
	const loadedSid: number = JSON.parse(readFileSync(path.join(__dirname, "../json/submissionsCount.json"), "utf8")).SID;
	loadedSid != undefined ? setSid( loadedSid ) : writeFileSync(path.join(__dirname, "../json/submissionsCount.json"), `{"SID":0}`)
	//if sid doesnt exist in submissionsCount.json it creates it with SID equal to 0

	client.commands.forEach((command) => {
		commandsProcessed[command.name] == commandsObj[command.name];
	});
}
export var total = () => Object.values(commandsProcessed).reduce((a, b) => a + b);
export var getUsage = function (commandName: string) {
	return commandsProcessed[commandName];
};

export function increase(name: string) {
	commandsProcessed[name] = commandsProcessed[name] == undefined ? 1 : commandsProcessed[name] + 1;

	if (commandsProcessed[name] == 1 || commandsProcessed[name] % SAVE_EVERY == 0) {
		getData({ filename: "commandsProcessed.json", relative_path: "../json/" }); // use to test if the file hasn't been deleted after bot start.
		fs.writeFileSync(COUNTER_FILE_PATH, JSON.stringify(commandsProcessed));
	}
}
