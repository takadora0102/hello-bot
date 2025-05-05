const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'hello') {
    await interaction.reply('こんにちは！');
  }
});

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [new SlashCommandBuilder().setName('hello').setDescription('こんにちはと返します').toJSON()]
    });
    console.log('✅ スラッシュコマンド登録完了');
  } catch (e) {
    console.error('❌ コマンド登録失敗:', e);
  }
})();

const app = express();
app.get('/', (_, res) => res.send('Bot is running.'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Webサーバー起動'));

client.login(TOKEN);
