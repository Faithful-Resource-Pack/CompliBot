function walkSync(dir, filelist = []) {
	if (dir[dir.length - 1] != "/") dir = dir.concat("/");
	const fs = require("fs"),
		files = fs.readdirSync(dir);
	files.forEach((file) => {
		if (fs.statSync(dir + file).isDirectory()) filelist = walkSync(dir + file + "/", filelist);
		else filelist.push(dir + file);
	});
	return filelist;
}

exports.walkSync = walkSync;
