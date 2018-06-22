const { Command } = require('discord.js-commando')

class command8Ball extends Command {
  constructor (client) {
    super(client, {
      name: '8ball',
      group: 'fun',
      memberName: '8ball',
      description: 'Ask the magic 8 ball a question',
      examples: [
        '8ball Is this real life?'
      ],
      args: [
        {
          key: 'question',
          prompt: 'What question would you like to ask to the magic 8 ball?',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, { question }) {
    let answers = [
      'It is certain',
      'It is decidedly so',
      'Without a doubt',
      'Yes definitely',
      'You may rely on it',
      'You can count on it',
      'As I see it, yes',
      'Most likely',
      'Outlook good',
      'Yes',
      'Signs point to yes',
      'Absolutely',
      'Reply hazy try again',
      'Ask again later',
      'Better not tell you now',
      'Cannot predict now',
      'Concentrate and ask again',
      "Don't count on it",
      'My reply is no',
      'My sources say no',
      'Outlook not so good',
      'Very doubtful',
      'Chances aren\'t good'
    ]

    let chosen = answers[Math.floor(Math.random() * answers.length)]
    msg.channel.send(`${chosen}, ${msg.author.username}`)
  }
}

module.exports = command8Ball
