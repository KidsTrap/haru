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
    messages.push(`For example, \`@${this.client.user.username.toLowerCase()}-message-delete;\` as the channel topic if you want to log deletions.`)
    messages.push('The use of channel topic makes it possible to have the same event log posted in multiple channels and have multiple logs within one channel.')
    messages.push('Maximum amount of event logs in one channel depends on the channel topic\'s max character length, which is 1024 characters.')
    messages.push('Make sure that the bot is allowed to read and send messages to that channel.')
    messages.push('')
    messages.push('**Available log events**')
    messages.push('`command-run` - logs command runs')
    messages.push('`message-abuse` - logs message abuse like zalgo text or caps when it is enabled')
    messages.push('`message-attachment` - logs messages containing attachments')
    messages.push('`message-bulk` - logs bulk message deletion (usually done by bots pruning messages)')
    messages.push('`message-delete` - logs message deletion')
    messages.push('`message-edit` - logs message edit')
    messages.push('`message-link` - logs messages containing links')

    msg.channel.send(messages.join('\n'), { split: true })
  }
};

module.exports = commandLogInfo
