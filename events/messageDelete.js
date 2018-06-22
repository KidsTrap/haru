module.exports = (client, message) => {
  if (message.guild) {
    const embed = {}
    embed.author = {}
    embed.fields = []
    embed.footer = {}

    if (message.member.displayColor !== 0) embed.color = message.member.displayColor

    embed.author.name = `${message.author.username}#${message.author.discriminator}`
    embed.author.icon_url = message.author.avatarURL

    embed.description = `Deleted message by <@!${message.author.id}> in <#${message.channel.id}>`

    if (message.content) {
      embed.fields.push({ 'name': 'Content', 'value': message.content })
    } else {
      embed.fields.push({ 'name': 'Content', 'value': "Seems to be empty here, it's probably an embed or attachment without a comment." })
    };

    embed.timestamp = message.createdAt
    embed.footer.text = message.id

    var logText = `@${client.user.username.toLowerCase()}-message-delete;`

    message.guild.channels.forEach(function (guildChannel) {
      if (guildChannel.id === message.channel.id) return
      if (typeof guildChannel.topic !== 'string') return
      if (!message.guild.me.hasPermission('SEND_MESSAGES')) return

      if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
    })
  };
}
