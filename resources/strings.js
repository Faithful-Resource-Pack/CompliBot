module.exports = {

// General stuff
BOT_ERROR: 'Action Failed',

// command stuff
COMMAND_DISABLED: 'This command is currently disabled.',
COMMAND_DISABLED_FOR_TEST: 'This command is currently disabled for testing!',
COMMAND_ERROR: 'One of my developers made an error while coding this command! Don\'t worry, the error is not on your side. Please contact <@207471947662098432>, <@473860522710794250> or <@173336582265241601>',
COMMAND_MAINTENANCE: 'I\'m currently in maintenance, please try again later.',
COMMAND_NO_ARGUMENTS_GIVEN: 'You did not provide any arguments.',
COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN: 'You did not provide enough arguments.',
COMMAND_NO_PERMISSION: 'You don\'t have the permission to do that.',
COMMAND_PROVIDE_VALID_TAG: 'Please provide a user tag.',
COMMAND_PROVIDE_A_NUMBER: 'Please provide a number.',
COMMAND_WRONG_ARGUMENTS_GIVEN: 'You did not provide valid arguments.',
CANT_EXECUTE_IN_DMS: 'I can\'t execute this command inside DM\'s!',
COMMAND_NOIDONTTHINKIWILL_LMAO: 'https://tenor.com/view/no-i-dont-think-i-will-captain-america-old-capt-gif-17162888',
COMMAND_NOT_A_NUMBER: 'The amount parameter isn\'t a number.',
COMMAND_USER_DOESNT_EXIST: 'This user doesn\'t exist.',
COMMAND_NO_IMAGE_FOUND: 'No image found in 10 previous messages.',
COMMAND_MESSAGE_IMAGE_NOT_ATTACHED: 'This message does not have any image attached.',
COMMAND_ID_IMAGE_NOT_ATTACHED: 'This ID does not have any image attached.',
COMMAND_INVALID_EXTENSION: 'Image extension is not supported',
COMMAND_URL_ONLY_SAME_CHANNEL: 'The message URL needs to be from the same channel. Don\'t ask why, I don\'t know myself.',
COMMAND_SEARCHING_FOR_TEXTURE: 'Searching for your texture, please wait...',
COMMAND_TOO_MUCH_ARGS_GIVEN: 'Too much arguments were given!',

// Help descriptions for commands
HELP_DESC_AUTOPUSH: 'Use this command to push textures from #results to GitHub.',
HELP_DESC_BAN: 'Ban a user from the current Discord server',
HELP_DESC_CLEAR: 'Clear messages in a channel',
HELP_DESC_EMBED: 'Modify an embed',
HELP_DESC_PUSH: 'Push file to GitHub & update the contributor list.',

HELP_DESC_BEHAVE: '(⌯˃̶᷄ ﹏ ˂̶᷄⌯)',
HELP_DESC_HOTFIX: 'Fix something, may change at anytime',
HELP_DESC_INFOEMBED: 'Posts specific embeds for the info channel categories on the Compliance servers.',
HELP_DESC_PING: 'Pong!',
HELP_DESC_RELOAD: 'Reloads a command',
HELP_DESC_RESTART: 'Pulls modifications and restart the bot',
HELP_DESC_SAY: 'Make the bot send any message you specify',
HELP_DESC_SHUTDOWN: 'Stops the bot',
HELP_DESC_STATUS: 'Changes the bot\'s status: \n**Activity**:\nPLAYING, STREAMING, LISTENING, WATCHING, COMPETING, CUSTOM_STATUS (does not work)\n**Presence**:\nonline, idle, dnd',

HELP_DESC_BEAN: 'get B E A N E D',
HELP_DESC_MUTE: 'Mute someone',
HELP_DESC_RULES: 'Creates rules embed.',
HELP_DESC_SLOWMODE: 'Enable or disable the slowmode in a channel',
HELP_DESC_UNMUTE: 'Unmute someone',
HELP_DESC_WARN: 'Warn someone',

HELP_DESC_ABOUT: 'Displays a texture that you or someone else made',
HELP_DESC_ANIMATE: 'Animates a texture.',
HELP_DESC_COLOR: 'Use this command to show information about a color.',
HELP_DESC_COMPARE: 'Allows vanilla / pack comparaison side by side',
HELP_DESC_FEEDBACK: 'Suggest things or report bugs directly to the bot devs.',
HELP_DESC_GUIDELINES: 'Shows the texturing guidelines of Compliance 32x.',
HELP_DESC_HELP: 'Show help for a specified command.',
HELP_DESC_INFO: 'Displays some info about the bot in your DMs.',
HELP_DESC_MAGNIFY: 'Resize an image,\nImage URL needs to end with ``.png``, ``.jpeg/jpg`` or ``.gif``,\nMessage ID needs to be from the same channel.\nMagnify only the first frame of a GIF',
HELP_DESC_MISSING: 'Shows tree view of missing textures for a particular edition',
HELP_DESC_MODPING: 'Tag online mods to call for help.',
HELP_DESC_MODTOOLS: 'Displays tools for Minecraft Dungeons modding.',
HELP_DESC_ORDER: 'Order something',
HELP_DESC_PALETTE: 'Get the colours of an image,\nImage URL needs to end with ``.png``, ``.jpeg/jpg`` or ``.gif``,\nMessage ID needs to be from the same channel.\nGIF: Return the palette of the first frame only',
HELP_DESC_POLL: 'Make a poll to ask people!',
HELP_DESC_PROFILE: 'Add personal information for the Compliance Website Gallery.',
HELP_DESC_SKIN: 'Get the skin of a Minecraft Player.',
HELP_DESC_STATS: 'Displays various stats of the bot.',
HELP_DESC_TEXTURE: 'Displays a specified texture from either vanilla Minecraft or Compliance.\nYou can search for a texture name, or use ``_`` at the beginning to search for non-complete names (such as _sword).\nYou can also use ``/`` at the begining to specify a folder instead of a texture name.',
HELP_DESC_TILE: 'Tile an image, if no arguments are given, a grid shape is selected by default. The bot searches the last 10 messages for an image.\nGIF: only works with the first frame.',
HELP_DESC_TRANSLATE: 'Translates messages to the selected language.',
HELP_DESC_WEBSITE: 'Displays website for the given keyword, see examples for keywords.',
HELP_DESC_MCWIKI: 'Searches official Minecraft wiki',

// animate function
INPUT_TOO_BIG: 'The input picture is too big!',
INPUT_TOO_WIDE: 'The input picture is too wide!',
CANT_ANIMATE: 'This texture can\'t be animated.',

// command uses
COMMAND_USES_ANYONE: 'Anyone',
COMMAND_USES_ANYONE_DUNGEONS: 'Anyone on Compliance Dungeons Discord',
COMMAND_USES_DEVS: 'Bot Developers',
COMMAND_USES_ADMINS: 'Administrators',
COMMAND_USES_MODS: 'Moderators',
COMMAND_USES_DISABLED: 'Nobody (disabled)',

// bean command
BEAN_CANT_BEAN_SELF: 'You can\'t bean yourself!',
BEAN_SPECIFY_USER: 'You need to specify a user to bean!',

// behave command
BEHAVE_ANSWER: 'I\'m so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)',

// say command
SAY_NOT_SPECIFIED: 'You haven\'t specified a message to send.',

// ban command
BAN_CANT_BAN_SELF: 'You can\'t ban yourself!',
BAN_SPECIFY_USER: 'You need to specify a user to ban!',
BAN_BOT_NO_PERMISSION: 'I don\'t have enough permissions to ban users! Please enable the ban permission for my role.',
BAN_NOT_BANNABLE: 'This user is not able to be banned!',

// clear command
CLEAR_TOO_MUCH: 'You can\'t delete more than 100 messages at once.',
CLEAR_NOT_ENOUGH: 'You have to delete at least 1 message.',

// mute command
MUTE_NOT_VALID_TIME: 'You did\'t specify a valid time.',
MUTE_SPECIFY_USER: 'You need to specify a user to mute.',
MUTE_CANT_MUTE_SELF: 'You can\'t mute yourself!',
MUTE_SPECIFY_INTEGER: 'You have to specify an integer.',

// slowmode command
SLOWMODE_TOO_BIG: 'The number can\'t be bigger than 21600.',

// unmute command
UNMUTE_SPECIFY_USER: 'You need to specify a user to unmute.',

// warn command
WARN_SPECIFY_USER: 'You need to specify a user to warn.',
WARN_CANT_WARN_SELF: 'You can\'t warn yourself!',

// contributors command
CONTRIBUTORS_NOT_ENOUGH_ARGS: 'The `/contributors` command requires 5 arguments to be specified.',
CONTRIBUTORS_UNKNOWN_TEXTURE: 'Unknown texture, please check your spelling.',
CONTRIBUTORS_TEXTURE_NO_AUTHOR: 'This texture doesn\'t have an author.',
CONTRIBUTORS_AUTHOR_DOESNT_EXIST: 'This author doesn\'t exist.',

// color command
COLOR_RGB_NO_VALUES: '**RGB**: You must specify **3** values.',
COLOR_RGB_WRONG_VALUES: '**RGB**: Values must be between **0 & 255**.',
COLOR_RGBA_NO_VALUES: '**RGBa**: You must specify **4** values.',
COLOR_RGBA_WRONG_VALUES: '**RGBa**: **R**, **G** & **B** values must be between **0 & 255**.',
COLOR_RGBA_ALPHA_VALUE: '**RGBa**: The alpha value must be a float between **0 & 1**.',
COLOR_HSL_NO_VALUES: '**HSL**: You must specify **3** values.',
COLOR_HSL_DEGREE_VALUE: '**HSL**: **Degree** value must be between **0 & 360**.',
COLOR_HSL_SL_VALUES: '**HSL**: **S** & **L** values must be between **0 & 100**.',
COLOR_HSV_NO_VALUES: '**HSV**: You must specify **3** values.',
COLOR_HSV_DEGREE_VALUE: '**HSV**: **Degree** value must be between **0 & 360**.',
COLOR_HSV_SV_VALUES: '**HSV**: **S** & **V** values must be between **0 & 100**.',
COLOR_CMYK_NO_VALUES: '**CMYK**: You must specify **4** values.',
COLOR_CMYK_WRONG_VALUES: '**CMYK**: Values must be between **0 & 100**.',
COLOR_HEX_WRONG_VALUE: '**HEX**: Invalid hexadecimal value, accepted characters are **0 to 9** & **A to F**.',
COLOR_HEX_WRONG_DIGITS: '**HEX**: You must specify **3 __or__ 6 __or__ 8** digits.',

// magnify command
MAGNIFY_FACTOR_TOO_SMALL: 'The factor must be greater than 1.',
MAGNIFY_NO_ARGS_GIVEN: 'You did not provide any arguments.',

MCWIKI_EMBED_LINK_TEXT: `Click here for Wiki page`,
MCWIKI_NO_RESULTS_FOUND: 'No Wiki page found.\n Could not find any matching result for the term ``%term%``',

// push command
PUSH_ARG1_INVALID: 'No author given! ',
PUSH_ARG2_INVALID: 'No texture path given! ',
PUSH_ARG3_INVALID: 'No repository given! ',
PUSH_NOT_ATTACHED: 'You didn\'t attach any image! ',
PUSH_INVALID_REPO: 'This repository does not exist or is not supported',
PUSH_INVALID_FORMAT: 'Please provide a .png file, `.zip`, `.rar` and `.7zip` files are not supported',
PUSH_USER_NOT_FOUND: 'User not found in cache',
PUSH_UNKNOWN_ID: 'It seems that this ID does not exist\n',
PUSH_TEXTURE_NOT_FOUND: 'Can\'t find this textures!',

// texture command
//TEXTURE_DOESNT_EXIST: '**Note: this command isn\'t updated for 21w19a yet, if you\'re currently looking for a 21w19a texture**\nThe specified texture/folder doesn\'t exist!',
TEXTURE_DOESNT_EXIST: 'The specified texture/folder doesn\'t exist!',
TEXTURE_TOO_SHORT: 'The texture name is too short!',
TEXTURE_NOT_CHOSEN: 'Texture was not chosen fast enough',
TEXTURE_FAILED_LOADING: 'This texture has not yet been made or is not present on GitHub!',
TEXTURE_SEARCH_DESCRIPTION: 'Choose one texture using emoji reactions.\nIf you don\'t see what you\'re looking for, be more specific.\n',

TRANSLATE_NO_MESSAGES: 'I didn\'t find any message to translate!',

// feedback command
FEEDBACK_NO_ARGS_GIVEN: 'Please write some feedback and don\'t just leave it empty!',
FEEDBACK_SUCCESS_DESCRPTION: 'Your feedback has been sent to the developers!',

// website command
WEBSITE_PROVIDE_VALID_ARGUMENT: 'Invalid argument. Available options: `32x`, `64x`, `addons`, `tweaks`, `dungeons`, `mods`',
WEBSITE_NO_SITE_REGISTERED: 'I don\'t have any website registered for this server :(',

// submissions
TEXTURE_WIN_COUNCIL: 'The following texture has passed council voting and will be added into the pack in a future version.',
TEXTURE_DEFEAT_COUNCIL: 'The following texture has not passed council voting and thus is up for revote.',
TEXTURE_WIN_REVOTE: 'This texture has passed community voting and thus will be added into the pack in a future version.',
TEXTURE_DEFEAT_REVOTE: 'This texture has not passed council and community voting and thus will not be added into the pack.',

// auto reactions:
SUBMIT_NO_FILE_ATTACHED: 'Your submission has to have a file attached!',
SUBMIT_NO_FOLDER_SPECIFIED: 'You need to add the texture folder of your texture between []:\n`texture_name [folder] (optional comment)`',
SUBMIT_NO_FOLDER_SPECIFIED_DUNGEONS: 'You need to add the texture path to your submission:\n`**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`',
SUBMIT_AUTOREACT_ERROR_TITLE: 'Auto Reaction Failed',
SUBMIT_AUTOREACT_ERROR_FOOTER: 'Submission will be removed in 30 seconds, please re-submit',

// parseArgs
PARSE_ARGS: 'You need to add a [-f= | --flag=] at the begining of an argument!',

}