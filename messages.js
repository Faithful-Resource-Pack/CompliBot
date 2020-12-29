// General command stuff
const BOT_ERROR = 'Action Failed';
const BOT_AUTOREACT_ERROR = 'Auto Reaction Failed';

const COMMAND_NO_PERMISSION = 'You don\'t have the permission to do that!';
const COMMAND_PROVIDE_VALID_TAG = 'Please provide a user tag!';
const COMMAND_PROVIDE_A_NUMBER = 'Please provide a number!';
const COMMAND_DISABLED = 'This command is currently disabled';
const COMMAND_MAINTENANCE = 'I\'m currently in maintenance, please try again later.';
const COMMAND_ERROR = 'There was an error trying to execute that command!';

// Website command
const WEBSITE_PROVIDE_VALID_ARGUMENT = 'Please specify a valid argument! \nYou can use: \n`32x`, `64x`, `addons`, `tweaks`, `dungeons` and `mods`';
const WEBSITE_NO_SITE_REGISTERED = 'I don\'t have any website registered for this server :(';

// Texture command
const TEXTURE_DOESNT_EXIST = 'The specified texture/folder doesn\'t exist!';
const TEXTURE_FAILED_LOADING = 'This texture has not yet been made or is not present on GitHub!';

// Submission commands 
const TEXTURE_WIN_COUNCIL = 'The following texture has passed council voting and will be added into the pack in a future version.';
const TEXTURE_DEFEAT_COUNCIL = 'The following texture has not passed council voting and thus is up for revote.';
const TEXTURE_WIN_REVOTE = 'This texture has passed community voting and thus will be added into the pack in a future version.';
const TEXTURE_DEFEAT_REVOTE = 'This texture has not passed council and community voting and thus will not be added into the pack.';

// Auto React command:
const SUBMIT_NO_FILE_ATTACHED = 'Your submission has to have a file attached!';

module.exports = {
  BOT_ERROR,
	BOT_AUTOREACT_ERROR,

	COMMAND_NO_PERMISSION,
	COMMAND_PROVIDE_VALID_TAG,
	COMMAND_PROVIDE_A_NUMBER,
	COMMAND_DISABLED,
  COMMAND_MAINTENANCE,
  COMMAND_ERROR,

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