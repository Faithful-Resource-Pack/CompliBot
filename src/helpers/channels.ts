import { Client } from '@client';

export const getSubmissionsChannels = (client: Client): Array<string> => client.config.discords
  .filter((d) => d.submissionSystem !== undefined)
  .map((d) => Object.values(d.submissionSystem.submission).map((arr) => arr.channel))
  .flat();

export const getSubmissionChannelName = (client: Client, id: string): string => {
  const d = client.config.discords
    .filter((d1) => d1.submissionSystem !== undefined)
    .filter((d2) => Object.values(d2.submissionSystem.submission)
      .map((arr) => arr.channel)
      .includes(id))[0];

  return Object.keys(d.submissionSystem.submission).filter(
    (key) => d.submissionSystem.submission[key].channel === id,
  )[0];
};

export const getCorrespondingCouncilChannel = (client: Client, id: string): string => client.config.discords
  .filter((d) => d.submissionSystem !== undefined)
  .filter((d) => Object.values(d.submissionSystem.submission)
    .map((arr) => arr.channel)
    .includes(id))[0].submissionSystem.council;
