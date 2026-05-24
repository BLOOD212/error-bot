let puliti = [];

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto';
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  if (msgID.startsWith('3EB0')) return 'android_old';
  return 'sconosciuto';
}

export async function before(m, { conn, isAdmin, isOwner, isSam }) {
  const chat = global.db.data.chats[m.chat];
  
  // Controllo attivazione Antibot
  if (!chat?.antiBot) return;
  if (!m.isGroup || !m.sender || !m.key?.id) return;
  
  // Gli admin, Blood e il bot stesso sono immuni
  if (isAdmin || isOwner || isSam || m.fromMe) return;

  const msgID = m.key?.id;
  const device = rilevaDispositivoCheck(msgID);
  const sospettiDispositivi = ['bot', 'web', 'webbot'];

  // Se il dispositivo non è tra quelli sospetti, esce
  if (!sospettiDispositivi.includes(device)) return;

  const metadata = await conn.groupMetadata(m.chat);
  const botNumber = conn.user.jid;
  const autorizzati = [botNumber, metadata.owner, ...puliti];

  // Se l'utente è in whitelist o è il fondatore, esce
  if (autorizzati.includes(m.sender)) return;

  // Esecuzione sanzione (Rimozione immediata della connessione host)
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  // Generazione del log di quarantena in stile ERROR⁴⁰⁴
  const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘉𝘖𝘛_𝘐𝘕𝘛𝘙𝘜𝘚𝘐𝘖𝘕 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘗𝘜𝘙𝘎𝘗_𝘗𝘙𝘖𝘛𝘖𝘊𝘖𝘓
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${m.sender.split('@')[0]}
⎔ 𝘋𝘦𝘵𝘦𝘤𝘵_𝘚𝘪𝘨: ${device.toUpperCase()}
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘛𝘌𝘙𝘔𝘐𝘕𝘈𝘛𝘌_𝘕𝘖𝘋𝘌
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Rilevato script esterno o sessione Web non autorizzata. Il firewall ha rimosso l'istanza malevola per prevenire attacchi flood o clonazione del database.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: '☠️ ERROR⁴⁰⁴ // UNAUTHORIZED_AGENT ☠️',
        body: 'Rilevamento ed estromissione bot attivi.',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
}
