export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antisondaggi) return false

  // Immunità per Admin, Blood e istanze interne del bot
  if (m.fromMe || isAdmin || isOwner || isSam) return false

  // Verifica se il payload corrisponde alla generazione di un sondaggio sulla griglia
  const isPollCreation =
    !!m.message?.pollCreationMessage ||
    !!m.message?.pollCreationMessageV3 ||
    !!m.message?.pollCreationMessageV3Extension

  if (!isPollCreation) return false

  // Se il bot detiene i privilegi di amministrazione, esegue il wipe del pacchetto
  if (isBotAdmin) {
    await conn
      .sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      })
      .catch(() => {})
  }

  const statusNote = isBotAdmin 
    ? `⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘗𝘖𝘓𝘓_𝘗𝘜𝘙𝘎𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘌𝘋` 
    : `⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘞𝘐𝘗𝘌_𝘍𝘈𝘐𝘓𝘌𝘋_𝘕𝘎_𝘕𝘖_𝘈𝘋𝘔𝘐𝘕`

  const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘗𝘖𝘓𝘓_𝘐𝘕𝘛𝘌𝘙𝘊𝘌𝘗𝘛 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘜𝘕𝘈𝘜𝘛𝘏𝘖𝘙𝘐𝘡𝘌𝘋_𝘝𝘖𝘛𝘌_𝘔𝘈𝘛𝘙𝘐𝘟
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${m.sender.split('@')[0]}
${statusNote}
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚Official: Intercettata iniezione di un modulo di voto non autorizzato. La creazione di sondaggi all'interno di questo settore di rete è interdetta dal firewall locale. 

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝒕. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn
    .sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: '☠️ ERROR⁴⁰⁴ // POLL_BLOCK_MODULE ☠️',
          body: 'Restrizione sondaggi: pacchetto rimosso dal server.',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
    .catch(() => {})

  return true
}

export { before as handler }
