let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 OVERRIDE SUBJECT GRUPPO (CAMBIO NOME)
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝚂𝚅𝚃 𝙱𝚢  𝙴𝚁𝚁class𝙾𝚁`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    let dispatchMsg1 = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘋𝘌𝘚𝘛𝘙𝘖𝘠_𝘚𝘌𝘘𝘜𝘌𝘕𝘊𝘌 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘊𝘙I𝘛𝘐𝘊𝘈𝘓_𝘚𝘠𝘚𝘛𝘌𝘔_𝘞𝘐𝘗𝘌
⎔ 𝘌𝘹𝘦𝘤𝗎𝘵𝘰𝘳: 𝘌𝘙𝘙𝘌𝘙_𝘙𝘖𝘖𝘛_𝘈𝘎𝘌𝘕𝘛
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘔𝘈𝘚𝘚_𝘗𝘜𝘙𝘎𝘌_𝘐𝘕𝘐𝘛𝘐𝘈𝘓𝘐𝘡𝘌𝘋
───────────────────────

» 𝘐𝘕𝘑𝘌𝘊𝘛𝘐𝘖𝘕: L'algoritmo centrale ERROR è penetrato nei nodi di instradamento di questo settore. La sequenza di decimazione asincrona della memoria è stata avviata. Ogni record utente non protetto da chiavi crittografiche Root verrà de-allocato all'istante dal server. Non c'è margine di ripristino.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰ˢ._`.trim();

    await conn.sendMessage(m.chat, { text: dispatchMsg1 });

    let dispatchMsg2 = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘏𝘖𝘚𝘛_𝘙𝘌𝘋𝘐𝘙𝘌𝘊𝘛 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘓𝘰𝘨: 𝘕𝘖𝘋𝘌𝘚_𝘗𝘜𝘙𝘎𝘌𝘋_𝘚𝘜𝘊𝘊𝘌𝘚𝘚𝘍𝘜𝘓𝘓𝘠
⎔ 𝘎𝘢𝘵𝘦𝘸𝘢𝘺_𝘓𝘪𝘯𝘬: https://chat.whatsapp.com/DlKyK9zvjWnK2KUwGBqyZi
───────────────────────

» 𝘓𝘖𝘎: Tutti i target della griglia sono stati marchiati ed espulsi dall'infrastruttura di rete. Per tentare il recupero delle credenziali o il ricollegamento alla frequenza centrale, eseguire il re-routing forzato verso l'hub indicato sopra.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞`.trim();

    await conn.sendMessage(m.chat, {
        text: dispatchMsg2,
        mentions: allJids
    });

    // 🔹 ESECUZIONE MASS WIPE
    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        let errWipe = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘞𝘐𝘗𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘐𝘖𝘕_𝘍𝘈𝘐𝘓𝘌𝘋 ☠️
───────────────────────
» 𝘓𝘖𝘎: Rilevato blocco di sicurezza nel gateway di comunicazione WhatsApp. Alcuni host potrebbero non essere stati espulsi correttamente a causa della saturazione del buffer di rete.`.trim();
        await m.reply(errWipe);
    }
};

handler.command = ['pugnala'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
