/**
 * Can't fetch from settings.json since djs complains about color resolving
 * so we declare them all here
 */
export const colors = {
	// status/generic colors
	red: "#f44336",
	yellow: "#ffeb3b",
	blue: "#5865F2",
	black: "#000000",
	council: "#9c3848",
	green: "#4caf50",
	coin: "#ffdc16",
	// branding colors
	brand: "#76c945",
	faithful_32x: "#00a2ff",
	faithful_64x: "#d8158d",
	classic_faithful_32x: "#00c756",
	classic_faithful_32x_progart: "#a1db12",
	classic_faithful_64x: "#9f00cf",
} as const;
