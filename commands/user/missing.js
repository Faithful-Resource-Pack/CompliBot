/* global Buffer */
const prefix  = process.env.PREFIX;

// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");
const strings = require('../../resources/strings');
const settings = require('../../resources/settings');
const { mkdir } = require('fs/promises');
const filesystem = require("fs");
const { join, normalize } = require("path");
const os = require('os');
const difference = require('lodash/difference');

const { exec, series } = require('../../helpers/exec').promises;
const { warnUser } = require('../../helpers/warnUser');
const { BLUE } = require("../../resources/colors");

const COMPLIANCE_REPOS = {
	java: {
		'32': settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA,
		'64': settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA
	},
	bedrock: {
		'32': settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA,
		'64': settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA
	}
}

const BEDROCK_UI = [
  "ui/Black.png",
  "ui/5stars_empty.png",
  "ui/5stars_empty_white.png",
  "ui/5stars_full.png",
  "ui/CreateNewWorld.png",
  "ui/DarkBannerNoBorder.png",
  "ui/Gray.png",
  "ui/Grey.png",
  "ui/HowToPlayDivider.png",
  "ui/InvalidWorldDemoScreen.png",
  "ui/LoadingWorldDemoScreen.png",
  "ui/NetherPortal.png",
  "ui/NetherPortalMirror.png",
  "ui/PlaceholderStore.png",
  "ui/RTX_Sparkle.png",
  "ui/RealmDemoScreen.png",
  "ui/Scaffolding.png",
  "ui/ScrollRail.png",
  "ui/StoreTopBarFiller.png",
  "ui/ThinPlus.png",
  "ui/WorldDemoScreen.png",
  "ui/banners_no_border.png",
  "ui/banners_no_border_dark_hover.png",
  "ui/barely_visible_creeper.png",
  "ui/bonus_banner.png",
  "ui/box_number_grey.png",
  "ui/break.png",
  "ui/button_borderless_imagelesshoverbg.png",
  "ui/button_dark_color.png",
  "ui/control.png",
  "ui/dark_bg.png",
  "ui/dark_minus.png",
  "ui/dark_plus.png",
  "ui/disabledButtonNoBorder.png",
  "ui/divider",
  "ui/dropDownHoverBG.png",
  "ui/dropDownSelectBG.png",
  "ui/easily_visible_creeper.png",
  "ui/feedIcon.png",
  "ui/feed_background.png",
  "ui/first_of_three.png",
  "ui/first_of_two.png",
  "ui/glyph_mashup_pack.png",
  "ui/glyph_realms.png",
  "ui/glyph_resource_pack.png",
  "ui/glyph_skin_pack.png",
  "ui/glyph_world_template.png",
  "ui/hammersmashedits.png",
  "ui/highlight_slot.png",
  "ui/ic_send_white_48dp.png",
  "ui/icon_agent.png",
  "ui/imagetaggedcorner.png",
  "ui/imagetaggedcornergreen.png",
  "ui/imagetaggedcornergreenhover.png",
  "ui/imagetaggedcornergreenpressed.png",
  "ui/inventory_warning_xbox.png",
  "ui/lightgreybars.png",
  "ui/list_item_divider_line_light.png",
  "ui/massive_servers.png",
  "ui/menubackground.png",
  "ui/middle_strip.png",
  "ui/minus.png",
  "ui/newTouchScrollBox.png",
  "ui/normalArm.png",
  "ui/normalHeight.png",
  "ui/not_visible_creeper.png",
  "ui/numberBGBack.png",
  "ui/numberBGFront.png",
  "ui/packs_middle.png",
  "ui/particles",
  "ui/permissions_player_fade_overlay.png",
  "ui/pinksquare.png",
  "ui/pinktriangle.png",
  "ui/plus.png",
  "ui/pointer.png",
  "ui/profile_new_look.png",
  "ui/profile_new_look_small.png",
  "ui/promo_bee.png",
  "ui/promo_chicken.png",
  "ui/promo_creeper.png",
  "ui/promo_pig_sheep.png",
  "ui/promo_spider.png",
  "ui/promo_wolf.png",
  "ui/purple_gradient.png",
  "ui/rating_screen.png",
  "ui/ratings_fullstar.png",
  "ui/ratings_nostar.png",
  "ui/realmflagSmooth.png",
  "ui/realmflagtriangleSmooth.png",
  "ui/realms_art_icon.png",
  "ui/realms_key_art.png",
  "ui/realms_particles.png",
  "ui/realms_text_background.png",
  "ui/realmsparkle.png",
  "ui/realmsparkle1.png",
  "ui/recipe_book_pane_bg.png",
  "ui/recipe_book_pane_bg.png",
  "ui/ribbon_bar_text_background_hover.png",
  "ui/saleflag.png",
  "ui/saleflagtriangle.png",
  "ui/screen_background.png",
  "ui/screen_realms_plus_background.png",
  "ui/second_of_three.png",
  "ui/second_of_two.png",
  "ui/shadow.png",
  "ui/slider_background.png",
  "ui/slider_background_hover.png",
  "ui/slider_locked_transparent_fade.png",
  "ui/slider_progress.png",
  "ui/slider_progress_hover.png",
  "ui/slider_step_background.png",
  "ui/slider_step_background_hover.png",
  "ui/slider_step_progress.png",
  "ui/slider_step_progress_hover.png",
  "ui/smallHeight.png",
  "ui/smallerHeight.png",
  "ui/smithing-table-plus.png",
  "ui/solidtransparency.png",
  "ui/store_background.png",
  "ui/store_banner_no_border.png",
  "ui/store_play_button_mask.png",
  "ui/storexblsignin.png",
  "ui/strikethru.png",
  "ui/sunset_keyart.png",
  "ui/sunset_pending_keyart.png",
  "ui/tallHeight.png",
  "ui/third_of_three.png",
  "ui/thinArm.png",
  "ui/title.png",
  "ui/tooltip_notification_default_background.png",
  "ui/touchScrollBox.png",
  "ui/underline.png",
  "ui/underline_focus.png",
  "ui/unsynced_bg_hover.png",
  "ui/user_icon.png",
  "ui/user_icon_small.png",
  "ui/user_icon_white.png",
  "ui/vertical_divider.png",
  "ui/verticalgradient.png",
  "ui/warning_alex.png",
  "ui/white_background.png",
  "ui/whiteline.png",
  "ui/yellow_banner.png"
]

