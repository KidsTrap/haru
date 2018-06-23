module.exports = (client, messages) => {
  var firstMessage = messages.first()

  if (firstMessage.guild) {
    const embed = {
      author: {},
      footer: []
    }

    embed.author.name = firstMessage.guild.name
    embed.author.icon_url = firstMessage.guild.iconURL

    embed.description = `Bulk message deletion in <#${firstMessage.channel.id}>, ${messages.size} messages deleted.`

    embed.footer.text = `${firstMessage.id} - ${messages.last().id}`
    embed.timestamp = new Date().toISOString()

    var logText = `@${client.user.username.toLowerCase()}-message-bulk;`

    firstMessage.guild.channels.forEach(function (guildChannel) {
      if (guildChannel.id === firstMessage.channel.id) return
      if (typeof guildChannel.topic !== 'string') return
      if (!firstMessage.guild.me.hasPermission('SEND_MESSAGES')) return

      if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
    })
  };
}
