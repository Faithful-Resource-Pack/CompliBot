const LATEST_MC_JE_VERSION = '1.17'
const LATEST_MC_BE_VERSION = '1.16.210'


// General stuff
const BOT_ERROR = 'Action Failed'

// command stuff
const COMMAND_DISABLED                   = 'This command is currently disabled.'
const COMMAND_ERROR                      = 'One of my developers made an error while coding this command! Don\'t worry, the error is not on your side. Please contact @Juknum, @Robert, @Domi or @TheRolf'
const COMMAND_MAINTENANCE                = 'I\'m currently in maintenance, please try again later.'
const COMMAND_NO_ARGUMENTS_GIVEN         = 'You did not provide any arguments.'
const COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN = 'You did not provide enough arguments.'
const COMMAND_NO_PERMISSION              = 'You don\'t have the permission to do that.'
const COMMAND_PROVIDE_VALID_TAG          = 'Please provide a user tag.'
const COMMAND_PROVIDE_A_NUMBER           = 'Please provide a number.'
const COMMAND_WRONG_ARGUMENTS_GIVEN      = 'You did not provide valid arguments.'
const CANT_EXECUTE_IN_DMS                = 'I can\'t execute this command inside DM\'s!'
const COMMAND_NOIDONTTHINKIWILL_LMAO     = 'https://tenor.com/view/no-i-dont-think-i-will-captain-america-old-capt-gif-17162888'
const COMMAND_NOT_A_NUMBER               = 'The amount parameter isn\'t a number.'
const COMMAND_USER_DOESNT_EXIST          = 'This user doesn\'t exist.'
const COMMAND_NO_IMAGE_FOUND             = 'No image found in 10 previous messages.'
const COMMAND_MESSAGE_IMAGE_NOT_ATTACHED = 'This message does not have any image attached.'
const COMMAND_ID_IMAGE_NOT_ATTACHED      = 'This ID does not have any image attached.'
const COMMAND_INVALID_EXTENSION          = 'Image extension is not supported'
const COMMAND_URL_ONLY_SAME_CHANNEL      = 'The message URL needs to be from the same channel. Don\'t ask why, I don\'t know myself.'

// Help descriptions
const HELP_DESC_HOTFIX   = 'Fix something, may change at anytime'
const HELP_DESC_PING     = 'Pong!'
const HELP_DESC_RELOAD   = 'Reloads a command'
const HELP_DESC_RESTART  = 'Pulls modifications and restart the bot'
const HELP_DESC_SHUTDOWN = 'Stops the bot'
const HELP_DESC_STATUS   = 'Changes the bot\'s status: \n**Activity**:\nPLAYING, STREAMING, LISTENING, WATCHING, COMPETING, CUSTOM_STATUS (does not work)\n**Presence**:\nonline, idle, dnd'

const HELP_DESC_BEAN   = 'get B E A N E D'
const HELP_DESC_BEHAVE = '(⌯˃̶᷄ ﹏ ˂̶᷄⌯)'
const HELP_DESC_ORDER  = 'Order something'
const HELP_DESC_SAY    = 'Make the bot send any message you specify'

const HELP_DESC_BAN      = 'Ban a user from the current Discord server'
const HELP_DESC_CLEAR    = 'Clear messages in a channel'
const HELP_DESC_EMBED    = 'Modify an embed'
const HELP_DESC_MUTE     = 'Mute someone'
const HELP_DESC_SLOWMODE = 'Enable or disable the slowmode in a channel'
const HELP_DESC_UNMUTE   = 'Unmute someone'
const HELP_DESC_WARN     = 'Warn someone'

const HELP_DESC_GUIDELINES = 'Shows the texturing guidelines of Compliance 32x.'

const HELP_DESC_ABOUT        = 'Displays a texture that you or someone else made'
const HELP_DESC_ANIMATE      = 'Animates a texture.'
const HELP_DESC_AUTOPUSH     = 'Use this command to push textures from #results to GitHub.'
const HELP_DESC_CONTRIBUTORS = 'Use this command to manage contributors.'
const HELP_DESC_INSTAPASS    = 'Use this command to by-pass council process.'
const HELP_DESC_MAGNIFY      = 'Resize an image,\nImage URL needs to end with ``.png``, ``.jpeg/jpg`` or ``.gif``,\nMessage ID needs to be from the same channel.\nMagnify only the first frame of a GIF'
const HELP_DESC_PALETTE      = 'Get the colours of an image,\nImage URL needs to end with ``.png``, ``.jpeg/jpg`` or ``.gif``,\nMessage ID needs to be from the same channel.\nGIF: Return the palette of the first frame only'
const HELP_DESC_PUSH         = 'Push file to GitHub & update the contributor list.'
const HELP_DESC_TEXTURE      = 'Displays a specified texture from either vanilla Minecraft or Compliance.\nYou can search for a texture name, or use ``_`` at the beginning to search for non-complete names (such as _sword).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.'
const HELP_DESC_TILE         = 'Tile an image, if no arguments are given, a grid shape is selected by default. The bot searches the last 10 messages for an image.\nGIF: only works with the first frame.'

