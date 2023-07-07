// ! TODO IMPORTANT is it still useful ?

const firestorm = require("./index");
const all = require("./all");

let contrib;
let idsToDelete, idsToSet;

const cp = all.contributions.read_raw();

Promise.all([cp])
	.then((arr) => {
		contrib = arr[0];
		contrib = Object.values(contrib);

		idsToDelete = [];
		idsToSet = [];
		contrib.forEach((c) => {
			if (!idsToDelete.includes([firestorm.ID_FIELD])) {
				const same = contrib.filter(
					(el) =>
						el[firestorm.ID_FIELD] != c[firestorm.ID_FIELD] &&
						el.date == c.date &&
						c.textureID == el.textureID &&
						c.res == el.res,
				);

				same.forEach((s) => {
					idsToDelete.push(s[firestorm.ID_FIELD]);
				});

				idsToSet.push(c[firestorm.ID_FIELD]);

				c.contributors = {};
				c.contributors[c.contributorID] = true;

				const others = same.map((s) => s.contributorID);
				if (others.length) {
					others.forEach((id) => {
						c.contributors[id] = id;
					});
				}

				c.contributors = Object.keys(c.contributors);
			}
		});

		console.log(contrib.filter((c) => c.contributors.length > 1).map((c) => c.contributors));

		contrib = contrib.filter((c) => idsToSet.includes(c[firestorm.ID_FIELD]));

		contrib.forEach((c) => {
			delete c.contributorID;
		});
	})
	.then(() => {
		return all.contributions.removeBulk(idsToDelete);
	})
	.then(() => {
		return all.contributions.setBulk(idsToSet, contrib);
	})
	.then((res) => {
		console.log(res);
	})
	.catch((err) => {
		console.error(err);
	});
