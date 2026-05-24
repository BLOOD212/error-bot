import crypto from 'crypto';

const uzer = new Map();
let lastCleanup = 0;
const handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return;
    const chat = global.db.data.chats[m.chat] || {};

    // Filtri di esclusione di sicurezza
    if (!chat.antispam || chat.modoadmin || isOwner || isSam || isAdmin || !isBotAdmin) return;
    if (m.message?.viewOnceMessage) return;
    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage'].includes(m.mtype)) return;

    const msgTimestamp = (m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now());
    if (Date.now() - msgTimestamp > 10000) return; 

    const sender = m.sender;
    let decodedSender = conn.decodeJid(sender);
    if (decodedSender.endsWith('@lid')) return;

    const config = {
        timeWindow: 10000,      // Finestra di rilevamento: 10 secondi
        removeThreshold: 10,    // Massimo messaggi consentiti
        timeThreshold: 1500,    // Soglia media millisecondi tra messaggi
        cleanupInterval: 300000 // Svuotamento cache: 5 minuti
    };

    const now = Date.now();
    if (now - lastCleanup > config.cleanupInterval) {
        cleanupOldData(config.cleanupInterval);
        lastCleanup = now;
    }

    let userData = uzer.get(decodedSender);
    if (!userData) {
        userData = { timestamps: [], messages: [] };
        uzer.set(decodedSender, userData);
    }

    const messageContent = getMessageContent(m);
    if (['unknown_message_type', 'error_parsing_message'].includes(messageContent)) return;

    const contentHash = crypto.createHash('md5').update(messageContent).digest('hex');

    userData.timestamps.push(msgTimestamp);
    userData.messages.push({ time: msgTimestamp, hash: contentHash });

    // Pulizia log obsoleti nello stack volatile dell'host
    userData.timestamps = userData.timestamps.filter(t => now - t < config.timeWindow);
    userData.messages = userData.messages.filter(msg => now - msg.time < config.timeWindow);

    const duplicateCount = userData.messages.filter(msg => 
        msg.hash === contentHash && msg.time !== msgTimestamp
    ).length;

    let effectiveThreshold = config.removeThreshold;
    if (duplicateCount > 0) {
        effectiveThreshold = Math.max(5, config.removeThreshold - (duplicateCount * 2));
    }

    const messageCount = userData.timestamps.length;

    if (messageCount >= effectiveThreshold) {
        userData.timestamps.sort((a, b) => a - b);
        const totalDuration = userData.timestamps[userData.timestamps.length - 1] - userData.timestamps[0];
        const averageTime = (userData.timestamps.length > 1) ? (totalDuration / (userData.timestamps.length - 1)) : 10000;

        if (averageTime < config.timeThreshold || duplicateCount >= 4) {
            try {
                uzer.delete(decodedSender);
                const typeSanz = duplicateCount >= 4 ? `𝘚𝘗𝘈𝘔_𝘋𝘜𝘗𝘓𝘐𝘊𝘈𝘛𝘐_(${duplicateCount + 1}𝘹)` : `𝘍𝘓𝘖𝘛_𝘍𝘓𝘖𝘖𝘋_𝘋𝘌𝘛𝘌𝘊𝘛𝘌𝘋_(${averageTime.toFixed(0)}𝘮𝘴)`;

                const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘈𝘕𝘛𝘐𝘚𝘗𝘈𝘔_𝘖𝘝𝘓_𝘓𝘖𝘊𝘒 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘉𝘜𝘍𝘍𝘌𝘙_𝘖𝘝𝘌𝘙𝘍𝘓𝘖𝘞_𝘓𝘐𝘔𝘐𝘛
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${decodedSender.split('@')[0]}
⎔ 𝘗𝘬𝒕_𝘚𝘪𝘨𝘯𝘢𝘭: ${typeSanz}
⎔ 𝘚𝘺𝘴_A𝘤𝘵𝘪𝘰𝘯: 𝘏𝘖𝘚𝘛_𝘗𝘜𝘙𝘎𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘌𝘋
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Rilevato flooding massivo o saturazione di pacchetti duplicati sulla frequenza del gruppo. L'invio continuo di flussi dati destabilizza la memoria del nodo. Il firewall ha disconnesso forzatamente l'host infetto.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝒕. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰ˢ._`.trim();

                await conn.sendMessage(m.chat, {
                    text,
                    mentions: [decodedSender],
                    contextInfo: {
                        externalAdReply: {
                            title: '☠️ ERROR⁴⁰⁴ // ANTI_FLOOD_OVERRIDE ☠️',
                            body: 'Rilevamento buffer asincrono: minaccia neutralizzata.',
                            thumbnailUrl: 'https://qu.ax/TfUj.jpg',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });

                await conn.groupParticipantsUpdate(m.chat, [decodedSender], 'remove');

            } catch (e) {
                console.error(`[AntiSpam] Errore critico interceptor:`, e);
            }
            return;
        }
    }

    uzer.set(decodedSender, userData);
};

function getMessageContent(m) {
    try {
        const msg = m.message;
        if (msg?.conversation) return msg.conversation;
        if (msg?.extendedTextMessage?.text) return msg.extendedTextMessage.text;
        if (msg?.imageMessage?.caption) return `img:${msg.imageMessage.caption}`;
        if (msg?.videoMessage?.caption) return `vid:${msg.videoMessage.caption}`;
        if (msg?.stickerMessage) return `stk:${msg.stickerMessage.fileSha256?.toString('base64')}`;
        return 'unknown_message_type';
    } catch { return 'error_parsing_message'; }
}

function cleanupOldData(interval) {
    const now = Date.now();
    for (const [key, data] of uzer.entries()) {
        if (!data.timestamps.length || now - data.timestamps[data.timestamps.length - 1] > interval) {
            uzer.delete(key);
        }
    }
}

export default handler;
