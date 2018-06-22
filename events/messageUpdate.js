module.exports = (client, oldMessage, newMessage) => {
  if (newMessage.guild && newMessage.editedAt) {
    const embed = {}
    embed.author = {}
    embed.fields = []
    embed.footer = {}

    if (newMessage.member.displayColor !== 0) embed.color = newMessage.member.displayColor

    embed.author.name = `${newMessage.author.username}#${newMessage.author.discriminator}`
    embed.author.icon_url = newMessage.author.avatarURL

    embed.description = `Edited message by <@!${newMessage.author.id}> in <#${newMessage.channel.id}>`

    if (oldMessage.content) {
      embed.fields.push({ 'name': 'Old content', 'value': oldMessage.content })
    } else {
      embed.fields.push({ 'name': 'Old content', 'value': "Seems to be empty here, it's probably an embed or attachment without a comment." })
    }
    if (newMessage.content) {
      embed.fields.push({ 'name': 'Old content', 'value': newMessage.content })
    } else {
      embed.fields.push({ 'name': 'Old content', 'value': "Seems to be empty here, it's probably an embed or attachment without a comment." })
    }

    embed.timestamp = newMessage.editedAt
    embed.footer.text = newMessage.id

    var logText = `@${client.user.username.toLowerCase()}-message-edit;`

    newMessage.guild.channels.forEach(function (guildChannel) {
      if (guildChannel.id === newMessage.channel.id) return
      if (typeof guildChannel.topic !== 'string') return
      if (!newMessage.guild.me.hasPermission('SEND_MESSAGES')) return

      if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
    })
  };
}
