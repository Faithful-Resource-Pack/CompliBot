import { writeFile, writeFileSync } from "fs";
import path from "path";
import en_US from "@/lang/en-US.json";
import { err, info, sucsess } from "./Helpers/logger";

const header = "A list of all translations and their completions.\nHave fun polylingual translators!\n\n";
const note = "\n\n### Note: make sure to read `/translation-guide.md` before contributing!";
const checked = "- [x] ";
const unchecked = "- [ ] ";
const languages = [
	"en-US	English (United States)",
	"en-GB	English (Great Britain)",
	"bg	Bulgarian",
	"zh-CN	Chinese (China)",
	"zh-TW	Chinese (Taiwan)",
	"hr	Croatian",
	"cs	Czech",
	"da	Danish",
	"nl	Dutch",
	"fi	Finnish",
	"fr	French",
	"de	German",
	"el	Greek",
	"hi	Hindi",
	"hu	Hungarian",
	"it	Italian",
	"ja	Japanese",
	"ko	Korean",
	"lt	Lithuanian",
	"no	Norwegian",
	"pl	Polish",
	"pt-BR	Portuguese (Brazil)",
	"ro	Romanian",
	"ru	Russian",
	"es-ES	Spanish (Spain)",
	"sv-SE	Swedish",
	"th	Thai",
	"tr	Turkish",
	"uk	Ukrainian",
	"vi	Vietnamese",
];

async function generate() {
	const size = Object.keys(en_US).length;

	for (let i = 0; i < languages.length; i++) {
		var langCode = languages[i].split(/\s/g)[0];

		let lang = {};
		let completion: number;

		try {
			lang = await import(`@/lang/${langCode == "en-GB" ? "en-US" : langCode}.json`);
		} catch (error) {
			// console.log(info + `Lang ${langCode}.json does not exist`);
		}

		//substracting 1 because default key, tested to be accurate (fr.json keys: 7, en-US.json keys: 25 : 7/25 = 0.24 = 24%)
		lang["_CONTRIBUTORS"] == undefined
			? (completion = ((Object.keys(lang).length != 0 ? Object.keys(lang).length - 1 : 0) / size) * 100)
			: (completion = ((Object.keys(lang).length != 0 ? Object.keys(lang).length - 2 : 0) / size) * 100);
		completion = parseFloat(completion.toFixed(2));

		languages[i] = (completion == 100 ? checked : unchecked) + languages[i] + ` \`${completion}%\``;
	}

	writeFileSync(path.join(__dirname, "../lang/README.md"), header + languages.join("\n") + note);
	console.log(sucsess + "Generated README.md in /lang/");
}

generate();
