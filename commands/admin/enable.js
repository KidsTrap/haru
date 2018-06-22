const { Command } = require('discord.js-commando')

class EnableCommandCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'enable',
      group: 'admin',
      memberName: 'enable',
      description: 'Enables a command or command group.',
      details: `The argument must be the name/ID (partial or whole) of a command or command group.\nOnly administrators may use this command.`,
      examples: ['enable util', 'enable Utilities', 'enable prefix'],
      guarded: true,

      args: [
        {
          key: 'cmdOrGrp',
          label: 'command/group',
          prompt: 'Which command or group would you like to enable?',
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
    const group = args.cmdOrGrp.group
    if (args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
      return msg.reply(`The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already enabled${group && !group.enabled ? `, but the \`${group.name}\` group is disabled, so it still can't be used` : ''}.`)
    }

    args.cmdOrGrp.setEnabledIn(msg.guild, true)
    msg.reply(`Enabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}${group && !group.enabled ? `, but the \`${group.name}\` group is disabled, so it still can't be used` : ''}.`)
  }
};

module.exports = EnableCommandCommand
