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
  const myrole = roles.find('name', client.user.username)
  if (!myrole) return message.reply('権限が見つかりませんでした')
  const pos = myrole.position
  const hasRoles = message.member.roles
  const canAddRoles = roles.filterArray(role => {
    return role.position < pos && role.position !== 0
  })
  if (['list', 'all', '一覧'].includes(subcmd)) {
    if (canAddRoles.length < 1) message.reply('追加できる役割はありません')
    else message.reply(`追加可能な役割一覧\n${names(canAddRoles)}`)
  } else if (['add', 'set', '追加'].includes(subcmd)) {
    const addRoles = []
    const notFound = []
    const cantAdd = []
    params.forEach(param => {
      const role = roles.find(role => role.name === param)
      if (role) {
        const canAdd = canAddRoles.has(role.id)
        if (!canAdd) cantAdd.push(role)
        else if (!hasRoles.has(role.id)) addRoles.push(role)
      } else notFound.push(param)
    })
    message.member.addRoles(addRoles, 'by roles bot')
      .catch(error => console.log(error))
    let done = ''
    if (addRoles.length) done += log(addRoles, 'を追加しました')
    if (notFound.length) done += log(notFound, 'が見つかりませんでした')
    message.reply(done)
  } else if (['remove', 'delete', '削除'].includes(subcmd)) {
    const removeRoles = []
    const notFound = []
    const cantRemove = []
    params.forEach(param => {
      const role = hasRoles.find(role => role.name === param)
      if (role) {
        const canRemove = canAddRoles.has(role.id)
        if (!canRemove) cantRemove.push(role)
        else if (hasRoles.has(role.id)) removeRoles.push(role)
      } else notFound.push(param)
    })
    message.member.removeRoles(removeRoles, 'by roles bot')
      .catch(error => console.log(error))
    let done = ''
    if (removeRoles.length) done += log(removeRoles, 'を削除しました')
    if (notFound.length) done += log(notFound, 'が見つかりませんでした')
    if (cantRemove.length) done += log(cantRemove, 'が削除できませんでした')
    message.reply(done)
  } else {
    message.reply(subcmd + ' : コマンドが見つかりませんでした')
  }
})

client.login(process.env.TOKEN)

function names(roles) {
  if (!Array.isArray(roles)) roles = roles.map(e => e.name)
  return `\`${roles.join('`, `')}\``
}

function log(roles, msg) {
  return `役割、${names(roles)} ${msg}\n`
}
