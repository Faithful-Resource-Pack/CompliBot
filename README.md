<img src="https://i.imgur.com/Hf0eeiU.png" alt="CompliBot" align="right" height="256px">
<div align="center">
  <h1>CompliBot</h1>
  <h3>The official bot of all Compliance Resource Pack discords</h3>

![RepoSize](https://img.shields.io/github/repo-size/Compliance-Resource-Pack/Discord-Bot)
![Issues](https://img.shields.io/github/issues/Compliance-Resource-Pack/Discord-Bot)
![PullRequests](https://img.shields.io/github/issues-pr/Compliance-Resource-Pack/Discord-Bot)
</div>

___
### Online on:
- [Compliance 32x](https://discord.gg/sN9YRQbBv7)
- [Compliance 64x](https://discord.gg/Tqtwtgh)
- [Compliance Extras](https://discord.gg/qVeDfZw)

___
### Installation and launching:
- Install **[Node.js](https://nodejs.org/)** on your machine. **Version 16.6 or higher is required!**
- Clone the repository on your machine.
- Open your console in the cloned repository.
- To complete the installation, write the following command in the console:
```console
npm install
```
- After installation, you will need to **[configure the bot](#bot-config)**.
- To start the bot, write the following command in the console:
```console
node .
```

___
### Bot config:

**DISCLAIMER: We won't help you rebranding the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

- Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
- Go to the **Bot** tab, create a bot and copy its token.
- Create a file named **.env** or rename the **.env.example** file to **.env**.
- Open the **.env** file using any text editor.
- This file contains general bot settings in this format:

|       Field name        |               Example value                |                                Description                                |
|:-----------------------:|:------------------------------------------:|:-------------------------------------------------------------------------:|
|      CLIENT_TOKEN       |                    "-"                     |  The token you copied from the Developer Portal, used to login the bot.   |
|         PREFIX          |                    "/"                     |              This is the character used to execute commands.              |
| UIDR, UIDJ, UIDD, UIDT  |            "123456789123456789"            |                The user id's of the four bot maintainers.                 |
|       MAINTENANCE       |                  "false"                   |    Makes all commands maintainer-only, sets status to do not disturb.     |
|          DEBUG          |                  "false"                   |                       Shows advanced console logs.                        |
|           DEV           |                  "false"                   | Disables certain features that are only necessary for the production bot. |
|         LOG_DEV         |                  "false"                   |                Logs bot errors into the dev-logs channel.                 |
| COMPLIBOT_GIT_USERNAME  |                "CompliBot"                 |                  Git username for the CompliBot account.                  |
|   COMPLIBOT_GIT_EMAIL   |    "CompliBot@users.noreply.github.com"    |                   Git email for the CompliBot account.                    |
| COMPLIBOT_GIT_JSON_REPO |     "/Compliance-Resource-Pack/JSON/"      |                Github repository to push/pull json files.                 |
|   COMPLIBOT_GIT_TOKEN   | "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0" |                Git token for the CompliBot GitHub account.                |

### Other configs:

- `resources/colors.js` for embed colors
- `resources/strings.js` for embed or message texts
- `resources/settings.js` for role and channel id's
