const { Command } = require('discord.js-commando')

class commandPrefix extends Command {
  constructor (client) {
    super(client, {
      name: 'prefix',
      group: 'admin',
      memberName: 'prefix',
      description: 'Shows or sets the command prefix.',
      format: '[prefix/"default"/"none"]',
      details: `If no prefix is provided, the current prefix will be shown.\nIf the prefix is "default", the prefix will be reset to the bot's default prefix.\nIf the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.\nOnly administrators may change the prefix.`,
      examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

      args: [
        {
          key: 'prefix',
          prompt: 'What would you like to set the bot\'s prefix to?',
          type: 'string',
          max: 15,
          default: ''
        }
      ]
    })
  }

  async run (msg, args) {
    // Just output the prefix
    if (!args.prefix) {
      const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix
      let messages = []

      messages.push(prefix ? `The command prefix is \`${prefix}\`.` : 'There is no command prefix.')
      messages.push(`To run commands, use ${msg.anyUsage('command')}.`)
      if (msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author)) messages.push(`To change the prefix for this guild, use ${Command.usage('prefix <new prefix>', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}`)
      return msg.channel.send(messages.join('\n'))
    }

    // Check the user's permission before changing anything
    if (msg.guild) {
      if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
        return msg.reply('Only administrators may change the command prefix.')
      }
    } else if (!this.client.isOwner(msg.author)) {
      return msg.reply('Only the bot owner(s) may change the global command prefix.')
    }

    // Save the prefix
    const lowercase = args.prefix.toLowerCase()
    const prefix = lowercase === 'none' ? '' : args.prefix
    let response
    if (lowercase === 'default') {
      if (msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null
      const current = this.client.commandPrefix ? `\`${this.client.commandPrefix}\`` : 'no prefix'
      response = `Reset the command prefix to the default (currently ${current}).`
    } else {
      if (msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix
      response = prefix ? `Set the command prefix to \`${args.prefix}\`.` : 'Removed the command prefix entirely.'
    }

    msg.channel.send(`${response} To run commands, use ${msg.anyUsage('command')}.`)
  }
};

module.exports = commandPrefix
