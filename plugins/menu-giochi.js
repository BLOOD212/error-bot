import { promises as fs } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'

// Configurazione immagini random (tutte .jpeg)
const menuImages = [
  './menu-1.jpeg',
  './menu-2.jpeg',
  './menu-3.jpeg'
]

const defaultMenu = {
  before: `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘎𝘈𝘔𝘌𝘚 ☠️
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: %name
⎔ 𝘚𝘺𝘴_𝘓𝘝𝘓: %level
⎔ 𝘊𝘳𝘦𝘥𝘪𝘵𝘴: %eris
⎔ 𝘗𝘳𝘪𝘷𝘪𝘭𝘦𝘨𝘦𝘴: %role
───────────────────────

» 𝘈𝘕𝘖𝘔𝘈𝘓𝘐𝘈_𝘎𝘈𝘔𝘌𝘚 𝘈𝘝𝘝𝘐𝘈𝘛𝘈...
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ 🕹️ %cmd %islimit%isPremium ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝘦 𝘤𝘩𝘢𝘰𝘴._`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = { 'giochi': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝘎𝘈𝘔𝘌𝘚' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    // Dati Utente
    let user = global.db.data.users[m.sender] || {}
    let { exp = 0, level = 1, role = 'Utente', eris = 0, limit = 10 } = user
    let name = await conn.getName(m.sender)
    let uptime = clockString(process.uptime() * 1000)

    // Filtro Plugin
    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium
      }))

    let groups = {}
    for (let tag in tags) {
      groups[tag] = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0])
    }

    // Costruzione Testo
    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' +
          [
            ...groups[tag].map(menu =>
              menu.help.map(cmd => defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? ' ⚠️' : '')
                .replace(/%isPremium/g, menu.premium ? ' 💎' : '')
                .trimEnd()
              ).join('\n')
            ),
            defaultMenu.footer
          ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%', p: _p, eris, name, level, limit, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // Estrazione random dell'immagine dalle 3 rinfrescate (.jpeg)
    let randomImg = menuImages[Math.floor(Math.random() * menuImages.length)]
    let imageBuffer = null
    
    try {
      imageBuffer = await fs.readFile(randomImg)
    } catch (e) {
      console.log(`⚠️ Errore nel caricamento di ${randomImg}, provo un'alternativa...`)
      for (let img of menuImages) {
        try {
          imageBuffer = await fs.readFile(img)
          break
        } catch (err) {}
      }
    }

    // Invio finale con l'immagine random caricata in Buffer
    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('💥')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: Impossibile generare l'interfaccia di gioco.`, m)
  }
}

handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, 'h ', m, 'm ', s, 's'].map(v => v.toString().padStart(2, '0')).join('')
}
