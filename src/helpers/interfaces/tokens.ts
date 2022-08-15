export interface Tokens {
  firestormToken: string;
  token: string;
  prefix: string;
  apiURL: string;
  appID: string; // bot id
  apiPassword: string; // for api authentification
  errorChannel: string; // error channel where errors are sent
  dev: boolean; // if true: instantiate command only it the bot dev discord server
  maintenance: boolean; // if true: disallow normal bot functions and update status
}