const HELP_DESC_DISCORDS  = 'Posts a list of specified discord servers.'
const HELP_DESC_FEEDBACK  = 'Suggest things or report bugs directly to the bot devs.'
const HELP_DESC_HELP      = 'Show help for a specified command.'
const HELP_DESC_INFO      = 'Displays some info about the bot in your DMs.'
const HELP_DESC_MODPING   = 'Tag online mods to call for help.'
const HELP_DESC_MODTOOLS  = 'Displays tools for Minecraft Dungeons modding.'
const HELP_DESC_POLL      = 'Make a poll to ask people!'
const HELP_DESC_PROFILE   = 'Add personal information for the Compliance Website Gallery.'
const HELP_DESC_SKIN      = 'Get the skin of a Minecraft Player.'
const HELP_DESC_STATS     = 'Displays various stats of the bot in your DMs.'
const HELP_DESC_RULES     = 'Creates rules embed.'
const HELP_DESC_TRANSLATE = 'Translates messages (duh)'
const HELP_DESC_WEBSITE   = 'Displays the website of the discord.'

const HELP_DESC_COMPARE   = 'Allows vanilla / pack comparaison side by side'

// Command uses
const COMMAND_USES_ANYONE          = 'Anyone'
const COMMAND_USES_ANYONE_DUNGEONS = 'Anyone on Compliance Dungeons Discord'
const COMMAND_USES_DEVS            = 'Bot Developers'
const COMMAND_USES_MODS            = 'Moderators'
const COMMAND_USES_DISABLED        = 'no one (disabled)'

// Bean command
const BEAN_CANT_BEAN_SELF = 'You can\'t bean yourself!'
const BEAN_SPECIFY_USER   = 'You need to specify a user to bean!'

// Behave command
const BEHAVE_ANSWER = 'I\'m so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)'

// Say command
const SAY_NOT_SPECIFIED = 'You haven\'t specified a message to send.'

// Ban command
const BAN_CANT_BAN_SELF     = 'You can\'t ban yourself!'
const BAN_SPECIFY_USER      = 'You need to specify a user to ban!'
const BAN_BOT_NO_PERMISSION = 'I don\'t have enough permissions to ban users! Please enable the ban permission for my role.'
const BAN_NOT_BANNABLE      = 'This user is not able to be banned!'

// Clear command
const CLEAR_TOO_MUCH   = 'You can\'t delete more than 200 messages at once.'
const CLEAR_NOT_ENOUGH = 'You have to delete at least 1 message.'

// Mute command
const MUTE_NOT_VALID_TIME  = 'You did\'t specify a valid time.'
const MUTE_SPECIFY_USER    = 'You need to specify a user to mute.'
const MUTE_CANT_MUTE_SELF  = 'You can\'t mute yourself!'
const MUTE_SPECIFY_INTEGER = 'You have to specify an integer.'

// Slowmode command
const SLOWMODE_TOO_BIG = 'The number can\'t be bigger than 21600.'

// Unmute command
const UNMUTE_SPECIFY_USER = 'You need to specify a user to unmute.'

// Warn command
const WARN_SPECIFY_USER   = 'You need to specify a user to warn.'
const WARN_CANT_WARN_SELF = 'You can\'t warn yourself!'

// contributors command
const CONTRIBUTORS_NOT_ENOUGH_ARGS     = 'The `/contributors` command requires 5 arguments to be specified.'
const CONTRIBUTORS_ARG1_INVALID        = 'Invalid first argument. Available options: `update`, `add`, `remove`'
// idk where the 2nd argument is       = 'just putting this here for consistency lol' // double comment be like
const CONTRIBUTORS_ARG3_INVALID        = 'Invalid third argument. Available options: `java`, `bedrock`'
const CONTRIBUTORs_ARG4_INVALID        = 'Invalid fourth argument. Available options: `c32`, `c64`'
const CONTRIBUTORS_ARG5_INVALID        = 'The author name must be a Discord Tag, ex.: `Name#1234`'
const CONTRIBUTORS_UNKNOWN_TEXTURE     = 'Unknown texture, please check your spelling.'
const CONTRIBUTORS_TEXTURE_NO_AUTHOR   = 'This texture doesn\'t have an author.'
const CONTRIBUTORS_AUTHOR_DOESNT_EXIST = 'This author doesn\'t exist.'

