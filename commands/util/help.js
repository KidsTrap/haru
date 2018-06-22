const { Command } = require('discord.js-commando')

class commandHelp extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      description: 'Shows a list of commands and details of a command',
      examples: [
        'help',
        'help anime'
      ],
      guarded: true,
      args: [
        {
          key: 'command',
          prompt: 'Type the name of the command you\'d like to see its details',
          type: 'string',
          default: ''
        }
      ]
    })
  }

  async run (msg, args) {
    const cmdGroup = this.client.registry.groups
    const cmdSpecific = this.client.registry.findCommands(args.command, false, msg)

    if (args.command) {
      if (cmdSpecific[0]) {
        let cmd = cmdSpecific[0]

        const messages = []

        messages.push(`\`${cmd.name}\` ${cmd.description}`)
        if (cmd.details) messages.push('\n' + cmd.details)
        messages.push('')

        if (cmd.guildOnly) messages.push('Can only be used in guilds.')
        if (cmd.nsfw) messages.push('Can only be used in NSFW channels.')
        if (cmd.aliases.length > 0) messages.push(`Aliases: ${cmd.aliases.join(', ')}`)
        if (cmd.format) messages.push(`Usage: \`${cmd.name} ${cmd.format}\` `)

        if (cmd.examples) {
          messages.push('')
          messages.push('Examples:')
          cmd.examples.forEach(example => {
            messages.push(`\`${example}\``)
          })
        }

        const finalMsg = messages.join('\n')
        msg.channel.send(finalMsg, { split: true })
      } else {
        msg.channel.send('Unable to find that command.')
      }
    } else {
      const messages = []

      messages.push(`Command List`)
      messages.push(`To run a command in ${msg.guild ? msg.guild.name : 'any server'}, use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.`)
      messages.push(`To run a command in ${msg.guild ? '' : 'this '}DM, use ${Command.usage('command', null, null)} with no prefix.`)
      messages.push('')

      cmdGroup.forEach(group => {
        let groupString = ''
        groupString += `**${group.name} - ** `

        group.commands.forEach(command => {
          if (!command.isUsable(msg)) return

          groupString += `\`${command.name}\` `
        })

        if (!groupString.includes('`')) return

        messages.push(groupString)
      })

      const finalMsg = messages.join('\n')
      msg.channel.send(finalMsg, { split: true })
    }
  }
}

module.exports = commandHelp
