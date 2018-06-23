const { Command, FriendlyError } = require('discord.js-commando')

class commandUnban extends Command {
  constructor (client) {
    super(client, {
      name: 'unban',
      group: 'mod',
      memberName: 'unban',
      description: 'Unbans someone from the server',
      examples: [
        'unban',
        'unban .intrnl#6939',
        'unban intrnl',
        'unban 443765978132643850'
      ],
      clientPermissions: ['BAN_MEMBERS'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Who are you unbanning?',
          type: 'user'
        },
        {
          key: 'reason',
          prompt: 'What reason would you like to give for this unban?',
          type: 'string'
        },
        {
          key: 'responsible',
          prompt: 'Do you want to put your name as the one responsible for the unban?',
          type: 'boolean'
        }
      ]
    })
  }

  hasPermission(msg) {
    if (!msg.member.hasPermission('BAN_MEMBERS')) return 'You lack the permission to unban members.'
    return true
  }

  async run (msg, { user, reason, prune, responsible }) {
    if (user.id === msg.member.id) return msg.reply('you\'re not banned.')
    if (user.id === this.client.user.id) return msg.reply('this bot isn\'t banned.')
    if (user.id === msg.guild.ownerID) return msg.reply('the server owner isn\'t banned')

    let dmBan = []
    dmBan.push(`You are unbanned from **${msg.guild.name}**`)
    if (reason || reason !== 'null') dmBan.push(`Reason: ${reason}`)
    if (responsible) dmBan.push(`Responsible moderator: ${msg.author.username}#${msg.author.discriminator}`)

    await user.send(dmBan.join('\n')).catch(err => {})
    await msg.guild.unban(user, reason ? `${reason} - ${msg.author.username}#${msg.author.discriminator}` : `No reason given. - ${msg.author.username}#${msg.author.discriminator}`)
      .catch(err => { msg.channel.send(`Unable to unban user.\n\`\`\`${err}\`\`\``) })
      .then(_ => { msg.channel.send(`${user.username}#${user.discriminator} was unbanned.`) })
  }
}

module.exports = commandUnban
