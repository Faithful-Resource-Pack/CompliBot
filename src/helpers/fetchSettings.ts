import { writeFile } from "fs/promises";
import { join } from "path";
import axios from "axios";
import { Client } from "@client";

/**
 * Fetch settings file from the VPS into dynamic json folder
 * Based off code made by Juknum from the submissions bot
 * @author Evorp
 * @param client client object used for determining the api url to fetch from
 */
export async function fetchSettings(client: Client) {
	const settings = (await axios.get(`${client.tokens.apiUrl}settings/raw`)).data;
	const out = join(process.cwd(), "json/dynamic/settings.json");
	writeFile(out, JSON.stringify(settings), {
		flag: "w",
		encoding: "utf-8",
	});
}
