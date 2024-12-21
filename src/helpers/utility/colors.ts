import { ColorResolvable } from "discord.js";

export const colors = {
	// status/generic colors
	red: "#f44336",
	yellow: "#ffdc16",
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
	classic_faithful_64x_progart: "#0c2abd",
	// workaround for getting const keys + djs compatible values
} satisfies Record<string, ColorResolvable>;
