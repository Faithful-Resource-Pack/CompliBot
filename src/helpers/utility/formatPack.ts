/**
 * Format a pack ID into a displayable name and icon
 * @author Evorp
 * @param pack pack to format
 * @param size optionally specify size of image
 * @todo phase out in favor of pack API
 * @returns formatted string and pack's image URL
 */
export default function formatPack(pack: string, size?: number) {
	let name: string;
	let iconURL = "https://database.faithfulpack.net/images/branding/logos/transparent/hd/";
	switch (pack) {
		case "faithful_32x":
			name = "Faithful 32x";
			iconURL += "f32_logo.png";
			break;
		case "faithful_64x":
			name = "Faithful 64x";
			iconURL += "f64_logo.png";
			break;
		case "classic_faithful_32x":
			name = "Classic Faithful 32x Jappa";
			iconURL += "cf32j_logo.png";
			break;
		case "classic_faithful_32x_progart":
			name = "Classic Faithful 32x";
			iconURL += "cf32_logo.png";
			break;
		case "classic_faithful_64x":
			name = "Classic Faithful 64x Jappa";
			iconURL += "cf64j_logo.png";
			break;
		case "classic_faithful_64x_progart":
			name = "Classic Faithful 64x";
			iconURL += "cf64_logo.png";
			break;
		case "progart":
			name = "Default Programmer Art";
			// have to redefine since root directory is different
			iconURL = `https://database.faithfulpack.net/images/bot/progart.png`;
			break;
		default:
			name = "Default Jappa";
			iconURL = `https://database.faithfulpack.net/images/bot/default.png`;
			break;
	}
	if (size) iconURL += `?w=${size}`;
	return { name, iconURL };
}
