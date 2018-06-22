module.exports = async (client, command, err, message, args, fromPattern) => {
  console.error(`[${new Date().toISOString()}] COMMAND_ERROR | ${command.group.id}:${command.name} ${args} | ${message.author.username}#${message.author.discriminator}:${message.guild ? message.guild.name : 'DM'}`)
  console.error(err)
}
