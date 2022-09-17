import axios from 'axios';
import { Logger } from '@utils';
import { URL } from '.';

export async function getAllMCVersions(): Promise<Array<string>> {
  return axios.get(`${URL}/textures/versions`)
    .then((res) => res.data)
    .catch((err) => {
      Logger.log('error', 'Error getting all MC versions', err);
      return [];
    });
}

export async function getAllMCEditions(): Promise<Array<string>> {
  return axios.get(`${URL}/textures/editions`)
    .then((res) => res.data)
    .catch((err) => {
      Logger.log('error', 'Error getting all MC editions', err);
      return [];
    });
}
