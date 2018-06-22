const { Command } = require('discord.js-commando')
const request = require('request-promise-native')

class commandChangelog extends Command {
  constructor (client) {
    super(client, {
      name: 'changelog',
      group: 'util',
      memberName: 'changelog',
      description: 'Shows the bot\'s changelog',
      examples: ['changelog']
    })
  }

  async run (msg) {
    var changelogCurr = `https://api.github.com/repos/intrnl/haru/commits`

    let data = await request.get({
      url: changelogCurr,
      headers: { 'User-Agent': 'github:intrnl/haru' },
      json: true
    })
      .catch(err => { throw new Error(err) })

    var commits = data.slice(0, 5)

    const descriptionData = []

    commits.forEach(function (commit) {
      var commitHash = commit.sha.substring(0, 7)
      var commitMessage = truncateText(commit.commit.message.replace(/\r?\n|\r/g, ' '), 72)
      var commitURL = commit.html_url

      descriptionData.push(`\`${commitHash}\` [${commitMessage}](${commitURL})`)
    })

    const embed = {}
    embed.title = "intrnlbot's recent commits"
    embed.description = descriptionData.join('\n')
    embed.timestamp = commits[0].commit.author.date

    msg.channel.send({ embed })
  }
}

module.exports = commandChangelog

function truncateText (text, n) {
  return (text.length > n) ? text.substr(0, n - 1) + '\u2026' : text
}