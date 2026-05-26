import { promises as fs } from 'fs'
import { join } from 'path'

const menuImages = [
  './menu-1.jpeg',
  './menu-2.jpeg',
  './menu-3.jpeg'
]

const defaultMenu = {
  before: `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝗚 𝗥 𝗢 𝗨 𝗣 ☠️
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: %mention
⎔ 𝘗𝘳𝘪𝘷𝘪𝘭𝘦𝘨𝘦𝘴: %role
⎔ 𝘚𝘦𝘤_𝘚𝘵𝘢𝘵𝘶𝘴: %prems
───────────────────────

» 𝘈𝘊𝘊𝘌𝘚𝘚𝘖 𝘗𝘈𝘕𝘌𝘓𝘓𝘖 𝘎𝘙𝘖𝘜𝘗_𝘊𝘖𝘕𝘛𝘙𝘖𝘓...
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ 👥 %cmd ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰𝘺 𝘵𝘩𝘦 𝘤𝘩𝘢𝘰𝘴._`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let mention = `@${m.sender.split('@')[0]}`
    let user = global.db.data.users[m.sender] || {}
    let { role = 'Utente' } = user
    let prems = user.premiumTime > 0 ? '𝘗𝘳𝘦𝘮𝘪𝘶𝘮' : '𝘚𝘵𝘢𝘯𝘥𝘢𝘳𝘥'
    let tags = { 'gruppo': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝘈𝘋𝘔𝘐𝘕' }

    let help = Object.values(global.plugins)
      .filter(p => !p.disabled && p.tags && p.tags.includes('gruppo'))
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        prefix: 'customPrefix' in p,
      }))

    let _text = [
      defaultMenu.before.replace(/%mention/g, mention),
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.map(menu => menu.help.map(cmd => 
            defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
          ).join('\n')),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    await m.react('💥')

    let randomImg = menuImages[Math.floor(Math.random() * menuImages.length)]
    let imageBuffer = null
    try {
      imageBuffer = await fs.readFile(randomImg)
    } catch (e) {
      for (let img of menuImages) {
        try { imageBuffer = await fs.readFile(img); break } catch (err) {}
      }
    }

    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: _text.trim(),
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
    conn.reply(m.chat, '❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: Impossibile iniettare il pannello di controllo gruppo.', m)
  }
}

handler.help = ['menugruppo']
handler.tags = ['menu']
handler.command = ['menugruppo', 'menugp', 'menuadmin']

export default handler