const VANILLA_REPOS = {
	java: settings.DEFAULT_MC_JAVA_REPOSITORY,
	bedrock: settings.DEFAULT_MC_BEDROCK_REPOSITORY
}

const REPLACE_URLS = [
	['raw.githubusercontent.com', 'github.com'],
	['Jappa-', '']
]

const _rawToRepoURL = function(val) {
	let result = val
	REPLACE_URLS.forEach(pair => {
		result = result.replace(pair[0], pair[1])
	})
	return result
}

const FOLDERS_NAMES = {
	vanilla: 'vanilla',
	compliance: 'compliance'
}

const normalizeArray = (arr) => arr.map(e => normalize(e))

const includesNone = function(arr, val) {
	let result = true

	let i = 0
	while(i < arr.length && result) {
		result = !val.includes(arr[i])
		++i
	}

	return result
}

const _getAllFilesFromFolder = function(dir, filter = []) {
	let results = []

	filesystem.readdirSync(dir).forEach(function(file) {
		file = normalize(join(dir, file))
		const stat = filesystem.statSync(file)

		if(!file.includes('.git')) {
			if (stat && stat.isDirectory()) {
					results = results.concat(_getAllFilesFromFolder(file, filter))
			} else {
				if(file.endsWith('.png') && includesNone(filter, file)) {
					results.push(file)
				}
			}
		}
	})
	return results
};

