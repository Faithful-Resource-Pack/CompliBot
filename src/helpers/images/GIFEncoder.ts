import GIFEncoder from "gif-encoder-2";

/**
 * The original function can be found here:
 * https://github.com/benjaminadk/gif-encoder-2/blob/master/src/GIFEncoder.js#L241
 */
export default class GIFEncoderFixed extends GIFEncoder {
	[x: string]: any; // index signature for typescript

	constructor(width: number, height: number) {
		super(width, height);
	}

	findClosest() {
		return 0;
	}
}
