module.exports = async (client, command, promise, message, args, fromPattern) => {
  console.log(`${command.group.id}:${command.name} | ${message.author.username}#${message.author.discriminator} | ${message.guild ? message.guild.name : 'Direct Message'}`)
}
