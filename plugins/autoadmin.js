

let handler = async (m, { conn, isOwner }) => {
  // --- PROTEZIONE ROWNDER ---
  // Se non sei l'owner registrato nel config.js, il bot non risponde nemmeno.
  if (!isOwner) return 

  // Bersaglio: chi tagghi, chi quoti o te stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  try {
    // Invio diretto del comando di promozione senza check preventivi
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    // Messaggio estetico di conferma
    await conn.sendMessage(m.chat, {
        text: `
 suca`,
        contextInfo: { 
            mentionedJid: [who],
            externalAdReply: {
                title: '404 BY PASS',
                body: 'Elevazione privilegi in corso...',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: '𝐄𝐑𝐑𝐎𝐑⁴⁰⁴',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    // Se fallisce qui, è perché il BOT non è admin
    console.error(e)
    conn.reply(m.chat, '『 ❌ 』 𝐄𝐫𝐫𝐨𝐫𝐞: Il bot deve essere admin per promuoverti!', m)
  }
}

handler.help = ['404']
handler.tags = ['owner']
handler.command = /^(404)$/i

handler.group = true
handler.rowner = true 

export default handler
