import { Poll } from "@class/poll";
import { Client } from "@client";

export class Automation {
	private ticking: boolean = true;
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public pause() {
		this.ticking = !this.ticking;
	}

	public start() {
		setInterval(() => {
			if (!this.ticking) return;

			// polls check:
			this.client.polls.each((p: Poll) => this.pollCheck(p));
		}, 1000); // each second
	}

	private pollCheck(p: Poll): void {
		const poll = new Poll(p); // get methods back

		if (poll.isTimeout()) {
			poll.setStatus("ended");
			poll.updateEmbed(this.client).then(() => this.client.polls.delete(poll.id));
		}
	}
}
