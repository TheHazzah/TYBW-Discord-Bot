<div align="center">

<img src="https://img.shields.io/badge/Bleach-TYBW%20Monitor-b5121b?style=for-the-badge&logo=discord&logoColor=white" alt="Bleach TYBW Monitor"/>

# ⚔️ Bleach TYBW Monitor

**A Discord bot that watches nyaa.si and announces the moment a new episode of**
**_Bleach: Thousand-Year Blood War — The Calamity_ or _Sennen Kessen-hen — Kashin-tan_ drops.**

<br/>

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)

</div>

---

## What it does

The moment a new episode lands on nyaa.si, this bot pings off an `@everyone` announcement in whatever Discord channel you point it at — complete with the torrent filename, a direct link, and seeder/leecher info pulled straight from the RSS feed.

It polls nyaa every 5 minutes (configurable), and it works great. Because multiple subgroups often upload the same episode within hours of each other such as SubsPlease, Erai-raws, and others, the bot detects the episode number from the title and only ever pings once per episode, no matter how many groups upload it. The first one through wins, everything after gets silently skipped.

The matching is intentionally strict too. It only pings when both `Bleach` and the specific arc subtitle — `The Calamity` or `Kashin-tan` — appear in the title together.

Everything it's seen is saved locally so it survives restarts without losing its memory or sending duplicate pings.

---

## Requirements

- [Node.js](https://nodejs.org) v18 or higher
- A Discord bot token — get one from the [Discord Developer Portal](https://discord.com/developers/applications)
- The channel ID you want announcements posted in

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/bleach-tybw-bot.git
cd bleach-tybw-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your environment

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# Optional — how often to check nyaa.si in milliseconds (default: 5 minutes)
CHECK_INTERVAL_MS=300000
```

> **Don't know your channel ID?**
> In Discord, go to **Settings → Advanced**, enable **Developer Mode**, then right-click your announcement channel and hit **Copy Channel ID**.

### 4. Run it

```bash
npm start
```

You'll see the bot log in and confirm it's watching. From there it checks nyaa silently in the background until something shows up.

---

## Discord Bot Permissions

When inviting the bot to your server, make sure it has:

| Permission | Why |
|---|---|
| `Send Messages` | To post announcements |
| `Embed Links` | To render the rich embed card |
| `Mention Everyone` | To ping `@everyone` on a new upload |

---

## How the matching works

The bot checks every RSS item against two strict phrase groups. A title has to satisfy **all phrases** in one group to trigger an announcement:

```
Group 1 → "bleach" + "thousand-year blood war" + "the calamity"
Group 2 → "bleach" + "sennen kessen-hen" + "kashin-tan"
```

This means a stray upload titled `Bleach - Thousand-Year Blood War - 26` won't set it off. It has to be the right arc.

---

## One ping per episode

Multiple subgroups often upload the same episode within hours of each other. Without deduplication, you'd get pinged for every single one. The bot avoids this by extracting the episode number from the title and tracking it separately from the torrent itself.

The first upload of episode 01 triggers the announcement. Every subsequent upload of episode 01 — from any subgroup, in any quality — is silently skipped. When episode 02 appears, the cycle resets.

This is tracked in `seen.json` alongside the torrent history, so it persists across restarts too.

---

## Project structure

```
bleach-tybw-bot/
├── index.js          # Everything — bot logic, RSS polling, Discord client
├── package.json
├── Dockerfile
├── .env.example      # Copy this to .env and fill it in
├── .gitignore
└── seen.json         # Auto-created on first run, tracks episodes + torrents
```

---

## Configuration reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | ✅ | — | Your Discord bot token |
| `DISCORD_CHANNEL_ID` | ✅ | — | Channel to post announcements in |
| `CHECK_INTERVAL_MS` | ❌ | `300000` | Polling interval in ms (don't go below `60000`) |

---

<div align="center">

Built for the wait between episodes. May it make the drought a little more bearable.

*— for the Bleach fans still showing up.*

</div>
