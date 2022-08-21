export interface ISettings {
  verbose: boolean; // whether or not to log verbosely
  inDev: boolean; // whether or not the bot is in development mode
  debugChannel: string; // the channel where debug logs should be sent
  clientId: string; // client id
  devGuildId: string; // guild id for the dev guild
  imageBaseURL: string; // base url for images
}
