// spawn a child process and execute shell command
// borrowed from https://github.com/mout/mout/ build script
// borrowed from Miller Medeiros on https://gist.github.com/millermedeiros/4724047
// released under MIT License
// version: 0.1.0 (2021/08/13)

import { dev } from "@json/tokens.json";

/**
 * execute a single shell command where "cmd" is a string
 * @author Juknum
 * @param cmd what command to run
 * @param cb what to run afterwards (grabs error too)
 * @param options extra command line options for child_process
 */
export const execSync = (cmd: string, cb: Function, options = undefined) => {
	// this would be way easier on a shell/bash script :P
	const child_process = require("child_process");
	const parts = cmd.split(/\s+/g);

	// don't spam console logs in production with command outputs
	let opt = { stdio: dev ? "inherit" : "ignore" };

	if (options !== undefined) opt = Object.assign({}, opt, options);

	const p = child_process.spawn(parts[0], parts.slice(1), opt);
	p.on("exit", (code: number) => {
		let err = null;
		if (code) {
			err = new Error(`command "${cmd}" exited with wrong status code "${code}"`);
			err.code = code;
			err.cmd = cmd;
		}

		if (cb) cb(err);
	});
};

// execute multiple commands in series
// this could be replaced by any flow control lib
export const seriesSync = (cmds: string[], cb: Function, options = undefined) => {
	const execNext = () => {
		execSync(
			cmds.shift(),
			(err: any) => {
				if (err) cb(err);
				else {
					if (cmds.length) execNext();
					else cb(null);
				}
			},
			options,
		);
	};

	execNext();
};

export const exec = async (cmd: string, options: any = undefined) => {
	return new Promise((res, rej) => {
		execSync(
			cmd,
			(err: any) => {
				if (err === null) res(err);
				else rej(err);
			},
			options,
		);
	});
};

export const series = async (cmds: string[], options = undefined) => {
	return new Promise((res, rej) => {
		seriesSync(
			cmds,
			(err: any) => {
				if (err === null) res(err);
				else rej(err);
			},
			options,
		);
	});
};
