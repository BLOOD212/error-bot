let handler = m => m;

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  // Monitora: Cambio nome (21), Rimozione (28), Promozione (29), Retrocessione (30)
  if (![21, 28, 29, 30].includes(m.messageStubType)) return;

  const sender = m.key?.participant || m.participant || m.sender;
  if (!sender) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // --- PROTEZIONE OWNER DEL BOT ---
  const BOT_OWNERS = global.owner
    .filter(o => o[0])
    .map(o => o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

  const localWhitelist = chat.whitelist || [];

  let ownerGroup = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    ownerGroup = metadata.owner || metadata.subjectOwner;
  } catch {
    ownerGroup = null;
  }

  // LISTA AUTORIZZATI (Bot, Proprietari del Bot, Whitelist, Creatore Gruppo)
  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...localWhitelist, 
    ownerGroup
  ].filter(Boolean);

  // Se l'azione è compiuta da un utente root o autorizzato, l'istanza si arresta
  if (allowed.includes(sender)) return;

  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (affected === sender) return;
  }

  const senderData = participants.find(p => p.jid === sender);
  if (!senderData?.admin) return;

  // FILTRO: Isola tutti gli amministratori non identificati come root owner
  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length && m.messageStubType !== 21) return;

  // Esecuzione demote di massa per revocare i privilegi di scraping/wipe
  if (usersToDemote.length) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  // Chiusura immediata dei canali di input (Sola lettura per gli utenti)
  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 21 ? '𝘊𝘈𝘔𝘉𝘐𝘖_𝘕𝘖𝘔𝘌_𝘕𝘖𝘋𝘖' :
    m.messageStubType === 28 ? '𝘌𝘚𝘗𝘜𝘓𝘚𝘐𝘖𝘕𝘌_𝘔𝘌𝘔𝘉𝘙𝘖' :
    m.messageStubType === 29 ? '𝘗𝘙𝘖𝘔𝘖𝘡𝘐𝘖𝘕𝘌_𝘈𝘋𝘔𝘐𝘕_𝘐𝘓𝘓𝘌𝘎𝘐𝘛𝘛𝘐𝘔𝘈' :
    '𝘙𝘌𝘛𝘙𝘖𝘊𝘌𝘚𝘚𝘐𝘖𝘕𝘌_𝘈𝘋𝘔𝘐𝘕';

  const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘙𝘈𝘐𝘋_𝘓𝘖𝘊𝘒𝘋𝘖𝘞𝘕 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘊𝘙𝘐𝘛𝘐𝘊𝘈𝘓_𝘉𝘙𝘌𝘈𝘊𝘏_𝘋𝘌𝘛𝘌𝘊𝘛𝘌𝘋
⎔ 𝘈𝘵𝘵𝘢𝘤𝘬_𝘚𝘪𝘨: ${action}
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${sender.split('@')[0]}
───────────────────────

» 𝘓𝘖𝘎_𝘚𝘈𝘕𝘡𝘐𝘖𝘕𝘐_𝘈𝘗𝘗𝘓𝘐𝘊𝘈𝘛𝘌:
☠️ 𝘚𝘺𝘴_𝘈𝘥𝘮𝘪𝘯_𝘙𝘦𝘷𝘰𝘬𝘦𝘥: Tutti i privilegi amministrativi non inclusi nella root-whitelist sono stati terminati.
☠️ 𝘎𝘳𝘪𝘥_𝘓𝘰𝘤𝘬: Canali di input del gruppo configurati in sola lettura (*𝘈𝘯𝘯𝘰𝘶𝘯𝘤𝘦𝘮𝘦𝘯𝘵_𝘔𝘰𝘥𝘦*).
☠️ 𝘚𝘺𝘴_𝘙𝘰𝘰𝘵_𝘈𝘭𝘦𝘳𝘵: I proprietari del server centrale sono stati notificati della minaccia.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [sender, ...usersToDemote, ...BOT_OWNERS].filter(Boolean),
      externalAdReply: {
        title: '☠️ ERROR⁴⁰⁴ // ANTINUKE_CORE_SECTOR ☠️',
        body: 'Protocollo di isolamento minacce interne attivo.',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        sourceUrl: '𝘌𝘙𝘙𝘖𝘙⁴⁰⁴_𝘈𝘕𝘛𝘐𝘕𝘜𝘒𝘌',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  });
};

export default handler;
