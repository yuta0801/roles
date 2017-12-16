require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', message => {
  const [cmd, subcmd, ...params] = message.content.split(' ')
  if (!['/roles', '/role', '/役割'].includes(cmd)) return
  const roles = message.guild.roles
  const pos = roles.find('name', client.user.username).position
  const canAddRoles = roles.filterArray(role => {
    return role.position < pos && role.position !== 0
  })
  if (['list', 'all', '一覧'].includes(subcmd)) {
    if (canAddRoles.length < 1) message.reply('追加できる役割はありません')
    else message.reply(`追加可能な役割一覧\n${names(canAddRoles)}`)
  } else if (['add', 'set', '追加'].includes(subcmd)) {
    const addRoles = []
    const error = []
    params.forEach(param => {
      const role = canAddRoles.find(role => role.name === param)
      if (!role) error.push(param)
      else if (!message.member.roles.has(role.id)) addRoles.push(role)
    })
    message.member.addRoles(addRoles, 'by roles bot')
      .catch(error => console.log(error))
    let done = ''
    if (addRoles.length) done += `役割(${names(addRoles)})を追加しました\n`
    if (error.length) done += `役割、${names(error)}が見つかりませんでした\n`
    message.reply(done)
  } else {
    message.reply(subcmd + ' : コマンドが見つかりませんでした')
  }
})

client.login(process.env.TOKEN)

function names(roles) {
  if (typeof roles === 'object') roles = roles.map(e => e.name)
  return `\`${roles.join('`, `')}\``
}
