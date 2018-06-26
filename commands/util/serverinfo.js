const { Command } = require('discord.js-commando')

class commandServerInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server'],
      group: 'util',
      memberName: 'serverinfo',
      description: 'Shows information regarding this server.',
      guildOnly: true,
      examples: [
        'serverinfo',
        'server roles',
        'serverinfo icon'
      ],
      args: [
        {
          key: 'type',
          prompt: 'Type the type of information you want to see.',
          type: 'string',
          default: ''
        }
      ]
    })
  }

  async run (msg, { type }) {
    const embed = {
      author: {},
      thumbnail: {},
      fields: [],
      image: {}
    }
    let guild = msg.guild

    if (type.toLowerCase() === 'roles') {
      embed.title = `Roles [${guild.roles.size}]`
      embed.description = guild.roles.sort((a, b) => a.position - b.position || 1).map(role => role.name).reverse().join(', ') || 'No roles'
      return msg.channel.send({ embed })
    }
    if (type.toLowerCase() === 'icon') {
      embed.image.url = guild.iconURL
      return msg.channel.send({ embed })
    }

    embed.author.name = guild.name

    if (guild.iconURL) {
      embed.author.icon_url = guild.iconURL
      embed.author.url = guild.iconURL
      embed.thumbnail.url = guild.iconURL
    }

    let descriptionData = []
    descriptionData.push(`Server ID: ${guild.id}`)
    if (this.client.shard) descriptionData.push(`Shard: ${this.client.shard.id}`)

    embed.description = descriptionData.join('\n')

    let guildVerificationText
    switch (guild.verificationLevel) {
      case 0:
        guildVerificationText = 'None (Unrestricted)'
        break
      case 1:
        guildVerificationText = 'Low (Must have verified email on Discord)'
        break
      case 2:
        guildVerificationText = 'Medium (Must be registered on Discord for 5+ minutes)'
        break
      case 3:
        guildVerificationText = 'High (Must be a member of the server for 10+ minutes)'
        break
      case 4:
        guildVerificationText = 'Very High (Must have a verified phone number)'
        break
    }
    let channelData = []
    channelData.push(`${guild.channels.filter(channel => channel.type === 'category').size} categories`)
    channelData.push('')
    channelData.push(`${guild.channels.filter(channel => channel.type === 'text').size} text channels`)
    channelData.push(`${guild.channels.filter(channel => channel.type === 'voice').size} voice channels`)

    embed.fields.push({ 'name': 'Verification Level', 'value': guildVerificationText })
    embed.fields.push({ 'name': 'Region', 'value': guild.region, 'inline': true })
    embed.fields.push({ 'name': `Members [${guild.members.size}]`, 'value': guild.members.filter(user => user.presence.status !== 'offline').size + ' online', 'inline': true })
    embed.fields.push({ 'name': `Channels [${guild.channels.size}]`, 'value': channelData.join('\n'), 'inline': true })
    embed.fields.push({ 'name': 'Server Owner', 'value': `${guild.owner.user.username}#${guild.owner.user.discriminator} (${guild.owner.id})` })
    embed.fields.push({ 'name': 'Created on', 'value': guild.createdAt })
    embed.fields.push({ 'name': `Roles [${guild.roles.size}]`, 'value': `To see a list of roles, use **${msg.guild.commandPrefix}serverinfo roles**.` })

    msg.channel.send({ embed })
  }
}

module.exports = commandServerInfo
