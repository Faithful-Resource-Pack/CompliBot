/**
 * spawn a child process and execute shell command
 * borrowed from https://github.com/mout/mout/ build script
 * borrowed from Miller Medeiros on https://gist.github.com/millermedeiros/4724047
 * released under MIT License
 * version: 0.1.0 (2021/08/13)
 */

// execute a single shell command where "cmd" is a string

exports.exec = function (cmd, cb, options = undefined) {
	// this would be way easier on a shell/bash script :P
	const child_process = require("child_process");
	const parts = cmd.split(/\s+/g);

	let opt = { stdio: "inherit" };
	if (options !== undefined) opt = Object.assign({}, opt, options);

	const p = child_process.spawn(parts[0], parts.slice(1), opt);
	p.on("exit", function (code) {
		let err = null;
		if (code) {
			err = new Error('command "' + cmd + '" exited with wrong status code "' + code + '"');
			err.code = code;
			err.cmd = cmd;
		}
		if (cb) cb(err);
	});
};

// execute multiple commands in series
// this could be replaced by any flow control lib
exports.series = function (cmds, cb, options = undefined) {
	let execNext = function () {
		exports.exec(
			cmds.shift(),
			function (err) {
				if (err) {
					cb(err);
				} else {
					if (cmds.length) execNext();
					else cb(null);
				}
			},
			options,
		);
	};
	execNext();
};

exports.promises = {
	exec: function (cmd, options = undefined) {
		return new Promise((resolve, reject) => {
			exports.exec(
				cmd,
				(err) => {
					if (err === null) resolve(err);
					else reject(err);
				},
				options,
			);
		});
	},
	series: function (cmd, options = undefined) {
		return new Promise((resolve, reject) => {
			exports.series(
				cmd,
				(err) => {
					if (err === null) resolve(err);
					else reject(err);
				},
				options,
			);
		});
	},
};