// Magnify command
const MAGNIFY_FACTOR_TOO_SMALL = 'The factor must be greater than 1.'
const MAGNIFY_NO_ARGS_GIVEN    = 'You did not provide any arguments.'

// Push command
const PUSH_ARG1_INVALID      = 'No author given! '
const PUSH_ARG2_INVALID      = 'No texture path given! '
const PUSH_ARG3_INVALID      = 'No repository given! '
const PUSH_NOT_ATTACHED      = 'You did not attached the texture! '
const PUSH_INVALID_REPO      = 'This repository does not exist or is not supported'
const PUSH_USER_NOT_FOUND    = 'User not found in cache'
const PUSH_TEXTURE_NOT_FOUND = 'Can\'t find this textures!'

// Texture command
//const TEXTURE_DOESNT_EXIST       = '**Note: this command isn\'t updated for 21w19a yet, if you\'re currently looking for a 21w19a texture**\nThe specified texture/folder doesn\'t exist!'
const TEXTURE_DOESNT_EXIST       = 'The specified texture/folder doesn\'t exist!'
const TEXTURE_NOT_CHOSEN				 = 'Texture was not chosen fast enough'
const TEXTURE_FAILED_LOADING     = 'This texture has not yet been made or is not present on GitHub!'
const TEXTURE_SEARCH_DESCRIPTION = 'Choose one texture using emoji reactions.\nIf you don\'t see what you\'re looking for, be more specific.\n'

// Feedback command
const FEEDBACK_NO_ARGS_GIVEN = 'Please write some feedback and don\'t just leave it empty!'
const FEEDBACK_SUCCESS_DESCRPTION = 'Your feedback has been sent to the developers!'

// Website command
const WEBSITE_PROVIDE_VALID_ARGUMENT = 'Invalid argument. Available options: `32x`, `64x`, `addons`, `tweaks`, `dungeons`, `mods`'
const WEBSITE_NO_SITE_REGISTERED     = 'I don\'t have any website registered for this server :('

// Submissions
const TEXTURE_WIN_COUNCIL    = 'The following texture has passed council voting and will be added into the pack in a future version.'
const TEXTURE_DEFEAT_COUNCIL = 'The following texture has not passed council voting and thus is up for revote.'
const TEXTURE_WIN_REVOTE     = 'This texture has passed community voting and thus will be added into the pack in a future version.'
const TEXTURE_DEFEAT_REVOTE  = 'This texture has not passed council and community voting and thus will not be added into the pack.'

// Auto reactions:
const SUBMIT_NO_FILE_ATTACHED             = 'Your submission has to have a file attached!'
const SUBMIT_NO_FOLDER_SPECIFIED          = 'You need to add the texture folder of your texture between []:\n`texture_name [folder] (optional comment)`'
const SUBMIT_NO_FOLDER_SPECIFIED_DUNGEONS = 'You need to add the texture path to your submission:\n`**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`'
const SUBMIT_AUTOREACT_ERROR_TITLE        = 'Auto Reaction Failed'
const SUBMIT_AUTOREACT_ERROR_FOOTER       = 'Submission will be removed in 30 seconds, please re-submit'

// AutoPush errors
const AUTOPUSH_ERROR_TYPE     = 'No texture type set up (java or bedrock)'
const AUTOPUSH_ERROR_SPELLING = 'Texture not found, check spelling or folder'

