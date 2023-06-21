<img src="https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/logos/transparent/256/complibot_logo.png" alt="CompliBot" align="right" height="256px">
<div align="center">
  <h1>CompliBot</h1>
  <h3>The official bot for the Faithful Discord servers.</h3>

![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/Discord-Bot)
![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/Discord-Bot)
![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/Discord-Bot)
[![Crowdin](https://badges.crowdin.net/e/1602cfd1a52793da79736586c4493097/localized.svg)](https://faithful.crowdin.com/discord-bot)
</div>

---

## Online on:
- [Faithful](https://discord.gg/sN9YRQbBv7)
- [Classic Faithful](https://discord.gg/KSEhCVtg4J)

---

## Found an issue?
Please submit it using our [bug tracker](https://github.com/Faithful-Resource-Pack/Discord-Bot/issues/new/choose) or by using the `/feedback <text>` command from the bot. The bug tracker is preferred but both options are valid.

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

> **⚠️ We won't help you re-branding the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

1. Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
2. Go to the **Bot** tab, create a bot and copy its token.
3. Create a file named `tokens.json` or renamed the `tokens.json.example` to that name.
4. Fill all field following this format:

```jsonc
{
  "prefix": "/", // bot prefix for non-slash commands
  "firestormToken": "", // writting token from the firestorm library
  "token": "" // bot token from the Discord Developer Portal
}
```

### Other configs:

See `config.json` for general public config.

### Firestorm
This project is heavily developed around the self hosted Firestore-like database: [firestorm-db](https://github.com/TheRolfFR/firestorm-db). Feel free to check the repository of that library to easily understand how it works.
