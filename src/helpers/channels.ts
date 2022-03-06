import { Client } from "@client";

export const getSubmissionsChannels = (client: Client): Array<string> => {
  return client.config.discords
    .filter(d => d.submissionSystem !== undefined)
    .map(d => Object.values(d.submissionSystem.submission))
    .flat();
}

export const getSubmissionChannelName = (client: Client, id: string): string => {
  const d = client.config.discords
    .filter(d => d.submissionSystem !== undefined)
    .filter(d => Object.values(d.submissionSystem.submission).includes(id))[0];

  return Object.keys(d.submissionSystem.submission).filter(key => d.submissionSystem.submission[key] === id)[0];
}

export const getCorrespondingCouncilChannel = (client: Client, id: string): string => {
  return client.config.discords
    .filter(d => d.submissionSystem !== undefined)
    .filter(d => Object.values(d.submissionSystem.submission).includes(id))
    [0].submissionSystem.council;
}