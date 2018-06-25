const { Command } = require('discord.js-commando')

const discordjs = require('discord.js')
const commando = require('discord.js-commando')

class commandInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'info',
      group: 'util',
      memberName: 'info',
      description: 'Shows the bot\'s information',
      examples: ['info']
    })
  }

  async run (msg) {
    const ms = this.client.uptime
    const hrs = Math.floor(ms / (1000 * 60 * 60)).toString()
    const min = Math.floor((ms / (1000 * 60)) % 60).toString()
    const sec = Math.floor((ms / 1000) % 60).toString()
    const time = `${hrs} hours, ${min} minutes, ${sec} seconds`

    let botGuilds
    let botChannels
    let botUsers

    if (this.client.shard) {
      let guildsEval = await this.client.shard.broadcastEval('this.guilds.size.toLocaleString()')
      let channelsEval = await this.client.shard.broadcastEval('this.channels.size.toLocaleString()')
      let usersEval = await this.client.shard.broadcastEval('this.users.size.toLocaleString()')

      botGuilds = guildsEval.reduce((prev, val) => prev + val)
      botChannels = channelsEval.reduce((prev, val) => prev + val)
      botUsers = usersEval.reduce((prev, val) => prev + val)
    } else {
      botGuilds = this.client.guilds.size.toLocaleString()
      botChannels = this.client.channels.size.toLocaleString()
      botUsers = this.client.users.size.toLocaleString()
    }

    const embed = {
      author: {},
      fields: [],
      footer: {}
    }

    embed.color = 5588155
    embed.author.name = `${this.client.user.username}#${this.client.user.discriminator}`
    embed.author.icon_url = this.client.user.displayAvatarURL
    embed.author.url = 'https://github.com/intrnl/haru'

    let desc = []
    if (this.client.shard) desc.push(`${this.client.shard.count} shard(s) active`)
    desc.push(`Running for ${time}`)
    desc.push(`Currently using ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of memory`)
    embed.description = desc.join('\n')

    embed.fields.push({ 'name': 'discord.js', 'value': `[ver ${discordjs.version}](https://github.com/discordjs/discord.js)`, 'inline': true })
    embed.fields.push({ 'name': 'Commando', 'value': `[ver ${commando.version}](https://github.com/discordjs/Commando)`, 'inline': true })
    embed.fields.push({ 'name': 'Node.js', 'value': `[ver ${process.version}](https://github.com/nodejs/node)`, 'inline': true })

    embed.fields.push({ 'name': 'Servers', 'value': botGuilds, 'inline': true })
    embed.fields.push({ 'name': 'Channels', 'value': botChannels, 'inline': true })
    embed.fields.push({ 'name': 'Users', 'value': botUsers, 'inline': true })

    msg.channel.send({ embed })
  }
}

module.exports = commandInfo
