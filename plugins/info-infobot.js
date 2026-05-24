import { cpus as _cpus } from 'os'
import speed from 'performance-now'

let handler = async (m, { conn, usedPrefix }) => {

  if (!global.db.data.settings) global.db.data.settings = {}
  if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {}

  let bot = global.db.data.settings[conn.user.jid]
  
  const status = (val) => val ? '✅' : '❌'
  
  const funzioni = [
    ['Anti-Privato', bot.antiprivato],
    ['Restrizioni', bot.restrict],
    ['Auto-Lettura', bot.autoread],
    ['Sub-Bots', bot.jadibotmd]
  ]

  const statoFunzioni = funzioni
    .map(([nome, val]) => `│ ${status(val)} ┋ ${nome}`)
    .join('\n')

  let _uptime = process.uptime() * 1000
  let uptime = formatUptime(_uptime)
  let totalreg = Object.keys(global.db.data.users || {}).length
  let totalStats = Object.values(global.db.data.stats || {}).reduce((total, stat) => total + (stat?.total || 0), 0)
  let totalf = Object.values(global.plugins || {}).filter((v) => v?.help && v?.tags).length

  let timestamp = speed()
  let latensi = speed() - timestamp
  let attivi = Object.values(global.plugins || {}).filter(p => !p?.disabled).length

  let pp
  try {
    pp = await conn.profilePictureUrl(conn.user.jid, 'image')
  } catch {
    pp = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'
  }

  let infoBot = `
┏━━━〔 *STATISTICHE SYSTEM* 〕━━━┓
┃
┃ 👤 *Creatore:* @${owner[0][0].split('@s.whatsapp.net')[0]}
┃ ⌨️ *Prefisso:* [ ${usedPrefix} ]
┃ 🧩 *Plugin:* ${attivi} / ${totalf}
┃ 🚀 *Velocità:* ${latensi.toFixed(4)} ms
┃ ⏱️ *Uptime:* ${uptime}
┃ 🔓 *Modalità:* ${bot.public ? 'Pubblica' : 'Privata'}
┃ 📊 *Comandi:* ${toNum(totalStats)}
┃ 👥 *Utenti:* ${toNum(totalreg)}
┃
┣━━━〔 *CONFIGURAZIONE* 〕━━━┓
┃
${statoFunzioni}
┃
┗━━━━━━━━━━━━━━━━━━━━┛`.trim()

  await conn.reply(m.chat, infoBot, m, {
    mentions: [owner[0][0] + '@s.whatsapp.net'],
    contextInfo: {
      externalAdReply: {
        title: 'S Y S T E M - I N F O',
        body: `Uptime: ${uptime}`,
        thumbnailUrl: pp,
        sourceUrl: null,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  })
}

handler.help = ['infobot']
handler.tags = ['info']
handler.command = ['infobot']

export default handler

function toNum(number) {
  if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'k'
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M'
  return number.toString()
}

function formatUptime(ms) {
  let s = Math.floor((ms / 1000) % 60)
  let m = Math.floor((ms / (1000 * 60)) % 60)
  let h = Math.floor((ms / (1000 * 60 * 60)) % 24)
  let d = Math.floor(ms / (1000 * 60 * 60 * 24))

  let res = []
  if (d > 0) res.push(`${d}g`)
  if (h > 0) res.push(`${h}h`)
  if (m > 0) res.push(`${m}m`)
  return res.join(' ') || '0s'
}
