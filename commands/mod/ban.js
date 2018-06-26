const { Command } = require('discord.js-commando')

class commandBan extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      group: 'mod',
      memberName: 'ban',
      description: 'Bans someone from the server',
      details: '`[reason]` Reason to give for the ban\n`[prune]` Days worth of message to delete from the user\n`[responsible]` Show to the banned user that you are responsible',
      examples: [
        'ban',
        'ban .intrnl#6939',
        'ban intrnl Don\'t abuse my chickens!',
        'ban 443765978132643850 Raiding 1 true'
      ],
      clientPermissions: ['BAN_MEMBERS'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Who are you banning?',
          type: 'user'
        },
        {
          key: 'reason',
          prompt: 'What reason would you like to give for this ban?',
          type: 'string',
          default: ''
        },
        {
          key: 'prune',
          prompt: 'How many days worth of messages would you like to prune from this person? (max is 7 days).',
          type: 'integer',
          min: 0,
          max: 7,
          default: 0
        },
        {
          key: 'responsible',
          prompt: 'Do you want to put your name as the one responsible for the ban?',
          type: 'boolean',
          default: false
        }
      ]
    })
  }

  hasPermission (msg) {
    if (!msg.member.hasPermission('BAN_MEMBERS')) return 'You lack the permission to ban members.'
    return true
  }

  async run (msg, { user, reason, prune, responsible }) {
    let guildMember = msg.guild.members.get(user.id)
    if (user.id === msg.member.id) return msg.reply('you can\'t ban yourself.')
    if (user.id === this.client.user.id) return msg.reply('you can\'t ban this bot.')
    if (user.id === msg.guild.ownerID) return msg.reply('you can\'t ban the server owner.')
    if (guildMember) {
      if (!guildMember.bannable) return msg.reply('this user doesn\'t seem to be bannable by the bot.')
    }

    let dmBan = []
    dmBan.push(`You are banned from **${msg.guild.name}**`)
    if (reason || reason !== '') dmBan.push(`Reason: ${reason}`)
    if (responsible) dmBan.push(`Responsible moderator: ${msg.author.username}#${msg.author.discriminator}`)

    let log = ''
    if (reason || reason !== '') {
      log += reason
    } else {
      log += 'No reason given.'
    }
    log += ` - ${msg.author.username}#${msg.author.discriminator}`

    await user.send(dmBan.join('\n')).catch(err => { msg.channel.send(`Unable to DM the user about the banning.\n\`${err}\` `) })
    await msg.guild.ban(user, {
      days: prune,
      reason: log
    })
      .catch(err => { msg.channel.send(`Unable to ban user.\n\`\`\`${err}\`\`\``) })
      .then(_ => { msg.channel.send(`${user.username}#${user.discriminator} was banned.`) })
  }
}

module.exports = commandBan