module.exports = {
	name: 'missing',
	description: strings.HELP_DESC_MISSING,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}missing <32|64> <java|bedrock>`,
	example: `${prefix}missing 32 java`,
  /**
   * @param {Discord.Client} client Discord client using this command
   * @param {Discord.Message} message Incoming message matching
   * @param {Array<string>} args Arguments after the command
   * @author TheRolf
   */
	async execute(_client, message, args) {
		if (args.length < 2) return warnUser(message, strings.FEEDBACK_NO_ARGS_GIVEN);

		const res = args[0].trim().toLowerCase()
    const edition = args[1].trim().toLowerCase()

    if((edition !== 'java' && edition !== 'bedrock') || (res !== '32' && res !== '64')) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)

    const vanilla_repo = _rawToRepoURL(VANILLA_REPOS[edition])
		const compliance_repo = _rawToRepoURL(COMPLIANCE_REPOS[edition][res])

		let embed = new Discord.MessageEmbed()
			.setTitle('Executing missing command...')
			.setDescription('This command is long to execute so please be patient...')
			.setThumbnail(settings.LOADING_IMG)
			.setColor(BLUE)
			.setFooter(message.client.user.username, settings.BOT_IMG)
			.addField('Steps', 'Steps will be listed here')

		let embedMessage = await message.reply({ embed: embed, embeds: [embed]})

		let steps = []

		let tmp_filepath = normalize(os.tmpdir())
		let vanilla_tmp_path, compliance_tmp_path

		vanilla_tmp_path = join(tmp_filepath, 'missing-' + FOLDERS_NAMES.vanilla + '-' + edition)
		compliance_tmp_path = join(tmp_filepath, 'missing-' + FOLDERS_NAMES.compliance + '-' + edition + '-' + res)

		let exists = filesystem.existsSync(vanilla_tmp_path)
		if(!exists) {
			steps.push(`Cloning vanilla ${edition} repo...`)
			await embedMessage.edit(embed)
			await mkdir(vanilla_tmp_path)
			await exec(`git clone ${ vanilla_repo } .`, {
				cwd: vanilla_tmp_path
			})
		}
		exists = filesystem.existsSync(compliance_tmp_path)
		if(!exists) {
			steps.push(`Cloning Compliance ${edition} ${res} repo...`)
			await embedMessage.edit(embed)

			await mkdir(compliance_tmp_path)
			await exec(`git clone ${ compliance_repo } .`, {
				cwd: compliance_tmp_path
			})
		}

		const last_version = edition === 'bedrock' ? settings.LATEST_MC_BE_VERSION : settings.LATEST_MC_JE_VERSION

		steps.push('Updating repos with latest version known...')
		embed.fields[0].value = steps.join('\n')
		await embedMessage.edit(embed)

		// anyway stash
		// checkout latest branch
		// pull
		await Promise.all([
			series([
				'git stash',
				`git checkout ${last_version}`,
				`git pull`
			], {
				cwd: vanilla_tmp_path
			}),
			series([
				'git stash',
				`git checkout Jappa-${last_version}`,
				`git pull`
			], {
				cwd: compliance_tmp_path
			})
		])

		// diff
		steps.push(`Creating diff...`)
		embed.fields[0].value = steps.join('\n')
		await embedMessage.edit(embed)

		const edition_filter = edition === 'java' ? normalizeArray(['font/', 'colormap/', 'misc/shadow', 'presets/isles', 'realms/inspiration', 'realms/new_world', 'realms/survival_spawn', 'realms/upload', 'realms/adventure', 'realms/experience', 'environment/clouds', 'misc/nausea', 'misc/vignette', 'realms/darken', 'realms/plus_icon', 'models/armor/piglin_leather_layer_1', 'entity/phantom_eyes.png', 'misc/white.png', 'block/lightning_rod_on.png'
			, 'gui/title/background/panorama_overlay.png']) : normalizeArray([...BEDROCK_UI, 'font/', 'colormap/', '/gui/', 'environments/clouds', 'persona_thumbnails/', 'environment/end_portal_colors', 'textures/flame_atlas', 'textures/forcefield_atlas', 'blocks/bed_feet_', 'blocks/bed_head_', 'blocks/flower_paeonia', 'blocks/flower_rose_blue', 'blocks/structure_air', 'map/player_icon_background', 'misc/missing_texture', 'items/boat', 'items/egg_agent', 'items/quiver', 'items/ruby', 'entity/agent.png', 'entity/cape_invisible.png', 'entity/char.png', 'entity/horse/', 'entity/lead_rope.png', 'entity/loyalty_rope.png', 'entity/pig/pigzombie.png', 'entity/villager/', 'entity\\wither_boss\\wither_armor_blue.png', 'entity/zombie_villager/'])

		const vanilla_textures = _getAllFilesFromFolder(vanilla_tmp_path, edition_filter).map(f => normalize(f).replace(vanilla_tmp_path, ''))
		const compliance_textures = _getAllFilesFromFolder(compliance_tmp_path).map(f => normalize(f).replace(compliance_tmp_path, ''))

		const diff_result = difference(vanilla_textures, compliance_textures).sort()

		embed.fields[0].value = steps.join('\n')
		await embedMessage.edit(embed)

		embed.addField('Results', Math.round(10000 - diff_result.length / vanilla_textures.length * 10000)/100 + `% complete\n ${ diff_result.length } textures missing`)
		.setThumbnail(settings.BOT_IMG)
		await embedMessage.edit(embed)

		const result_file = new Discord.MessageAttachment(Buffer.from(diff_result.join('\n'), 'utf8'), `missing-${edition}-${res}.txt`)

		await message.reply({ files: [result_file] })
	}
};
