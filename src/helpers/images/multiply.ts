import { ImageData, createCanvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import { ImageSource } from "@helpers/getImage";

export const mcColors = {
	Foliage: "#5BAB46",
	ColdFoliage: "#60A17B",
	LushFoliage: "#1ABF00",
	DryFoliage: "#AEA42A",
	Grass: "#7CBD6B",
	ColdGrass: "#80B497",
	LushGrass: "#47CD33",
	DryGrass: "#BFB755",
	WhiteDye: "#F9FFFE",
	OrangeDye: "#F9801D",
	MagentaDye: "#C74EBD",
	LightBlueDye: "#3AB3DA",
	YellowDye: "#FED83D",
	LimeDye: "#80C71F",
	PinkDye: "#F38BAA",
	GrayDye: "#474F52",
	LightGrayDye: "#9D9D97",
	CyanDye: "#169C9C",
	PurpleDye: "#8932B8",
	BlueDye: "#3C44AA",
	BrownDye: "#835432",
	GreenDye: "#5E7C16",
	RedDye: "#B02E26",
	BlackDye: "#1D1D21",
};

export const mcColorsOptions: { name: string; value: string }[] = Object.keys(mcColors).map(
	// a cheeky regex for formatting
	(name: keyof typeof mcColors) => ({
		name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
		value: mcColors[name],
	}),
);

/**
 * Tint a grayscale image with a provided color
 * @author Nick, Evorp
 * @param origin what to multiply over
 * @param color what color to multiply
 * @returns multiplied image
 */
export async function multiply(origin: ImageSource, color: string) {
	const imageToDraw = await loadImage(origin);
	const canvas = createCanvas(imageToDraw.width, imageToDraw.height);
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height);

	const before: ImageData = ctx.getImageData(0, 0, imageToDraw.width, imageToDraw.height);

	// save alpha to undo later
	const savedAlpha = structuredClone(before);

	for (let i = 0; i < before.data.length; i += 4) before.data[i + 3] = 255;

	// apply full alpha version (needed so colors don't get all jank when multiplying)
	ctx.putImageData(before, 0, 0);

	ctx.globalCompositeOperation = "multiply";
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, imageToDraw.width, imageToDraw.height);

	const after: ImageData = ctx.getImageData(0, 0, imageToDraw.width, imageToDraw.height);
	for (let i = 0; i < after.data.length; i += 4) after.data[i + 3] = savedAlpha.data[i + 3];

	// revert to original alpha version
	ctx.putImageData(after, 0, 0);

	return canvas.toBuffer("image/png");
}

/**
 * Multiply a given image into a sendable attachment
 * @author Evorp
 * @param origin what to multiply over
 * @param color color to multiply
 * @param name attachment name
 * @returns sendable attachment
 */
export async function multiplyToAttachment(
	origin: ImageSource,
	color: string,
	name = "tinted.png",
) {
	const buf = await multiply(origin, color);
	return new AttachmentBuilder(buf, { name });
}
