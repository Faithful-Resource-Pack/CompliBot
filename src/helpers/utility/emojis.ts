// note: the key name should be the same as the emoji name
export const emojis = {
	// listings
	pmc: "863132124333080576",
	curseforge: "863132124306472980",
	modrinth: "1129458572095397965",
	github: "1129461571601567855",
	mcpedl: "1129458566659575918",
	// project logos
	f32_logo: "963455577630064741",
	f64_logo: "963455576690556998",
	dungeons_logo: "963455576649905890",
	extras_logo: "1129462668185575464",
	mods_logo: "963455576833138720",
	faithful_logo: "1129462670681198714",
	tweaks_logo: "963455577453887518",
	addons_logo: "963455574656286750",
	// image buttons
	magnify: "918186631226339339",
	palette: "918186650822131742",
	delete: "1103485671903076403",
	compare: "918186583176405032",
	tile: "918186692307996723",
	flip: "942325434308243497",
	rotate: "942325479661256754",
	question_mark: "1181025437560877087",
	cycle: "918186640571256842",
	// poll buttons
	upvote: "918186701975859307",
	downvote: "918186603007078420",
} as const;

/**
 * Convert a reaction id into an inline emoji string
 * @author Nick
 * @param id emoji id
 * @returns usable string
 */
export function parseID(id: string) {
	return `<:${Object.keys(emojis).find((key) => emojis[key] === id)}:${id}>`;
}

export type emojiTypes = keyof typeof emojis;
