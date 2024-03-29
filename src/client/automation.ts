import { Poll } from "@helpers/poll";
import { Client } from "@client";

/**
 * Automate checking tasks with a given delay
 * @author Juknum
 */
export class Automation {
	private ticking = true;
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
			this.client.polls.each((p) => {
				const poll = new Poll(p); // get methods back

				if (poll.isTimeout()) {
					poll.setStatus("ended");
					poll.updateEmbed(this.client).then(() => this.client.polls.delete(poll.id));
				}
			});
		}, 15000); // 15 seconds

		// send to uptime kuma (only for production bot)
		if (this.client.tokens.status) {
			setInterval(
				() => fetch(this.client.tokens.status + this.client.ws.ping).catch(() => {}),
				600000,
			); // 10 minutes
		}
	}
}
