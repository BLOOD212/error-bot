export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antimedia) return false

  // Immunità per Admin, Owner, Sam e il bot stesso
  if (m.fromMe || isAdmin || isOwner || isSam || !isBotAdmin) return false

  // Lascia passare i media "Visualizza una volta"
  if (
    m.message?.viewOnceMessage ||
    m.message?.viewOnceMessageV2 ||
    m.message?.viewOnceMessageV2Extension
  ) {
    return false
  }

  // Rileva Foto o Video normali
  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage
  if (!hasNormalMedia) return false

  // Eliminazione del payload multimediale non autorizzato
  await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

  // Generazione del log di violazione in stile ERROR⁴⁰⁴
  const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘌𝘋𝘐𝘈_𝘉𝘙𝘌𝘈𝘊𝘏 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘍𝘐𝘙𝘌𝘞𝘈𝘓𝘓_𝘈𝘊𝘛𝘐𝘝𝘌
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝘴𝘵: @${m.sender.split('@')[0]}
⎔ 𝘋𝘦𝘵𝘦𝘤𝘵_𝘗𝘬𝘵: 𝘗𝘌𝘙𝘔𝘈𝘕𝘌𝘕𝘛_𝘔𝘌𝘋𝘐𝘈
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘗𝘜𝘙𝘎𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘌𝘋
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: In questo nodo di rete sono autorizzati esclusivamente i pacchetti *𝘝𝘪𝘴𝘶𝘢𝘭𝘪𝘻𝘻𝘢_𝘶𝘯𝘢_𝘷𝘰𝘭𝘵𝘢*. I flussi di archiviazione permanenti vengono intercettati e distrutti dal firewall.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: '☠️ ERROR⁴⁰⁴ // MALWARE_INTERCEPT ☠️',
          body: 'Protocollo Antimedia: payload eliminato.',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1
        }
      }
    }).catch(() => {})

  return true
}
