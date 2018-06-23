module.exports = async (client, command, promise, message, args, fromPattern) => {
  console.log(`[${new Date().toISOString()}] COMMAND_RUN | ${command.group.id}:${command.name} | ${message.author.username}#${message.author.discriminator}:${message.guild ? message.guild.name : 'DM'}`)

  let logText = `@${client.user.username.toLowerCase()}-command-run;`
  
  const embed = {
    author: {},
    fields: [],
    footer: {}
  }

  embed.author.name = `${message.author.username}#${message.author.discriminator}`
  embed.author.icon_url = message.author.avatarURL

  embed.description = `\`${command.name}\` ran by <@!${message.author.id}> in <#${message.channel.id}>`

  embed.fields.push({ 'name': 'Jump link', 'value': `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` })

  embed.timestamp = message.createdAt
  embed.footer.text = message.id

  message.guild.channels.forEach(function (guildChannel) {
    if (guildChannel.id === message.channel.id) return
    if (typeof guildChannel.topic !== 'string') return
    if (!message.guild.me.hasPermission('SEND_MESSAGES')) return

    if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
  })
}
