const LATEST_MC_JE_VERSION = '1.17';
const LATEST_MC_BE_VERSION = '1.16.210';

// General stuff
const BOT_ERROR = 'Action Failed';
const BOT_AUTOREACT_ERROR = 'Auto Reaction Failed';

// command stuff
const COMMAND_DISABLED                   = 'This command is currently disabled';
const COMMAND_ERROR                      = 'One of my developers made an error while coding this command! Don\'t worry, the error is not on your side.';
const COMMAND_MAINTENANCE                = 'I\'m currently in maintenance, please try again later.';
const COMMAND_NO_ARGUMENTS_GIVEN         = 'You did not provide any arguments';
const COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN = 'You did not provide enough arguments';
const COMMAND_NO_PERMISSION              = 'You don\'t have the permission to do that!';
const COMMAND_PROVIDE_VALID_TAG          = 'Please provide a user tag!';
const COMMAND_PROVIDE_A_NUMBER           = 'Please provide a number!';
const COMMAND_WRONG_ARGUMENTS_GIVEN      = 'You did not provide valid arguments';
const CANT_EXECUTE_IN_DMS                = 'I can\'t execute this command inside DM\'s!';

// Help descriptions
const HELP_DESC_HOTFIX = 'Fix something, may change at anytime';
const HELP_DESC_PING = 'Pong!';
const HELP_DESC_RELOAD = 'Reloads a command';
const HELP_DESC_SHUTDOWN = 'stops the bot';
const HELP_DESC_STATUS = 'Changes the bot\'s status: \n**Activity**:\nPLAYING, STREAMING, LISTENING, WATCHING, COMPETING, CUSTOM_STATUS (does not work)\n**Presence**:\nonline, idle, dnd';

const HELP_DESC_BEAN = 'get B E A N E D';
const HELP_DESC_BEHAVE = '(⌯˃̶᷄ ﹏ ˂̶᷄⌯)';
const HELP_DESC_ORDER = 'Order something';
const HELP_DESC_QUOTE = 'Get a random quote!';
const HELP_DESC_SAY = 'Make the bot send any message you specify';

const HELP_DESC_CLEAR = 'Clear messages in a channel';
const HELP_DESC_EMBED = 'Modify an embed!';
const HELP_DESC_MUTE = 'Mute someone';
const HELP_DESC_SLOWMODE = 'Enable or disable the slowmode in a channel';
const HELP_DESC_UNMUTE = 'Remove Muted roles to someone';
const HELP_DESC_WARN = 'Warn someone';

const HELP_DESC_ABOUT = 'Displays texture that you or someone made';
const HELP_DESC_AUTOPUSH = 'Use: `/autopush` to push textures from #results to GitHub!';
const HELP_DESC_CONTRIBUTORS = 'Use: `/contributors add ...` to add a new author.\nuse: `/contributors remove ...` to remove a contributor';
const HELP_DESC_MAGNIFY = 'Resize an image,\nImage URL needs to end with ``.png`` or ``.jpeg/jpg``,\nMessage ID needs to be from the same channel';
const HELP_DESC_PALETTE = 'Get colors of an image,\nImage URL needs to end with ``.png`` or ``.jpeg/jpg``,\nMessage ID needs to be from the same channel';
const HELP_DESC_PUSH = 'Push file to GitHub & update contributors list, make /push done to push all files in GitHub and update contributors lists.';
const HELP_DESC_TEXTURE = 'Displays a specified texture from either vanilla or Compliance.\nYou can search for a texture name, or use ``_`` at the begining to search for non-complete names (such as _sword).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.';
const HELP_DESC_TILE = 'Tile an image, if no arguments are given, grid shape is selected by default & the bot search in the last 10 message for an image.';

const HELP_DESC_DISCORDS = 'Posts a list of specified discord servers';
const HELP_DESC_FEEDBACK = 'Suggest things or report bugs directly to the bot devs';
const HELP_DESC_HELP = 'Show help for a specified command';
const HELP_DESC_INFO = 'Displays some info about the bot in your DMs';
const HELP_DESC_MODPING = 'Tag online mods to invoke help!';
const HELP_DESC_MODTOOLS = 'Displays tools for Minecraft Dungeons modding';
const HELP_DESC_POLL = 'Make a poll to ask people!';
const HELP_DESC_PROFILE = 'Add personal information for the Compliance Website Gallery';
const HELP_DESC_RULES = 'Creates rules embed';
const HELP_DESC_TRANSLATE = 'Translates messages (duh)';
const HELP_DESC_WEBSITE = 'Displays the website of the discord';

