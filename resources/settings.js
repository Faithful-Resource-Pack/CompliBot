// Bot assets
const BOT_IMG           = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/CompliBot.png'
const VANILLA_IMG       = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/texture_16x.png'
const QUOTE_IMG         = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/quote.png'
const QUESTION_MARK_IMG = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/question_mark.png'
const WARNING_IMG       = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/warning.png'
const ERROR_IMG         = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/error.png'
const LOADING_IMG       = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/loading.gif'

const REPO_JAVA_NAMES    = [ 'Compliance-Java-32x', 'Compliance-Java-64x' ]
const REPO_BEDROCK_NAMES = ['Compliance-Bedrock-32x', 'Compliance-Bedrock-64x' ]
const REPO_NAMES = [...REPO_JAVA_NAMES, ...REPO_BEDROCK_NAMES]

const REPO_JAVA_BRANCHES    = [ '1.18', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2' ]
const REPO_BEDROCK_BRANCHES = [ '1.17.0', '1.16.220' ]

// Default texture repo for java
const DEFAULT_MC_JAVA_REPOSITORY    = 'https://raw.githubusercontent.com/CompliBot/Default-Java/'
const DEFAULT_MC_BEDROCK_REPOSITORY = 'https://raw.githubusercontent.com/CompliBot/Default-Bedrock/'

const COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-'
const COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-'

const COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-'
const COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-'

const LATEST_MC_JE_VERSION = '1.18'
const LATEST_MC_BE_VERSION = '1.17.0'

// Compliance 32x
const C32_IMG           = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%2032x.png'
const C32_ID            = '773983706582482946'
const C32_LOGS          = '829047608781176853' // #auto-report channel
const C32_MOD_LOGS      = '776145239358046248' // #warn-and-mute channel
const C32_COUNCIL_ID    = '775636065338785813' // Council role

const C32_SUBMIT_TEXTURES = '773987409993793546' // #submit-textures
const C32_SUBMIT_COUNCIL  = '774220983044669450' // #council-voting
const C32_SUBMIT_REVOTE   = '780507681987100682' // #texture-revote
const C32_RESULTS         = '780507804317384744' // #texture-results
const C32_COMPLICHANNEL   = '794137845408595978'
const C32_COUNTER         = '774333964101615637'

// Compliance 64x
const C64_IMG           = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%2064x.png'
const C64_ID            = '747574286356840609'
const C64_LOGS          = '778189351703412767' // #logs channel
const C64_COUNCIL_ID    = '777642015885754368' // Council role

const C64_SUBMIT_TEXTURES = '747603911677837454' // #submit-textures
const C64_SUBMIT_COUNCIL  = '797780897805238282' // #council-voting
const C64_SUBMIT_REVOTE   = '797649484259524648' // #texture-revote
const C64_RESULTS         = '797648495804678154' // #texture-results
const C64_COMPLICHANNEL   = '798208196405362708'

const DEV_SUBMIT_COUNCIL = '849267113594978374' // #council-vote

// Compliance Extras
const CADDONS_IMG   = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%20Addons.png'
const CEXTRAS_IMG   = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Branding/main/no%20background/512/Compliance%20Extras.png'
const CEXTRAS_ID    = '614160586032414845'
const CEXTRAS_ROLES = '860457051700199424'

// Compliance Tweaks
const CTWEAKS_IMG          = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%20Tweaks.png'
const CTWEAKS_ID           = '720966967325884426' // deprecated
const CTWEAKS_COUNTER      = '750638888296382504' // Member counter channel // deprecated

// Compliance Mods
const CMODS_IMG          = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%20Mods.png'
const CMODS_ID           = '748264625962877019'

// Compliance Dungeons
const CDUNGEONS_IMG          = 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/Logos/Compliance%20Dungeons.png'
const CDUNGEONS_ID           = '714910830272970834' // deprecated
const CDUNGEONS_SUBMIT       = '715236892945285181'	// deprecated

const CDEVS_ID = '720677267424018526'

const COMPLIANCE_SERVERS_IDS = [
	C32_ID, C64_ID, CEXTRAS_ID, CDEVS_ID
]

module.exports = {
	BOT_IMG,
	VANILLA_IMG,
	QUOTE_IMG,
	QUESTION_MARK_IMG,
	WARNING_IMG,
	ERROR_IMG,
	LOADING_IMG,

	REPO_JAVA_NAMES,
	REPO_BEDROCK_NAMES,
	REPO_NAMES,
	REPO_JAVA_BRANCHES,
	REPO_BEDROCK_BRANCHES,

	DEFAULT_MC_JAVA_REPOSITORY,
	DEFAULT_MC_BEDROCK_REPOSITORY,

	COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA,
	COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA,

	COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA,
	COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA,

	LATEST_MC_JE_VERSION,
	LATEST_MC_BE_VERSION,

	C32_IMG,
	C32_ID,
	C32_LOGS,
	C32_MOD_LOGS,
	C32_COUNCIL_ID,

	C32_SUBMIT_TEXTURES,
	C32_SUBMIT_COUNCIL,
	C32_SUBMIT_REVOTE,
	C32_RESULTS,
	C32_COMPLICHANNEL,
	C32_COUNTER,

	C64_IMG,
	C64_ID,
	C64_LOGS,
	C64_COUNCIL_ID,

	C64_SUBMIT_TEXTURES,
	C64_SUBMIT_COUNCIL,
	C64_SUBMIT_REVOTE,
	C64_RESULTS,
	C64_COMPLICHANNEL,

	DEV_SUBMIT_COUNCIL,

	CADDONS_IMG,
	CEXTRAS_IMG,
	CEXTRAS_ID,
	CEXTRAS_ROLES,

	CTWEAKS_IMG,
	CTWEAKS_ID,
	CTWEAKS_COUNTER,

	CMODS_IMG,
	CMODS_ID,

	CDUNGEONS_IMG,
	CDUNGEONS_ID,
	CDUNGEONS_SUBMIT,

	CDEVS_ID,
	COMPLIANCE_SERVERS_IDS
}
