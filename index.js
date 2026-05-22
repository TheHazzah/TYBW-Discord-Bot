require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const fs = require("fs");
 
// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const CHECK_INTERVAL_MS = parseInt(process.env.CHECK_INTERVAL_MS || "300000"); // 5 min default
const STATE_FILE = "./seen.json";
 
// Each entry is an array of phrases that must ALL appear in the title (case-insensitive).
// An upload matches if it satisfies ANY one of these groups.
const MATCH_GROUPS = [
  // "Bleach: Thousand-Year Blood War - The Calamity" (with or without colon/hyphen variants)
  ["bleach", "thousand-year blood war", "the calamity"],
  ["bleach", "thousand year blood war", "the calamity"],
  // "Bleach: Sennen Kessen-hen - Kashin-tan"
  ["bleach", "sennen kessen-hen", "kashin-tan"],
];
 
// Nyaa.si RSS feeds to poll (anime category)
const NYAA_FEEDS = [
  "https://nyaa.si/?page=rss&c=1_2&q=Bleach+Thousand+Year+Blood+War+The+Calamity",
  "https://nyaa.si/?page=rss&c=1_2&q=Bleach+Sennen+Kessen-hen+Kashin-tan",
];
 
// ── State (track what we've already announced) ────────────────────────────────
function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(STATE_FILE, "utf8")));
  } catch {
    return new Set();
  }
}
 
function saveSeen(seen) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...seen]));
}
 
// ── Helpers ───────────────────────────────────────────────────────────────────
function isBleachTYBW(title) {
  if (!title) return false;
  const lower = title.toLowerCase();
  // Title must satisfy every phrase in at least one MATCH_GROUP
  return MATCH_GROUPS.some((group) => group.every((phrase) => lower.includes(phrase)));
}
 
function buildEmbed(item) {
  const embed = new EmbedBuilder()
    .setColor(0xb5121b) // Ichigo's bankai red
    .setTitle("⚔️ New Bleach TYBW Upload Detected!")
    .setDescription(`**${item.title}**`)
    .setURL(item.link)
    .setThumbnail(
      "https://upload.wikimedia.org/wikipedia/en/a/a6/Bleach_%28manga%29_vol_1.jpg"
    )
    .setFooter({ text: "nyaa.si • Bleach Monitor" })
    .setTimestamp(item.pubDate ? new Date(item.pubDate) : new Date());
 
  if (item.link) {
    embed.addFields({ name: "🔗 Torrent Link", value: item.link });
  }
 
  // Try to parse seeders/leechers from description (nyaa includes this)
  if (item.contentSnippet) {
    const snippet = item.contentSnippet.slice(0, 300);
    embed.addFields({ name: "ℹ️ Info", value: snippet });
  }
 
  return embed;
}
 
// ── Core check ────────────────────────────────────────────────────────────────
async function checkFeeds(client, seen) {
  const parser = new Parser({ timeout: 10000 });
  let found = false;
 
  for (const feedUrl of NYAA_FEEDS) {
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Failed to fetch ${feedUrl}:`, err.message);
      continue;
    }
 
    for (const item of feed.items || []) {
      const id = item.guid || item.link;
      if (!id || seen.has(id)) continue;
      if (!isBleachTYBW(item.title)) continue;
 
      console.log(`[${new Date().toISOString()}] New upload found: ${item.title}`);
      seen.add(id);
      found = true;
 
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
          console.error("Channel not found:", CHANNEL_ID);
          continue;
        }
        const embed = buildEmbed(item);
        await channel.send({
          content: "@everyone A new Bleach TYBW episode has appeared on nyaa! 🩸",
          embeds: [embed],
        });
        console.log(`[${new Date().toISOString()}] Announcement sent for: ${item.title}`);
      } catch (err) {
        console.error("Failed to send Discord message:", err.message);
      }
    }
  }
 
  if (found) saveSeen(seen);
  return found;
}
 
// ── Bot startup ───────────────────────────────────────────────────────────────
async function main() {
  if (!TOKEN) throw new Error("Missing DISCORD_TOKEN environment variable");
  if (!CHANNEL_ID) throw new Error("Missing DISCORD_CHANNEL_ID environment variable");
 
  const seen = loadSeen();
  console.log(`[${new Date().toISOString()}] Loaded ${seen.size} previously seen items.`);
 
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
 
  client.once("ready", () => {
    console.log(`[${new Date().toISOString()}] Logged in as ${client.user.tag}`);
    console.log(`[${new Date().toISOString()}] Monitoring nyaa.si every ${CHECK_INTERVAL_MS / 1000}s`);
 
    // Run immediately on startup, then on interval
    checkFeeds(client, seen);
    setInterval(() => checkFeeds(client, seen), CHECK_INTERVAL_MS);
  });
 
  client.on("error", (err) => console.error("Discord client error:", err));
 
  await client.login(TOKEN);
}
 
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
 
