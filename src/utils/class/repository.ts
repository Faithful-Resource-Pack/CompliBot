import { IPack, TEditions } from '@interfaces';
import { series, exec } from '@utils';
import path from 'path';

export class Repository {
  readonly localPath: string;
  private available: boolean = true;

  constructor(
    readonly pack: IPack['value'],
    readonly edition: TEditions,
    readonly git: string,
    localPath: string,
  ) {
    this.localPath = path.join(__dirname, '../../../', localPath);
  }

  public async update(): Promise<this> {
    await series(['git stash', 'git remote update', 'git fetch', 'git pull'], { cwd: this.localPath, silent: true });
    return this;
  }

  public async checkout(branch: string, create: boolean = false): Promise<this> {
    await exec(`git checkout ${create ? '-b' : ''} ${branch}`, { cwd: this.localPath, silent: true });
    return this;
  }
}
