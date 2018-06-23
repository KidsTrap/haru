const { Command } = require('discord.js-commando')

class commandLogInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'logging',
      group: 'admin',
      memberName: 'logging',
      description: 'Shows information regarding server event logging',
      examples: ['logging']
    })
  }

  hasPermission (msg) {
    if (!msg.guild) { return this.client.isOwner(msg.author) }
    return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author)
  }

  async run (msg) {
    let messages = []
    messages.push('**Server event logging**')
    messages.push('Event logging works by setting a topic in the channel you want to put your logs in.')
    messages.push('')
    messages.push(`Format: \`@${this.client.user.username.toLowerCase()}-event;\``)
    messages.push('')
    messages.push(`For example, if you want to log message deletion, you should put \`@${this.client.user.username.toLowerCase()}-message-delete;\` into the channel you want to have it in.`)
    messages.push('This makes it possible to put logs in multiple channels at once.')
    messages.push('You can also put multiple logs within the same channel, the limitation is the channel topic\'s max character length.')
    messages.push('Make sure that the bot is allowed to read and send messages to that channel.')
    messages.push('')
    messages.push('**Available log events**')
    messages.push('`command-run` - logs command runs')
    messages.push('`message-attachment` - logs messages containing attachments')
    messages.push('`message-bulk` - logs bulk message deletion (usually done by bots pruning messages)')
    messages.push('`message-delete` - logs message deletion')
    messages.push('`message-edit` - logs message edit')
    messages.push('`message-link` - logs messages containing links')

    msg.channel.send(messages.join('\n'), { split: true })
  }
};

module.exports = commandLogInfo
