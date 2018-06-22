const { Command } = require('discord.js-commando')

class DisableCommandCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'disable',
      group: 'admin',
      memberName: 'disable',
      description: 'Disables a command or command group.',
      details: `The argument must be the name/ID (partial or whole) of a command or command group.\nOnly administrators may use this command.`,
      examples: ['disable util', 'disable Utilities', 'disable prefix'],
      guarded: true,

      args: [
        {
          key: 'cmdOrGrp',
          label: 'command/group',
          prompt: 'Which command or group would you like to disable?',
          type: 'group|command'
        }
      ]
    })
  }

  hasPermission (msg) {
    if (!msg.guild) { return this.client.isOwner(msg.author) }
    return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author)
  }

  run (msg, args) {
    if (!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
      return msg.reply(`The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already disabled.`)
    }
    if (args.cmdOrGrp.guarded) {
      return msg.reply(`You cannot disable the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`)
    }

    args.cmdOrGrp.setEnabledIn(msg.guild, false)
    msg.reply(`Disabled the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`)
  }
}

module.exports = DisableCommandCommand
