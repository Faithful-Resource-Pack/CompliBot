import { Client } from "@client";
import { SubmissionConfig } from "@helpers/interfaces";

export const getResourcePackFromName = (client: Client, name: string): SubmissionConfig => {
	return client.config.discords
		.filter((d) => d.submissionSystem !== undefined)
		.map((d) => d.submissionSystem.submission)
		.filter((s) => s[name] !== undefined)[0][name];
};
