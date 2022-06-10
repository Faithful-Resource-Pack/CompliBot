import path from 'path';
import fs from 'fs';
import axios from 'axios';
import child_process from 'child_process';
import { info, warning } from '@helpers/logger';
import { Client } from 'client';
import {
  Contribution, Path, Paths, Use, Uses,
} from '@helpers/interfaces/firestorm';

export default async function pushToGithub(
  client: Client,
  contribution: Contribution,
  paths: Paths,
  uses: Uses,
  repos: any,
  url: string,
) {
  // texture buffer; used to create a texture file from the given url
  const textureBuffer = await axios.get(url, { responseType: 'arraybuffer' }).then((res) => res.data);
  // get the base paths where repos are located
  const basePath = path.join(`${__dirname}/../../../repos/`);
  // sort the uses by their edition
  const usesByEditions: { [edition: string]: Use[] } = {};
  // get usernames from database (for the commit message)
  const usersNames = await axios.get(`${client.config.apiUrl}users/names`).then((res) => res.data);
  // get the contribution contributors usernames
  const contributorsNames = contribution.authors.map(
    (id) => usersNames.filter((user: { id: string; username: string; uuid: string }) => user.id === id)[0].username,
  );

  // if base path does not exist, create it
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  // split uses by edition (each edition has it's own repo)
  uses.forEach((use: Use) => {
    if (usesByEditions[use.edition]) usesByEditions[use.edition].push(use);
    else usesByEditions[use.edition] = [use];
  });

  // for each edition (since each edition has it's own repo)
  Object.keys(usesByEditions).forEach((edition: string) => {
    // get all uses Ids for that edition
    const usesIds = usesByEditions[edition].map((use: Use) => use.id);

    // get all versions for those uses
    const versions = [
      ...new Set(
        paths
          .filter((p: Path) => usesIds.includes(p.use))
          .map((p: Path) => p.versions)
          .flat(),
      ),
    ];

    // find the corresponding repo for this use
    const repoGit: string = repos[edition];
    const repoName: string = repos[edition].split('/').pop().replace('.git', '');

    // C://Users/.../repos/repoName
    const fullPath: string = path.join(basePath, repoName);

    // if repo does not exist, clone it
    // else stash & pull the latest version
    if (!fs.existsSync(fullPath)) {
      if (client.verbose) console.log(`${warning} Cloning ${repoName}`);
      child_process.execSync(`cd "${basePath}" && git clone ${repoGit}`);
    } else child_process.execSync(`cd "${fullPath}" && git stash && git pull`);

    // for each versions, write the texture to all paths that has that version
    versions.forEach((version: string) => {
      // swap to the right version branch
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
      // update repo to latest version
      try {
        child_process.execSync(`cd "${fullPath}" && git pull`);
      } catch (e) {
        /* already up to date */
      }

      // for each path for that version
      paths
        .filter((p: Path) => p.versions.includes(version))
        .forEach((p: Path) => {
          const use: Use = uses.find((u: Use) => u.id === p.use);
          const texturePath = path.join(
            basePath,
            repoName,
            `${use.assets !== null ? `assets/${use.assets}/${p.name}` : p.name}`,
          );
          const directoriesUntilTexture = texturePath.split('/').slice(0, -1).join('/');

          // create full path to the texture if it doesn't exist
          if (!fs.existsSync(directoriesUntilTexture)) {
            fs.mkdirSync(directoriesUntilTexture, { recursive: true });
          }

          // upload the file
          fs.writeFileSync(texturePath, Buffer.from(textureBuffer));
        });

      // track files
      try {
        child_process.execSync(`cd "${fullPath}" && git add *`);
      } catch (e) {
        /* all files are already added */
      }

      // commit the changes
      try {
        child_process.execSync(
          `cd "${fullPath}" && git commit -m "[#${contribution.texture}] by: ${contributorsNames.join(', ')}"`,
        );
      } catch (e) {
        /* make commit */
      }

      // push the commit
      try {
        child_process.execSync(`cd "${fullPath}" && git push origin ${version}`);
      } catch (e) {
        /* push commits */
      }

      if (client.verbose) console.log(`${info}[${repoName}] ${version} pushed: #${contribution.texture}`);
    });
  });
}
