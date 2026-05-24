let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    if (who == conn.user.jid) return;
    if (!(who in global.db.data.users)) return conn.reply(m.chat, '『 ㌌ 』- \`Non sei nel mio database.\`', m);
    
    let user = global.db.data.users[who];
    const formatNumber = (num) => num.toLocaleString('it-IT');
    const highestBalance = user.highestBalance || user.euro;
    const rank = getRank(user.euro);
    const nextRank = getNextRank(user.euro);
    const totalBalance = user.euro + (user.bank || 0);

    let messaggio = `
╔══════════════════╗
      *🏦 PORTAFOGLIO*
╚══════════════════╝

  👤 *UTENTE:* @${who.split('@')[0]}
  ${rank.emoji} *RANK:* ${rank.name}

  ┏━━━━━━━━━━━━━━━━━━┓
  ┃      *BILANCIO*
  ┗━━━━━━━━━━━━━━━━━━┛
  💵 *Contanti:* \`${formatNumber(user.euro)} €\`
  🏛️ *Banca:* \`${formatNumber(user.bank || 0)} €\`
  💳 *Totale:* \`[ ${formatNumber(totalBalance)} € ]\`

  ┏━━━━━━━━━━━━━━━━━━┓
  ┃    *STATISTICHE*
  ┗━━━━━━━━━━━━━━━━━━┛
  🏆 *Record:* \`${formatNumber(highestBalance)} €\`
  🎯 *Target:* ${nextRank.emoji} ${nextRank.name}
  🚧 *Mancano:* \`${formatNumber(Math.max(0, nextRank.required - user.euro))} €\`

  *–––––––––––––––––––––––––*
  _Usa ${usedPrefix}casino per spendere o vedi il menu per le funzioni_`.trim();

    await m.reply(messaggio, null, { mentions: [who] });
};

function getRank(euro) {
    if (euro >= 100000) return { name: '*CEO*', emoji: '💼' };
    if (euro >= 50000) return { name: '*INVESTITORE*', emoji: '📈' };
    if (euro >= 25000) return { name: '*AVVOCATO*', emoji: '⚖️' };
    if (euro >= 10000) return { name: '*INGEGNERE*', emoji: '🛠️' };
    if (euro >= 5000) return { name: '*COMMESSO*', emoji: '🛍️' };
    return { name: '*TIROCINANTE*', emoji: '🧑‍💼' };
}

function getNextRank(euro) {
    if (euro >= 100000) return { name: '*LIVELLO MAX*', emoji: '👑', required: 0 };
    if (euro >= 50000) return { name: 'CEO', emoji: '💼', required: 100000 };
    if (euro >= 25000) return { name: 'INVESTITORE', emoji: '📈', required: 50000 };
    if (euro >= 10000) return { name: 'AVVOCATO', emoji: '⚖️', required: 25000 };
    if (euro >= 5000) return { name: 'INGEGNERE', emoji: '🛠️', required: 10000 };
    return { name: 'COMMESSO', emoji: '🛍️', required: 5000 };
}

handler.help = ['portafoglio'];
handler.tags = ['euro'];
handler.command = ['wallet', 'portafoglio', 'bilancio'];
handler.register = false;
export default handler;
