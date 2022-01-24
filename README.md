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
### You found an issue?
Please submit it using our [bug tracker](https://github.com/Compliance-Resource-Pack/Discord-Bot/issues/new/choose) or by using the `/feedback <text>` command from the bot. The bug tracker is preferred but both options are valids.
___
### Installation and launching:
1. Install **[Node.js](https://nodejs.org/)** on your machine. **Version 16.6.0 or higher is required!**
2. Clone the repository on your machine.
3. Open your console in the cloned repository.
4. To complete the installation, write the following command in the console:
```bash
npm install
```
5. After installation, you will need to **[configure the bot](#bot-config)**.
6. To start the bot, write the following command in the console:
```bash
npm run dev
```

___
### Bot config:

> **⚠️ We won't help you rebranding the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

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
This project is heavily developped around the self hosted Firestore-like database: [firestorm-db](https://github.com/TheRolfFR/firestorm-db). Feel free to check the repository of that library to easily understand how it works.