module.exports = {
	LATEST_MC_JE_VERSION,
	LATEST_MC_BE_VERSION,
	
	BOT_ERROR,

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
	COMMAND_NOIDONTTHINKIWILL_LMAO,
	COMMAND_NOT_A_NUMBER,
	COMMAND_USER_DOESNT_EXIST,
	COMMAND_NO_IMAGE_FOUND,
	COMMAND_MESSAGE_IMAGE_NOT_ATTACHED,
	COMMAND_ID_IMAGE_NOT_ATTACHED,
	COMMAND_INVALID_EXTENSION,
	COMMAND_URL_ONLY_SAME_CHANNEL,

	HELP_DESC_HOTFIX,
	HELP_DESC_PING,
	HELP_DESC_RELOAD,
	HELP_DESC_RESTART,
	HELP_DESC_SHUTDOWN,
	HELP_DESC_STATUS,
	HELP_DESC_FEEDBACK,
	HELP_DESC_BEAN,
	HELP_DESC_BEHAVE,
	HELP_DESC_ORDER,
	HELP_DESC_SAY,

	HELP_DESC_BAN,
	HELP_DESC_CLEAR,
	HELP_DESC_EMBED,
	HELP_DESC_MUTE,
	HELP_DESC_SLOWMODE,
	HELP_DESC_UNMUTE,
	HELP_DESC_WARN,

	HELP_DESC_GUIDELINES,

	HELP_DESC_ABOUT,
	HELP_DESC_ANIMATE,
	HELP_DESC_AUTOPUSH,
	HELP_DESC_CONTRIBUTORS,
	HELP_DESC_INSTAPASS,
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
	HELP_DESC_SKIN,
	HELP_DESC_STATS,
	HELP_DESC_RULES,
	HELP_DESC_TRANSLATE,
	HELP_DESC_WEBSITE,

	HELP_DESC_COMPARE,

	COMMAND_USES_ANYONE,
	COMMAND_USES_ANYONE_DUNGEONS,
	COMMAND_USES_DEVS,
	COMMAND_USES_MODS,
	COMMAND_USES_DISABLED,

	BEAN_CANT_BEAN_SELF,
	BEAN_SPECIFY_USER,

	BEHAVE_ANSWER,

	SAY_NOT_SPECIFIED,

	BAN_CANT_BAN_SELF,
	BAN_SPECIFY_USER,
	BAN_BOT_NO_PERMISSION,
	BAN_NOT_BANNABLE,

	CLEAR_TOO_MUCH,
	CLEAR_NOT_ENOUGH,

	MUTE_NOT_VALID_TIME,
	MUTE_SPECIFY_USER,
	MUTE_CANT_MUTE_SELF,
	MUTE_SPECIFY_INTEGER,

	SLOWMODE_TOO_BIG,

	UNMUTE_SPECIFY_USER,

	WARN_SPECIFY_USER,
	WARN_CANT_WARN_SELF,

	CONTRIBUTORS_NOT_ENOUGH_ARGS,
	CONTRIBUTORS_ARG1_INVALID,
	CONTRIBUTORS_ARG3_INVALID,
	CONTRIBUTORs_ARG4_INVALID,
	CONTRIBUTORS_ARG5_INVALID,
	CONTRIBUTORS_UNKNOWN_TEXTURE,
	CONTRIBUTORS_TEXTURE_NO_AUTHOR,
	CONTRIBUTORS_AUTHOR_DOESNT_EXIST,

	MAGNIFY_FACTOR_TOO_SMALL,
	MAGNIFY_NO_ARGS_GIVEN,

	PUSH_ARG1_INVALID,
	PUSH_ARG2_INVALID,
	PUSH_ARG3_INVALID,
	PUSH_NOT_ATTACHED,
	PUSH_INVALID_REPO,
	PUSH_USER_NOT_FOUND,
	PUSH_TEXTURE_NOT_FOUND,

	TEXTURE_DOESNT_EXIST,
	TEXTURE_NOT_CHOSEN,
	TEXTURE_FAILED_LOADING,
	TEXTURE_SEARCH_DESCRIPTION,

	FEEDBACK_NO_ARGS_GIVEN,
	FEEDBACK_SUCCESS_DESCRPTION,

	WEBSITE_PROVIDE_VALID_ARGUMENT,
	WEBSITE_NO_SITE_REGISTERED,

	TEXTURE_WIN_COUNCIL,
	TEXTURE_DEFEAT_COUNCIL,
	TEXTURE_WIN_REVOTE,
	TEXTURE_DEFEAT_REVOTE,

	SUBMIT_NO_FILE_ATTACHED,
	SUBMIT_NO_FOLDER_SPECIFIED,
	SUBMIT_NO_FOLDER_SPECIFIED_DUNGEONS,
	SUBMIT_AUTOREACT_ERROR_TITLE,
	SUBMIT_AUTOREACT_ERROR_FOOTER,

	AUTOPUSH_ERROR_TYPE,
	AUTOPUSH_ERROR_SPELLING
}