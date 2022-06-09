import {
  Contribution,
  Path, Paths, Use, Uses,
} from 'helpers/interfaces/firestorm';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { info, warning } from 'helpers/logger';
import axios from 'axios';
import { Client } from 'client';

export default async function pushToGithub(client: Client, contribution: Contribution, paths: Paths, uses: Uses, repos: any, url: string) {
  const textureBuffer = await axios.get(url, { responseType: 'arraybuffer' }).then((res) => res.data);
  const usersNames = await axios.get(`${client.config.apiUrl}users/names`).then((res) => res.data);
  const contributorsNames = contribution.authors.map((id) => usersNames.filter((user: { id: string, username: string, uuid: string }) => user.id === id)[0].username);

  // TODO;
  // CHECK REPOS PATH FOR BUILD PRODUCTION
  const basePath = path.join(`${__dirname}/../../../repos/`);

  // if base path does not exist, create it
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }

  // for each path the texture has
  for (let i = 0; i < paths.length; i += 1) {
    const p: Path = paths[i];

    // for each edition
    for (let j = 0; j < uses.length; j += 1) {
      const u: Use = uses.filter((use) => use.id === p.use)[0];

      const repoGit: string = repos[u.edition];
      const repoName: string = repos[u.edition].split('/').pop().replace('.git', '');

      const fullPath: string = path.join(basePath, repoName);

      if (!fs.existsSync(fullPath)) {
        console.log(`${warning}${repoName} git repo does not exist`);
        child_process.execSync(`cd "${basePath}" && git clone ${repoGit}`);
      } else child_process.execSync(`cd "${fullPath}" && git stash && git pull`);

      // repo is cloned, go trough it & upload the file for EACH version (each version has a branch)
      for (let k = 0; k < p.versions.length; k += 1) {
        const version: string = p.versions[k];

        // swap branch
        try {
          child_process.execSync(`cd "${fullPath}" && git checkout ${version}`);
        } catch (e) {
          /* already on branch */
        }

        // stash changes & pull latest
        try {
          child_process.execSync(`cd "${fullPath}" && git stash`);
        } catch (e) {
          /* no changes to stash */
        }
        try {
          child_process.execSync(`cd "${fullPath}" && git pull`);
        } catch (e) {
          /* already up to date */
        }

        // upload the file
        fs.writeFileSync(
          path.join(basePath, repoName, `${u.assets !== null ? `assets/${u.assets}/${p.name}` : p.name}`),
          Buffer.from(textureBuffer),
        );

        // commit & push
        try {
          child_process.execSync(`cd "${fullPath}" && git add *`);
        } catch (e) {
          /* all files are already added */
        }
        try {
          child_process.execSync(`cd "${fullPath}" && git commit -m "Pushed [#${contribution.texture}], Authors: ${contributorsNames.join(', ')}"`);
        } catch (e) {
          /* make commit */
        }
        try {
          child_process.execSync(`cd "${fullPath}" && git push origin ${version}`);
        } catch (e) {
          /* push commits */
        }

        console.log(
          `${info}Pushed ${p.name} to ${repoName}/${
            u.assets !== null ? `assets/${u.assets}/${p.name}` : p.name
          } (branch: ${version})`,
        );
      }
    }
  }
}
