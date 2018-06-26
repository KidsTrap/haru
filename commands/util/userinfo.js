const { Command } = require('discord.js-commando')

class commandUserInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user'],
      group: 'util',
      memberName: 'userinfo',
      description: 'Shows information regarding a user.',
      examples: [
        'userinfo',
        'userinfo .intrnl#6380',
        'userinfo 443765978132643850'
      ],
      args: [
        {
          key: 'user',
          prompt: 'Type the name (full or partial) of a user you\'d like to search',
          type: 'user',
          default: ''
        }
      ]
    })
  }

  async run (msg, { user }) {
    if (!user || user === '') user = msg.author
    let guildMember = msg.guild ? msg.guild.members.get(user.id) : null
    let userAvail
    let userGame
    let userGameName

    const embed = {
      author: {},
      thumbnail: {},
      fields: []
    }

    switch (user.presence.status) {
      case 'online':
        userAvail = 'Online'
        break
      case 'offline':
        userAvail = 'Offline'
        break
      case 'idle':
        userAvail = 'Idle'
        break
      case 'dnd':
        userAvail = 'Do Not Disturb'
        break
      default:
        userAvail = 'undefined'
        break
    }

    if (user.presence.game) {
      userGameName = user.presence.game.name
      switch (user.presence.game.type) {
        case 0:
          userGame = 'playing'
          break
        case 1:
          userGame = 'streaming'
          break
        case 2:
          userGame = 'listening'
          break
        case 4:
          userGame = 'watching'
          break
        default:
          userGame = 'undefined'
      }
    }

    if (guildMember && guildMember.displayColor !== 0) embed.color = guildMember.displayColor

    embed.author.name = `${user.username}#${user.discriminator}`
    embed.author.icon_url = user.displayAvatarURL
    embed.author.url = user.displayAvatarURL

    embed.description = userAvail
    if (user.presence.game) embed.description = `${userAvail}, ${userGame} ${userGameName}.`

    embed.thumbnail.url = user.displayAvatarURL
    
    embed.fields.push({ 'name': 'User ID', 'value': user.id, 'inline': true })
    if (guildMember) embed.fields.push({ 'name': 'Nickname', 'value': guildMember.displayName, 'inline': true })
    embed.fields.push({ 'name': 'Account created at', 'value': user.createdAt, 'inline': true })
    if (guildMember) embed.fields.push({ 'name': 'Joined guild at', 'value': guildMember.joinedAt, 'inline': true })
    if (guildMember) embed.fields.push({ 'name': `Roles [${guildMember.roles.size - 1}]`, 'value': guildMember.roles.sort((a, b) => a.position - b.position || 1).filter(role => role.name !== '@everyone').map(role => role.name).reverse().join(', ') || 'No roles' })

    msg.channel.send({ embed })
  }
}

module.exports = commandUserInfo
