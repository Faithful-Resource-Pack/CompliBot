import Client from "@src/Client";
import { getData } from "@src/Functions/getDataFromJSON";
import { Polls } from "@src/Functions/poll";
import { setData } from "@src/Functions/setDataToJSON";

export class Automation {
	private ticking: boolean = true;
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public start() {
		setInterval(() => {
			if (!this.ticking) return;

			this.doCheckPolls();
		}, 1000); // each seconds
	}

	private doCheckPolls() {
		let data: JSON = getData({ filename: "polls.json", relative_path: "../json/" });

		for (const [key, poll] of Object.entries(data)) {
			const p = new Polls(this.client, poll);
			if (p.checkTimeout()) {
				delete data[key];
				setData({ filename: "polls.json", relative_path: "../json/", data: data });
			}
		}
	}
}
