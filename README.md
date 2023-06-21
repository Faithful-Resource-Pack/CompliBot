<img src="https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/logos/transparent/256/complibot_legacy_logo.png" alt="CompliBot" align="right" height="256px">
<div align="center">
  <h1>CompliBot Legacy</h1>
  <h3>Legacy features for the Faithful Discord servers.</h3>

![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/Discord-Bot)
![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/Discord-Bot)
![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/Discord-Bot)
</div>

---

## Online on:
- [Faithful](https://discord.gg/sN9YRQbBv7)
- [Classic Faithful](https://discord.gg/KSEhCVtg4J)

---

## Requirements
- NodeJS 18+ https://nodejs.org
- pnpm (`corepack enable` + `corepack prepare pnpm@latest --activate`)

## Running

```bash
pnpm install
```
```bash
pnpm dev
```

___
### Bot config:

**DISCLAIMER: We won't help you rebrand the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

- Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
- Go to the **Bot** tab, create a bot and copy its token.
- Create a file named **.env** or rename the **.env.example** file to **.env**.
- Open the **.env** file using any text editor.
- This file contains general bot settings in this format:

|       Field name        |               Example value                |                                Description                                |
|:-----------------------:|:------------------------------------------:|:-------------------------------------------------------------------------:|
|      CLIENT_TOKEN       |                    "-"                     |  The token you copied from the Developer Portal, used to login the bot.   |
|         PREFIX          |                    "/"                     |              This is the character used to execute commands.              |
|      DEVELOPERS         |           "[123456789, 987654321]"         |          An array of user ids used for developer-only commands.           |
|       MAINTENANCE       |                  "false"                   |    Makes all commands maintainer-only, sets status to do not disturb.     |
|          DEBUG          |                  "false"                   |                       Shows advanced console logs.                        |
|           DEV           |                  "false"                   | Disables certain features that are only necessary for the production bot. |
|         LOG_DEV         |                  "false"                   |                Logs bot errors into the dev-logs channel.                 |
| COMPLIBOT_GIT_USERNAME  |                "CompliBot"                 |                  Git username for the CompliBot account.                  |
|   COMPLIBOT_GIT_EMAIL   |    "CompliBot@users.noreply.github.com"    |                   Git email for the CompliBot account.                    |
| COMPLIBOT_GIT_JSON_REPO |     "/Faithful-Resource-Pack/JSON/"        |                Github repository to push/pull json files.                 |
|   COMPLIBOT_GIT_TOKEN   | "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0" |                Git token for the CompliBot GitHub account.                |

### Other configs:

- `resources/strings.js` for embed or message texts
- `resources/settings.js` for roles, channel ids, and colors