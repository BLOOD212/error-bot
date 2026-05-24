import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  if (conn.user.jid !== conn.user.jid) return 

  try {
    await m.react('⏳')

    execSync('git fetch')
    let status = execSync('git status -uno', { encoding: 'utf-8' })

    if (status.includes('Your branch is up to date') || status.includes('nothing to commit')) {
      await conn.reply(m.chat, 'ョ ── 𝘚𝘠𝘚𝘛𝘌𝘔_𝘊𝘏𝘌𝘊𝘒 𪚥\n\n» *𝘚𝘺𝘴_𝘓𝘰𝘨:* Nessuna patch rilevata. Il server è già all\'ultimo blocco di codice.', m)
      await m.react('✅')
      return
    }

    // Reset locale ed esecuzione del pull con statistiche
    let updateOutput = execSync('git reset --hard && git pull --stat' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })

    // Estrazione dei file modificati
    let fileDetails = parseGitFileDetails(updateOutput)

    let reportFiles = fileDetails.map((f, i) => {
      return `    ⤿ [𝘗𝘈𝘊𝘒𝘌𝘛_${i + 1}] 𝘚𝘺𝘴_*${f.name}*\n    ☣️ _𝘐𝘯𝘫𝘦𝘤𝘵𝘪𝘰𝘯_𝘐𝘯𝘧𝘰_\n    ↳ 𝘐𝘯𝘴_𝘉𝘺𝘵𝘦𝘴: +${f.ins} 🩸 | 𝘋放𝘭_𝘉y𝘵𝘦𝘴: -${f.del} 🛑\n╳`
    }).join('\n')

    let message = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘜𝘗𝘋𝘈𝘛𝘌 ☠️
───────────────────────
» 𝘊𝘖𝘋𝘌_𝘐𝘕𝘑𝘌𝘊𝘛𝘐𝘖𝘕_𝘚𝘜𝘊𝘊𝘌𝘚𝘚𝘍𝘜𝘓...

${reportFiles}
───────────────────────
͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

    await conn.reply(m.chat, message, m)
    await m.react('💥')

  } catch (err) {
    await conn.reply(m.chat, `❌ *𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙map_𝘉𝘙𝘌𝘈𝘊𝘏*:\n\n> 𝘚𝘺𝘴_𝘙𝘦𝘴𝘱𝘰𝘯𝘴𝘦: ${err.message}`, m)
    await m.react('❌')
  }
}

// Funzione per estrarre i dettagli di ogni singolo file modificato
function parseGitFileDetails(output) {
  const lines = output.split('\n')
  const files = []

  // Git pull --stat genera righe tipo:  path/to/file.js | 10 +--
  const fileLineRegex = /^\s+(.+)\s+\|\s+(\d+)\s+(.+)$/

  for (let line of lines) {
    let match = line.match(fileLineRegex)
    if (match) {
      let name = match[1].trim()
      let totalChanges = match[2]
      let plusMinus = match[3]

      let ins = (plusMinus.match(/\+/g) || []).length
      let del = (plusMinus.match(/-/g) || []).length

      files.push({ name, ins, del })
    }
  }
  return files
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = ['aggiorna', 'update', 'aggiornabot']

export default handler
