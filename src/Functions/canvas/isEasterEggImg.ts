import get from "axios";

async function easterEgg(url: string, id: number): Promise<Boolean> {
	switch (id) {
		case 1:
			if (!url.endsWith("grass_block_side_overlay.png")) return false;

			return await get(url, { responseType: "arraybuffer" }).then((response) => {
				const data = response.data;
				const buf = Buffer.from(data, "base64").toString();
				const result = get(gamerUrl, { responseType: "arraybuffer" }).then((response) => {
					const easterEggData = response.data;
					const easterEggBuffer = Buffer.from(easterEggData, "base64").toString();
					if (buf == easterEggBuffer) return true;
					else return false;
				});
				return result;
			});
		case 2:
			if (!url.endsWith("unknown.png")) return false;

			return await get(url, { responseType: "arraybuffer" }).then((response) => {
				const data = response.data;
				const buf = Buffer.from(data, "base64").toString();
				const result = get(trolling, { responseType: "arraybuffer" }).then((response) => {
					const easterEggData = response.data;
					const easterEggBuffer = Buffer.from(easterEggData, "base64").toString();
					if (buf == easterEggBuffer) return true;
					else return false;
				});
				return result;
			});
	}
}
export default easterEgg;

//de funny
const gamerUrl =
	"https://cdn.discordapp.com/attachments/923370825762078720/939888814028111992/grass_block_side_overlay.png";
const trolling = "https://cdn.discordapp.com/attachments/923370825762078720/940676512368177172/unknown.png";
