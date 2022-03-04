// spawn a child process and execute shell command
// borrowed from https://github.com/mout/mout/ build script
// borowed from Miller Medeiros on https://gist.github.com/millermedeiros/4724047
// released under MIT License
// version: 0.1.0 (2021/08/13)
//* remade in TS by @Juknum

// execute a single shell command where "cmd" is a string
export const execSync = (cmd: string, cb: Function, options: any = undefined): void => {
  // this would be way easier on a shell/bash script :P
  const child_process = require("child_process");
  const parts = cmd.split(/\s+/g);

  let opt = { stdio: "inherit" };
  if (options !== undefined) opt = Object.assign({}, opt, options);

  const p = child_process.spawn(parts[0], parts.slice(1), opt);
  p.on('exit', (code: number) => {
    let err = null;
    if (code) {
      err = new Error(`command "${cmd}" exited with wrong status code "${code}"`);
      err.code = code;
      err.cmd = cmd;
    }

    if (cb) cb(err);
  })
}

// execute multiple commands in series
// this could be replaced by any flow control lib
export const seriesSync = (cmds: Array<string>, cb: Function, options: any = undefined): void => {
  let execNext = () => {
    execSync(cmds.shift(), (err: any) => {
      if (err) cb(err);
      else {
        if (cmds.length) execNext();
        else cb(null);
      }

    }, options);
  }
  
  execNext();
}

export const exec = async (cmd: string, options: any = undefined): Promise<void> => {
  return new Promise((res, rej) => {
    execSync(cmd, (err: any) => {
      if (err === null) res(err);
      else rej(err);
    }, options);
  });
}

export const series = async (cmds: Array<string>, options: any = undefined): Promise<void> => {
  return new Promise((res, rej) => {
    seriesSync(cmds, (err: any) => {
      if (err === null) res(err);
      else rej(err);
    }, options)
  });
}