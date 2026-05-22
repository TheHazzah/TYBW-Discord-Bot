Bleach TYBW Monitor
A Discord bot that watches nyaa.si and announces the moment a new episode of
Bleach: Thousand-Year Blood War — The Calamity or Sennen Kessen-hen — Kashin-tan drops.
No more refreshing the page. No more missing the upload window.
The bot does the waiting so you don't have to.
<br/>
Show Image
Show Image
Show Image
</div>

What it does
The moment a new episode lands on nyaa.si, this bot fires off an @everyone announcement in whatever Discord channel you point it at — complete with the torrent filename, a direct link, and seeder/leecher info pulled straight from the RSS feed.
It polls nyaa every 5 minutes (configurable), keeps a local record of everything it's already announced so you never get a duplicate ping, and survives restarts without losing its memory.
The matching is intentionally strict. It won't ping you for a random Bleach filler repack or an older arc re-upload. It only fires when both Bleach and the specific arc subtitle — The Calamity or Kashin-tan — appear in the title together.

Requirements

Node.js v18 or higher
A Discord bot token — get one from the Discord Developer Portal
The channel ID you want announcements posted in


Setup
1. Clone the repo
bashgit clone https://github.com/yourusername/bleach-tybw-bot.git
cd bleach-tybw-bot
2. Install dependencies
bashnpm install
3. Configure your environment
Copy the example env file and fill it in:
bashcp .env.example .env
envDISCORD_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# Optional — how often to check nyaa.si in milliseconds (default: 5 minutes)
CHECK_INTERVAL_MS=300000

Don't know your channel ID?
In Discord, go to Settings → Advanced, enable Developer Mode, then right-click your announcement channel and hit Copy Channel ID.

4. Run it
bashnpm start
You'll see the bot log in and confirm it's watching. From there it checks nyaa silently in the background until something shows up.

Discord Bot Permissions
When inviting the bot to your server, make sure it has:
PermissionWhySend MessagesTo post announcementsEmbed LinksTo render the rich embed cardMention EveryoneTo ping @everyone on a new upload

Running 24/7 with Docker
If you want the bot running around the clock on a server or VPS, Docker is the easiest path.
bash# Build the image
docker build -t bleach-tybw-bot .

# Run it (mount seen.json so state persists across restarts)
docker run -d \
  --name bleach-tybw-bot \
  --restart unless-stopped \
  --env-file .env \
  -v $(pwd)/seen.json:/app/seen.json \
  bleach-tybw-bot
The -v flag is important — it keeps the bot's memory of past announcements alive even if the container is rebuilt or restarted.

How the matching works
The bot checks every RSS item against two strict phrase groups. A title has to satisfy all phrases in one group to trigger an announcement:
Group 1 → "bleach" + "thousand-year blood war" + "the calamity"
Group 2 → "bleach" + "sennen kessen-hen" + "kashin-tan"
This means a stray upload titled Bleach - Thousand-Year Blood War - 26 won't set it off. It has to be the right arc.

Project structure
bleach-tybw-bot/
├── index.js          # Everything — bot logic, RSS polling, Discord client
├── package.json
├── Dockerfile
├── .env.example      # Copy this to .env and fill it in
├── .gitignore
└── seen.json         # Auto-created on first run, tracks announced uploads

Configuration reference
VariableRequiredDefaultDescriptionDISCORD_TOKEN✅—Your Discord bot tokenDISCORD_CHANNEL_ID✅—Channel to post announcements inCHECK_INTERVAL_MS❌300000Polling interval in ms (don't go below 60000)

<div align="center">
Built for the wait between episodes. May it make the drought a little more bearable.
— for the Bleach fans still showing up.
</div>
