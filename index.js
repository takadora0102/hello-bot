const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const POINTS_FILE = './points.json';
const SERF_ROLE_NAME = 'Serf';

function loadPoints() {
  if (!fs.existsSync(POINTS_FILE)) fs.writeFileSync(POINTS_FILE, '{}');
  return JSON.parse(fs.readFileSync(POINTS_FILE));
}
function savePoints(points) {
  fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2));
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`✅ BOT起動：${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const points = loadPoints();
  const userId = interaction.user.id;
  const guild = interaction.guild;
  const member = await guild.members.fetch(userId);

  if (interaction.commandName === 'register') {
    if (points[userId]) {
      await interaction.reply({ content: '✅ すでに登録済みです。', ephemeral: true });
      return;
    }

    points[userId] = { point: 1000 };
    savePoints(points);

    const serfRole = guild.roles.cache.find(r => r.name === SERF_ROLE_NAME);
    if (serfRole) {
      await member.roles.add(serfRole);
    }

    const newNick = `【農奴】${interaction.user.username}`;
    await member.setNickname(newNick).catch(() => {});

    await interaction.reply('✅ 登録完了！1000ptと農奴ロールが付与されました。');
  }
});

// スラッシュコマンド登録
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: [
          new SlashCommandBuilder()
            .setName('register')
            .setDescription('初期登録してポイントと農奴ロールを受け取る')
            .toJSON()
        ]
      }
    );
    console.log('✅ スラッシュコマンド登録完了');
  } catch (error) {
    console.error('❌ スラッシュコマンド登録エラー:', error);
  }
})();

// Webサーバー（Render対応）
require('http').createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);
