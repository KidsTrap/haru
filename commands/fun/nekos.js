const { Command } = require('discord.js-commando')
const request = require('request-promise-native')

class commandNekos extends Command {
  constructor (client) {
    super(client, {
      name: 'nekos',
      group: 'fun',
      memberName: 'nekos',
      description: 'Shows reaction images from nekos.life API',
      details: 'List of reaction images that you can use are provided below.\n`cuddle` `feed` `foxgirl` `holo` `hug` `kemonomimi` `kiss` `meow` `neko` `pat` `poke` `slap` `tickle`',
      examples: [
        'nekos',
        'nekos slap',
        'nekos feed'
      ],
      args: [
        {
          key: 'reaction',
          prompt: 'What kind of reaction would you want? `List is provided on help page.`',
          type: 'string',
          validate: text => {
            const availSource = ['cuddle', 'feed', 'foxgirl', 'holo', 'hug', 'kemonomimi', 'kiss', 'meow', 'neko', 'pat', 'poke', 'slap', 'tickle']

            if (availSource.indexOf(text.toLowerCase()) > -1) return true
            return 'Incorrect reaction type, head to the help page for list of reactions.'
          }
        }
      ]
    })
  }

  async run (msg, { reaction }) {
    const requestURL = 'https://nekos.life/api/v2/img/'
    let requestConstructedURL = requestURL + reaction

    let data = await request.get({
      url: requestConstructedURL,
      headers: { 'User-Agent': 'github:intrnl/haru' },
      json: true
    })
      .catch(err => { throw new Error(err) })

    const embed = {
      image: {},
      footer: {}
    }

    embed.footer.text = `Powered by nekos.life`
    embed.image.url = data.url

    msg.channel.send({ embed })
  }
}

module.exports = commandNekos
