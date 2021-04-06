const Canvas     = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const Discord    = require('discord.js');
const colors     = require('../res/colors');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');

var FACTOR = 8;

async function animate(message, valMCMETA, valURL) {

	let texture = [];

	getMeta(valURL).then(async function(dimension) {
		if (dimension.width == dimension.height) return warnUser(message, 'This texture can\'t be animated.');
		if (dimension.width * FACTOR > 4096) return warnUser(message, 'This texture is too wide.');
		if (dimension.width * FACTOR > 1024) FACTOR = 1;

		texture.canvas = await sizeUP(valURL, dimension);
		texture.width  = dimension.width * FACTOR;
		texture.height = dimension.height * FACTOR;

		// NOTE: Width & Height properties from MCMETA aren't supported

		let canvas  = Canvas.createCanvas(texture.width, texture.width);
		let context = canvas.getContext('2d');

		let MCMETA = typeof valMCMETA === 'object' ? valMCMETA : { animation: {} };
		if (!MCMETA.animation) MCMETA.animation = {};

		// Initialization:
		let frametime = MCMETA.animation.frametime || 1;
		let frames    = [];

		// MCMETA.animation.frames is defined
		if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
			for (let i = 0; i < MCMETA.animation.frames.length; i++) {
				const frame = MCMETA.animation.frames[i];

				if (typeof frame === 'number') {
					frames.push({
						index:    frame,
						duration: frametime
					});
				}
				else if (typeof frame === 'object') {
					frames.push({
						index: frame.index || i,
						duration: frame.time || frametime
					});
				}
				// If wrong frames support is given
				else {
					frames.push({
						index:    i,
						duration: frametime
					})
				}
			}
		}
		// MCMETA.animation.frames is not defined
		else {
			for (let i = 0; i < texture.height / texture.width; i++) {
				frames.push({
					index:    i,
					duration: frametime
				});
			}
		}

		// console.log(frames);

		// Draw frames:
		const encoder = new GIFEncoder(texture.width, texture.width);
		encoder.start();

		context.globalCompositeOperation = 'copy';

		if (MCMETA.animation.interpolate) {
			let ratio = 0;

			let limit = frametime;
			if (limit >= 100) limit /= 10;

			for (let i = 0; i < frames.length; i++) {
				for (let y = 1; y <= limit; y++) {
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.imageSmoothingEnabled = texture.width > canvas.width;
					context.globalAlpha = 1;

					// frame i (always 100%)
					context.drawImage(
						texture.canvas, 										// image
						0, texture.width * frames[i].index, // sx, sy
						texture.width, texture.width,			  // sWidth, sHeight
						0, 0,															  // dx, dy
						canvas.width, canvas.height					// dWidth, dHeight
					);

					ratio = (100 / frametime) * y;
					context.globalAlpha = ratio / 100;

					// frame i + 1 (follow the ratio)
					context.drawImage(
						texture.canvas,																						// image
						0, texture.width * frames[(i + 1) % frames.length].index, // sx, sy
						texture.width, texture.width,															// sWidth, sHeight
						0, 0,																											// dx, dy
						canvas.width, canvas.height																// dWidth, dHeight
					);

					if (limit == frametime) encoder.setDelay(50); // frames count == frametime -> time of 1 frame == 1 tick -> 50ms
					else encoder.setDelay(500);
					encoder.addFrame(context);
				}
			}

			let bool = await isTransparent(valURL, dimension, frames);
			encoder.setTransparent(bool);
		}
		else {
			for (let i = 0; i < frames.length; i++) {
				context.clearRect(0, 0, canvas.width, canvas.height)
				context.imageSmoothingEnabled = texture.width > canvas.width;
				context.globalAlpha = 1;

				// see: https://media.prod.mdn.mozit.cloud/attachments/2012/07/09/225/46ffb06174df7c077c89ff3055e6e524/Canvas_drawimage.jpg
				context.drawImage(
					texture.canvas, 										// image
					0, texture.width * frames[i].index, // sx, sy
					texture.width, texture.width,			  // sWidth, sHeight
					0, 0,															  // dx, dy
					canvas.width, canvas.height					// dWidth, dHeight
				);

				encoder.setDelay(50 * frames[i].duration);
				encoder.addFrame(context);
			}

			let bool = await isTransparent(valURL, dimension, frames);
			encoder.setTransparent(bool);
		}

		encoder.finish();

		// Send result:
		const attachment = new Discord.MessageAttachment(encoder.out.getData(), 'output.gif');
		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setTitle(`Animated:`)
			.setDescription(`Original size: ${dimension.width}px x ${dimension.height} px`)
			.attachFiles([attachment]);

		const embedMessage = await message.inlineReply(embed);
	});
}

