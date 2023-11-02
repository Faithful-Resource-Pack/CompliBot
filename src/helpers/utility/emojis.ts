// note: the key name should be the same as the actual name
export const emojis = {
	bug: "959344133145755648",
	suggestion: "959344133158350869",
	view_votes: "949830600125194281",
	pmc: "863132124333080576",
	diff: "1119109164959027291",
	modrinth: "1129458572095397965",
	github: "1129461571601567855",
	mcpedl: "1129458566659575918",
	curseforge: "863132124306472980",
	f32_logo: "963455577630064741",
	f64_logo: "963455576690556998",
	dungeons_logo: "963455576649905890",
	extras_logo: "1129462668185575464",
	mods_logo: "963455576833138720",
	faithful_logo: "1129462670681198714",
	tweaks_logo: "963455577453887518",
	addons_logo: "963455574656286750",
	magnify: "918186631226339339",
	invalid: "918186621323579433",
	instapass: "918186611794137168",
	see_less: "918186673496543242",
	see_more: "918186683055349810",
	palette: "918186650822131742",
	upvote: "918186701975859307",
	downvote: "918186603007078420",
	delete: "1103485671903076403",
	compare: "918186583176405032",
	tile: "918186692307996723",
	next_res: "918186640571256842",
	pending: "918186662780092537",
	flip: "942325434308243497",
	rotate: "942325479661256754",
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
