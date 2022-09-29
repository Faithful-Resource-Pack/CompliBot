// spawn a child process and execute shell command
// borrowed from https://github.com/mout/mout/ build script
// borrowed from Miller Medeiros on https://gist.github.com/millermedeiros/4724047
// released under MIT License
// version: 0.1.0 (2021/08/13)
//* remade in TS by @Juknum

import { spawn } from 'child_process';

/**
 * Execute a single shell command where "cmd" is a string
 * @param {string} cmd - The command to execute
 * @param {Function} cb - The callback function
 * @param {*} options - The options object
 */
export const execSync = (cmd: string | undefined, cb: Function, options: any = undefined): void => {
  if (!cmd) return;

  // this would be way easier on a shell/bash script :P
  // eslint-disable-next-line global-require
  const parts = cmd.split(/\s+/g);

  let opt = {
    stdio: 'inherit',
  };
  if (options !== undefined) opt = { ...opt, ...options };

  const subprocess = spawn(parts[0], parts.slice(1), (opt as any));
  subprocess.on('exit', (code: number) => {
    if (code !== 0) {
      cb({
        error: new Error(`command "${cmd}" exited with wrong status code "${code}"`),
        code,
        cmd,
      });
    } else if (cb) cb(null);
  });
};

/**
 * Execute commands in series
 * @param {Array<string>} cmds - Array of commands to execute
 * @param {Function} cb - Callback function
 * @param {*} options - Options
 */
export const seriesSync = (cmds: Array<string>, cb: Function, options: any = undefined): void => {
  const execNext = () => {
    execSync(
      cmds.shift(),
      (err: any) => {
        if (err) cb(err);
        else if (cmds.length) execNext();
        else cb(null);
      },
      options,
    );
  };

  execNext();
};

/**
 * Execute a command in parallel
 * @param {string} cmd - Command to execute
 * @param {*} options - Options
 * @returns {Promise<void>}
 */
export const exec = async (cmd: string, options: any = undefined): Promise<void> => new Promise((res, rej) => {
  execSync(
    cmd,
    (err: any) => {
      if (err === null) res(err);
      else rej(err);
    },
    options,
  );
});

/**
 * Execute commands in series
 * @param {Array<string>} cmds - Array of commands to execute
 * @param {*} options - Options
 * @returns {Promise<void>}
 */
export const series = async (cmds: Array<string>, options: any = undefined): Promise<void> => new Promise((res, rej) => {
  seriesSync(
    cmds,
    (err: any) => {
      if (err === null) res(err);
      else rej(err);
    },
    options,
  );
});
