import { promises as fs } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// Configurazione immagini random (tutte .jpeg)
const menuImages = [
  './menu-1.jpeg',
  './menu-2.jpeg',
  './menu-3.jpeg'
]

const defaultMenu = {
  before: `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘎𝘙𝘖𝘜𝘗 ☠️
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: %name
⎔ 𝘗𝘳𝘪𝘷𝘪𝘭𝘦𝘨𝘦𝘴: %role
⎔ 𝘚𝘦𝘤_𝘚𝘵𝘢𝘵𝘶𝘴: %prems
───────────────────────

» 𝘈𝘕block_𝘎𝘙𝘖𝘜𝘗_𝘊𝘖𝘕𝘛𝘙𝘖𝘓...
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ 👥 %cmd ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'gruppo': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝘈𝘋𝘔𝘐𝘕'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let d = new Date(new Date().getTime() + 3600000)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender] || {}
    let { level, role = 'Utente' } = user
    let prems = user.premiumTime > 0 ? '𝘗𝘳𝘦𝘮𝘪𝘶𝘮' : '𝘚𝘵𝘢𝘯𝘥𝘢𝘳𝘥'

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, level, role, prems, uptime,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('💥')

    // Estrazione random dell'immagine .jpeg
    let randomImg = menuImages[Math.floor(Math.random() * menuImages.length)]
    let imageBuffer = null
    
    try {
      imageBuffer = await fs.readFile(randomImg)
    } catch (e) {
      console.log(`⚠️ Immagine ${randomImg} non trovata, tento il recupero...`)
      for (let img of menuImages) {
        try {
          imageBuffer = await fs.readFile(img)
          break
        } catch (err) {}
      }
    }

    // Invio finale con i dati del canale modificati nel contesto a tema Error
    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "☠️ ᴇʀʀᴏʀ⁴⁰⁴ // ʙʟᴅ ɢʀᴏᴜᴘ ᴄᴏɴᴛʀᴏʟ ☠️"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: Impossibile iniettare il pannello di controllo gruppo.`, m)
  }
}

handler.help = ['menugruppo']
handler.tags = ['menu']
handler.command = ['menugruppo', 'menugp', 'menuadmin']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
