let handler = async (m, { conn }) => {
  const stats = global.db.data.stats || {}
  const users = global.db.data.users || {}
  const chats = global.db.data.chats || {}

  const totalCommands = Object.values(stats).reduce((a, s) => a + (s.total || 0), 0)
  const totalSuccess  = Object.values(stats).reduce((a, s) => a + (s.success || 0), 0)
  const totalUsers    = Object.keys(users).length
  const totalGroups   = Object.keys(chats).filter(k => k.endsWith('@g.us')).length
  const totalPlugins  = Object.keys(global.plugins || {}).length
  const activePlugins = Object.values(global.plugins || {}).filter(p => !p.disabled).length

  const topPlugins = Object.entries(stats)
    .sort(([,a], [,b]) => (b.total || 0) - (a.total || 0))
    .slice(0, 5)
    .map(([name, s], i) => `*${i + 1}.* ${name.split('/').pop().replace('.js', '')} ⮕ ${s.total}`).join('\n')

  const topUsers = Object.entries(users)
    .sort(([,a], [,b]) => (b.comandiEseguiti || 0) - (a.comandiEseguiti || 0))
    .slice(0, 5)
    .map(([jid, u], i) => `*${i + 1}.* +${jid.split('@')[0]} ⮕ ${u.comandiEseguiti || 0}`).join('\n')

  const uptime = process.uptime()
  const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
  const memMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1)

  const caption = `╭─── 〔 📊 𝐈𝐍𝐅𝐎𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒 〕 ───
│
│ ⏱️ *Uptime:* ${uptimeStr}
│ 🧠 *RAM:* ${memMB} MB
│ 👥 *Utenti:* ${totalUsers}
│ 💬 *Gruppi:* ${totalGroups}
│ 🔌 *Plugin:* ${activePlugins}/${totalPlugins}
│
│ ⚡ *Comandi totali:* ${totalCommands}
│ ✅ *Successi:* ${totalSuccess}
│ ❌ *Errori:* ${totalCommands - totalSuccess}
│
╰───────────────

╭─── 〔 🏆 𝐓𝐎𝐏 𝟓 𝐏𝐋𝐔𝐆𝐈𝐍 〕 ───
│ ${topPlugins || 'Nessun dato'}
╰───────────────

╭─── 〔 👑 𝐓𝐎𝐏 𝟓 𝐔𝐓𝐄𝐍𝐓𝐈 〕 ───
│ ${topUsers || 'Nessun dato'}
╰───────────────`

  await m.reply(caption)
}

handler.command = /^infobot$/i
handler.rowner = true
export default handler
