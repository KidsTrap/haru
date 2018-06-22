module.exports = async (client, command, promise, message, args, fromPattern) => {
  console.log(`[${new Date().toISOString()}] COMMAND_RUN | ${command.group.id}:${command.name} | ${message.author.username}#${message.author.discriminator}:${message.guild ? message.guild.name : 'DM'}`)
}
