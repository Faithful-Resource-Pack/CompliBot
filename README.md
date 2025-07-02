<img src="https://database.faithfulpack.net/images/branding/logos/transparent/hd/complibot_logo.png?w=256" alt="CompliBot Logo" align="right">
<div align="center">
  <h1>CompliBot</h1>
  <h3>The official bot for the Faithful Discord servers.</h3>

  ![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/CompliBot)
  ![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/CompliBot)
  ![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/CompliBot)
  [![Crowdin](https://badges.crowdin.net/e/656f9fc7c628d23c87426953b11cf26c/localized.svg)](https://faithful.crowdin.com/complibot)
</div>

---

## Found a bug or want to suggest something?

Please submit it using our [bug tracker](https://github.com/Faithful-Resource-Pack/CompliBot/issues/new/choose) or by using the `/feedback` form on our bot.

---

## Requirements

- NodeJS 20+ https://nodejs.org
- pnpm (`corepack enable` + `corepack prepare pnpm@latest --activate`)

## Running

```bash
pnpm install
```

```bash
pnpm dev
```

---

## Bot setup:

**DISCLAIMER: We won't help you rebrand the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

1. Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
2. Go to the **Bot** tab, create a bot and copy its token.
3. Rename `tokens.json.example` in the `json/` folder to `tokens.json`.
4. Paste your token after `token`. Additional information like API tokens and various testing modes can be enabled from there as well.

## API Reference:

This project is heavily developed around our public API. Check out our API documentation at https://api.faithfulpack.net/docs for more information about endpoints and making requests.

## Translating:

Many messages shown throughout the bot can be translated into users' native languages for easier usage. Our translation service is powered by Crowdin, [and you can start translating there](https://faithful.crowdin.com/complibot) by clicking on your language in the list. All languages that Discord supports should be listed there.
