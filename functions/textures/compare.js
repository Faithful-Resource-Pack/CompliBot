const { createCanvas, loadImage, ImageData } = require("@napi-rs/canvas");
const { MessageAttachment } = require("discord.js");

const getDimensions = require("./getDimensions");

const settings = require("../../resources/settings.json");

/**
 * shows the per-pixel difference between two images:
 * blue is changed
 * red is removed
 * green is added
 * @author Evorp, EwanHowell
 * @param {String} firstUrl first url to compare
 * @param {String} secondUrl second url to compare
 * @param {Number?} tolerance difference between colors considered acceptable
 * @returns {MessageAttachment} compared image
 */
module.exports = async function compare(firstUrl, secondUrl, tolerance=2) {
	const urls = [firstUrl, secondUrl];
	let mappedUrls = [];

	let temp, canvas, ctx, pixels;
	for (let url of urls) {
		const { height, width } = await getDimensions(url);
		if (height * width > 262144) return "bruh";
		temp = await loadImage(url);
		canvas = createCanvas(width, height);
		ctx = canvas.getContext("2d");
		ctx.drawImage(temp, 0, 0);
		pixels = ctx.getImageData(0, 0, width, height).data;
		mappedUrls.push({ pixels, width, height });
	}

	const finalWidth = Math.max(...mappedUrls.map((i) => i.width));
	const finalHeight = Math.max(...mappedUrls.map((i) => i.height));

	const blue = await hexToArr(settings.colors.blue);
	const green = await hexToArr(settings.colors.green);
	const red = await hexToArr(settings.colors.red);

	const length = finalWidth * finalHeight * 4;
	const buff = new Uint8ClampedArray(finalWidth * finalHeight * 4);

	for (let i = 0; i < length; i += 4) {
		const x = (i / 4) % finalWidth;
		const y = Math.floor(i / 4 / finalWidth);
		if (
			(x >= mappedUrls[0].width && y >= mappedUrls[1].height) ||
			(x >= mappedUrls[1].width && y >= mappedUrls[0].height)
		)
			continue;
		else if (
			(x >= mappedUrls[1].width && x <= mappedUrls[0].width) ||
			(y >= mappedUrls[1].height && y <= mappedUrls[0].height)
		)
			buff.set(red, i);
		else if (
			(y >= mappedUrls[0].height && y <= mappedUrls[1].height) ||
			(x >= mappedUrls[0].width && x <= mappedUrls[1].width)
		)
			buff.set(green, i);
		else {
			const i1 = (x + y * mappedUrls[0].width) * 4;
			const i2 = (x + y * mappedUrls[1].width) * 4;
			if (
				Math.max(
					Math.abs(mappedUrls[0].pixels[i1] - mappedUrls[1].pixels[i2]),
					Math.abs(mappedUrls[0].pixels[i1 + 1] - mappedUrls[1].pixels[i2 + 1]),
					Math.abs(mappedUrls[0].pixels[i1 + 2] - mappedUrls[1].pixels[i2 + 2]),
					Math.abs(mappedUrls[0].pixels[i1 + 3] - mappedUrls[1].pixels[i2 + 3]),
				) < tolerance
			) {
				buff.set(mappedUrls[0].pixels.slice(i1, i1 + 3), i);
				buff[i + 3] = mappedUrls[0].pixels[i1 + 3] / 4;
			} else if (mappedUrls[0].pixels[i1 + 3] === 0 && mappedUrls[1].pixels[i2 + 3] !== 0)
				buff.set(green, i);
			else if (mappedUrls[0].pixels[i1 + 3] !== 0 && mappedUrls[1].pixels[i2 + 3] === 0)
				buff.set(red, i);
			else if (
				mappedUrls[0].pixels[i1] === mappedUrls[1].pixels[i2] &&
				mappedUrls[0].pixels[i1 + 1] === mappedUrls[1].pixels[i2 + 1] &&
				mappedUrls[0].pixels[i1 + 2] === mappedUrls[1].pixels[i2 + 2] &&
				mappedUrls[0].pixels[i1 + 3] === mappedUrls[1].pixels[i2 + 3]
			) {
				buff.set(mappedUrls[0].pixels.slice(i1, i1 + 3), i);
				buff[i + 3] = mappedUrls[0].pixels[i1 + 3] / 4;
			} else buff.set(blue, i);
		}
	}

	const out = createCanvas(finalWidth, finalHeight);
	out.getContext("2d").putImageData(new ImageData(buff, finalWidth, finalHeight), 0, 0);
	const finalBuffer = out.toBuffer("image/png");
	return new MessageAttachment(finalBuffer, "compared.png");
};

async function hexToArr(hex) {
	hex = hex.replace("#", "");
	// hack I found on stackoverflow
	const splitHex = hex.match(/.{1,2}/g);
	const finalArr = splitHex.map((i) => parseInt(`0x${i}`));
	// add alpha
	finalArr.push(255);
	return finalArr;
}