// Bean command
const BEAN_CANT_BEAN_SELF = 'You can\'t bean yourself!';

// Website command
const WEBSITE_PROVIDE_VALID_ARGUMENT = 'Please specify a valid argument! \nYou can use: \n`32x`, `64x`, `addons`, `tweaks`, `dungeons` and `mods`';
const WEBSITE_NO_SITE_REGISTERED = 'I don\'t have any website registered for this server :(';

// Texture command
const TEXTURE_DOESNT_EXIST = '**Note: this command isn\'t updated for 21w11a yet, if you\'re currently looking for a 21w11a texture**\nThe specified texture/folder doesn\'t exist!';
//const TEXTURE_DOESNT_EXIST = 'The specified texture/folder doesn\'t exist!';
const TEXTURE_FAILED_LOADING = 'This texture has not yet been made or is not present on GitHub!';

// Submissions
const TEXTURE_WIN_COUNCIL = 'The following texture has passed council voting and will be added into the pack in a future version.';
const TEXTURE_DEFEAT_COUNCIL = 'The following texture has not passed council voting and thus is up for revote.';
const TEXTURE_WIN_REVOTE = 'This texture has passed community voting and thus will be added into the pack in a future version.';
const TEXTURE_DEFEAT_REVOTE = 'This texture has not passed council and community voting and thus will not be added into the pack.';

// Auto React command:
const SUBMIT_NO_FILE_ATTACHED = 'Your submission has to have a file attached!';

module.exports = {
	LATEST_MC_JE_VERSION,
	LATEST_MC_BE_VERSION,
	
	BOT_ERROR,
	BOT_AUTOREACT_ERROR,

	COMMAND_NO_ARGUMENTS_GIVEN,
	COMMAND_WRONG_ARGUMENTS_GIVEN,
	COMMAND_NO_PERMISSION,
	COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN,
	COMMAND_PROVIDE_VALID_TAG,
	COMMAND_PROVIDE_A_NUMBER,
	COMMAND_DISABLED,
	COMMAND_MAINTENANCE,
	COMMAND_ERROR,
	CANT_EXECUTE_IN_DMS,

	HELP_DESC_HOTFIX,
	HELP_DESC_PING,
	HELP_DESC_RELOAD,
	HELP_DESC_SHUTDOWN,
	HELP_DESC_STATUS,

	HELP_DESC_BEAN,
	HELP_DESC_BEHAVE,
	HELP_DESC_ORDER,
	HELP_DESC_QUOTE,
	HELP_DESC_SAY,

	HELP_DESC_CLEAR,
	HELP_DESC_EMBED,
	HELP_DESC_MUTE,
	HELP_DESC_SLOWMODE,
	HELP_DESC_UNMUTE,
	HELP_DESC_WARN,

	HELP_DESC_ABOUT,
	HELP_DESC_AUTOPUSH,
	HELP_DESC_CONTRIBUTORS,
	HELP_DESC_MAGNIFY,
	HELP_DESC_PALETTE,
	HELP_DESC_PUSH,
	HELP_DESC_TEXTURE,
	HELP_DESC_TILE,

	HELP_DESC_DISCORDS,
	HELP_DESC_HELP,
	HELP_DESC_INFO,
	HELP_DESC_MODPING,
	HELP_DESC_MODTOOLS,
	HELP_DESC_POLL,
	HELP_DESC_PROFILE,
	HELP_DESC_RULES,
	HELP_DESC_TRANSLATE,
	HELP_DESC_WEBSITE,

	BEAN_CANT_BEAN_SELF,

	WEBSITE_PROVIDE_VALID_ARGUMENT,
	WEBSITE_NO_SITE_REGISTERED,

	TEXTURE_DOESNT_EXIST,
	TEXTURE_FAILED_LOADING,

	TEXTURE_WIN_COUNCIL,
	TEXTURE_DEFEAT_COUNCIL,
	TEXTURE_WIN_REVOTE,
	TEXTURE_DEFEAT_REVOTE,

	SUBMIT_NO_FILE_ATTACHED
}