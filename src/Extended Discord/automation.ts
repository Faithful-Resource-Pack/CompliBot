import { Submission } from "@helpers/class/submissions";
import { addMinutes } from "@helpers/dates";
import { Client } from "@src/Extended Discord";

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

			// submissions check:
			this.client.submissions.each((s: Submission) => {
				const submission = new Submission(s); // get methods back
				
				if (submission.isTimeout()) {
					console.log(submission)
					const [up, down] = submission.getVotes();

					switch (submission.getStatus()) {
						case "pending":
							if (up >= down) {
								submission
									.setStatus("council", this.client)
									.voidVotes()
									// .setTimeout(addMinutes(new Date(), 1440)); // now + 1 day
									.setTimeout(addMinutes(new Date(), 1));
								this.client.submissions.set(submission.id, submission)
							}
							else {
								submission.setStatus("no_council", this.client);
								this.client.submissions.delete(submission.id);
							}

							submission.updateSubmissionMessage(this.client, null);
							break;
					
						case "council":
							if (up > down) submission.setStatus("added", this.client).createContribution();
							else submission.setStatus("denied", this.client);

							submission.updateSubmissionMessage(this.client, null);
							this.client.submissions.delete(submission.id);
						default:
							break;
					}
				}
			})
		}, 1000); // each second
	}
}