// Check if there is one frame non-transparent (avoid weird bug see: https://cdn.discordapp.com/attachments/792757663779389440/825420676310630460/output.gif)
async function isTransparent(valURL, dimension, frames) {
	let context = Canvas.createCanvas(dimension.width, dimension.width).getContext('2d');
	let image   = await Canvas.loadImage(valURL);
	let transparency = false;

	for (let i = 0; i < dimension.height / dimension.width; i++) {
		context.drawImage(
			image, 															// image
			0, dimension.width * frames[i].index, // sx, sy
			dimension.width, dimension.width,		  // sWidth, sHeight
			0, 0,															  	// dx, dy
			dimension.width, dimension.width			// dWidth, dHeight
		);

		transparency = await isFrameTransparent(context, dimension.width);
		if (!transparency) break;
	}
	return transparency;
}

async function isFrameTransparent(context, width) {
	let image = context.getImageData(0,0, width, width).data;
	let i, a;

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < width; y++) {
			i = (y * width + x) * 4;
			a = image[i+3];

			if (a == 0) return true;
		}
	}

	return false;
}

async function sizeUP(valURL, dimension) {
	let contextIN  = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d');
	let canvasOUT  = Canvas.createCanvas(dimension.width * FACTOR, dimension.height * FACTOR);
	let contextOUT = canvasOUT.getContext('2d');

	let temp = await Canvas.loadImage(valURL);
	contextIN.drawImage(temp, 0, 0);
	let image = contextIN.getImageData(0, 0, dimension.width, dimension.height).data;

	let i, r, g, b, a;

	for (var x = 0; x < dimension.width; x++) {
		for (var y = 0; y < dimension.height; y++) {
			i = (y * dimension.width + x) * 4;
			r = image[i];
			g = image[i+1];
			b = image[i+2];
			a = image[i+3];

			contextOUT.fillStyle = `rgba(${r},${g},${b},${a})`;
			contextOUT.fillRect(x * FACTOR, y * FACTOR, FACTOR, FACTOR);
		}
	}

	return canvasOUT;
}

exports.animate = animate;


// OLD :

	/*
		
		if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
			// If the animation should interpolate between frames or
			// if any of the frames has a duration that is not a multiple of 'frametime',
			// the animation should be updated every game tick (50ms)
			if (MCMETA.animation.interpolate || (MCMETA.animation.frames.find(e => typeof e === 'object' && e.time % frametime != 0))) interval = 1;
			else interval = frametime;
			
			// Convert frames from the MCMETA format
			for (let i = 0; i < MCMETA.animation.frames.length; i++) {
				const frame = MCMETA.animation.frames[i]

				// Default frame duration
				if (typeof frame === 'number') {
					frames.push({
						index: frame,
						duration: interval
					})
				}
				// Non-default frame duration
				else {
					frames.push({
						index: frame.index,
						duration: Math.max(frame.time, 1) / interval
					})
				}
			}
		}
		// Default frame order, no varying frame durations
		else {
			// If the animation should interpolate between frames, the animation should be updated every game tick (50ms)
			if (MCMETA.animation.interpolate) {
				interval = 1

				// Create frames
				let n = texture.height / texture.width
				for (let i = 0; i < n; i++) {
					frames.push({
						index: i,
						duration: frametime / interval
					})
				}
			} else {
				interval = frametime

				// Create frames
				let n = texture.height / texture.width
				for (let i = 0; i < n; i++) {
					frames.push({
						index: i,
						duration: frametime
					})
				}
			}
			
		}*/