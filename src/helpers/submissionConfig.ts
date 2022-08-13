import { Client } from '@client';
import { SubmissionConfigKeys } from './interfaces';

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

export const getCorrespondingGuildIdFromSubmissionChannel = (client: Client, id: string): string => {
  const packName = getSubmissionChannelName(client, id);
  return client.config.discords
    .filter((d) => d.submissionSystem !== undefined)
    .filter((d) => d.submissionSystem.submission[packName] !== undefined)
    .map((d) => d.id)[0];
};

/**
 * Get key value for the asked key field of a submission config.
 * @param {Client} client Discord Bot Client
 * @param {String} id channel id (submission channel id)
 * @param {String} type field of {SubmissionConfig}
 * @returns {String}
 */
export function getSubmissionSetting(client: Client, id: string, type: SubmissionConfigKeys): any {
  const packName = getSubmissionChannelName(client, id);

  return client.config.discords
    .filter((d) => d.submissionSystem !== undefined)
    .filter((d) => d.submissionSystem.submission[packName] !== undefined)
    .map((d) => d.submissionSystem.submission[packName][type])
    .shift();
}

export const getCorrespondingCouncilChannel = (client: Client, id: string): string => client.config.discords
  .filter((d) => d.submissionSystem !== undefined)
  .filter((d) => Object.values(d.submissionSystem.submission)
    .map((arr) => arr.channel)
    .includes(id))
  .shift()
  .submissionSystem.council;
