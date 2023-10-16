<img src="https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/logos/transparent/256/complibot_logo.png" alt="CompliBot" align="right" height="256px">
<div align="center">
  <h1>CompliBot</h1>
  <h3>The official bot for the Faithful Discord servers.</h3>

![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/CompliBot)
![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/CompliBot)
![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/CompliBot)
[![Crowdin](https://badges.crowdin.net/e/1602cfd1a52793da79736586c4493097/localized.svg)](https://faithful.crowdin.com/complibot)
</div>

---

## Found an issue?
Please submit it using our [bug tracker](https://github.com/Faithful-Resource-Pack/CompliBot/issues/new/choose) or by using the `/feedback` form on our bot.

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
## Bot setup:

**DISCLAIMER: We won't help you rebrand the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

1. Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
2. Go to the **Bot** tab, create a bot and copy its token.
3. Rename `tokens.json.example` in the `json/` folder to `tokens.json`.
4. Paste your token after `token`. Additional information like API tokens and various testing modes can be enabled from there as well.

## API Reference:

This project is heavily developed around our public API. Check out our API documentation at https://api.faithfulpack.net/docs for more information about endpoints and making requests.
