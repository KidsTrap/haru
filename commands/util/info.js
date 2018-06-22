const { Command } = require('discord.js-commando')

const discordjs = require('discord.js')
const commando = require('discord.js-commando')

class commandInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      group: 'util',
      memberName: 'info',
      description: 'Shows the bot\'s information',
      examples: ['info'],
    })
  }
  
  async run (msg) {
    const embed = {
      author: {},
      fields: [],
      footer: {}
    }

    embed.color = 5588155
    embed.author.name = `${this.client.user.username}#${this.client.user.discriminator}`
    embed.author.icon_url = this.client.user.displayAvatarURL
    embed.author.url = 'https://github.com/intrnl/haru'

    embed.description = `Currently using ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of memory.`

    embed.fields.push({ 'name': 'discord.js', 'value': `[ver ${discordjs.version}](https://github.com/discordjs/discord.js)`, 'inline': true })
    embed.fields.push({ 'name': 'Commando', 'value': `[ver ${commando.version}](https://github.com/discordjs/Commando)`, 'inline': true })
    embed.fields.push({ 'name': 'Node.js', 'value': `[ver ${process.version}](https://github.com/nodejs/node)` , 'inline': true })

    embed.fields.push({ 'name': 'Servers', 'value': this.client.guilds.size.toLocaleString(), 'inline': true })
    embed.fields.push({ 'name': 'Channels', 'value': this.client.channels.size.toLocaleString(), 'inline': true })
    embed.fields.push({ 'name': 'Members', 'value': this.client.users.size.toLocaleString(), 'inline': true })  

    msg.channel.send({ embed })
  }
}

module.exports = commandInfo