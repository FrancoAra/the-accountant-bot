// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  } else if (msg.content === 'give me my noob level') {
    msg.reply('over 9000');
  }
});

client.login(process.env.DISCORD_TOKEN);