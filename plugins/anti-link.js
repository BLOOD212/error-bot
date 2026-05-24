import { downloadContentFromMessage } from '@realvare/based';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, readFile } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import fetch from 'node-fetch';
import { FormData } from 'formdata-node';

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;
const GENERAL_URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const SHORT_URL_DOMAINS = [
    'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at',
    'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly',
    'tiny.cc', 'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly',
    'bitly.com', 'cutt.ly', 'short.io', 'links.new', 'link.ly',
    'ur.ly', 'shrinkme.io', 'clck.ru', 'short.gy', 'lnk.to',
    'sh.st', 'ouo.io', 'bc.vc', 'adfoc.us', 'linkvertise.com',
    'exe.io', 'linkbucks.com', 'adfly.com', 'shrink-service.it',
    'cur.lv', 'gestyy.com', 'shrinkarn.com', 'za.gl', 'clicksfly.com',
    '6url.com', 'shortlink.sh', 'short.tn', 'rotator.ninja',
    'shrtco.de', 'ulvis.net', 'chilp.it', 'clicky.me',
    'budurl.com', 'po.st', 'shr.lc', 'dub.co'
];

const SHORT_URL_REGEX = new RegExp(
    `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*`,
    'gi'
);

const REQUEST_HEADERS = {
    'User-Agent': '☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰 // 𝘓𝘐𝘕𝘒_𝘊𝘈𝘛𝘊𝘏𝘌𝘙',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'DNT': '1',
    'Connection': 'keep-alive'
};

// --- LOGICA DI SUPPORTO ---

function isWhatsAppLink(url) {
    return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url);
}

async function containsSuspiciousLink(text) {
    if (!text) return false;
    if (isWhatsAppLink(text)) return true;
    if (SHORT_URL_REGEX.test(text)) return true;
    return false;
}

// --- GESTIONE VIOLAZIONE ---

async function handleViolation(conn, m, reason, isBotAdmin) {
    const sender = m.sender;

    // Distruzione immediata del payload contenente il link non autorizzato
    if (isBotAdmin) {
        try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
    }

    const text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘓𝘐𝘕𝘒_𝘐𝘕𝘛𝘌𝘙𝘊𝘌𝘗𝘛 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘜𝘕𝘈𝘜𝘛𝘏𝘖𝘙𝘐𝘡𝘌𝘋_𝘜𝘙𝘓_𝘍𝘖𝘜𝘕𝘋
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${sender.split('@')[0]}
⎔ 𝘗𝘬𝒕_𝘚𝘪𝘨𝘯𝘢𝘭: ${reason.toUpperCase()}
⎔ 𝘚𝘺𝘴_A𝘤𝘵𝘪𝘰𝘯: 𝘗𝘜𝘙𝘎𝘌_𝘈𝘕𝘋_𝘛𝘌𝘙𝘔𝘐𝘕𝘈𝘛𝘌
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Rilevato tentativo di reindirizzamento traffico esterno via URL. La trasmissione di link o domini abbreviati attiva l'override del firewall con conseguente espulsione immediata dell'host infetto.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim();

    await conn.sendMessage(m.chat, {
        text,
        mentions: [sender],
        contextInfo: {
            externalAdReply: {
                title: '☠️ ERROR⁴⁰⁴ // MALWARE_LINK_DETECTION ☠️',
                body: 'Protocollo Antilink: pacchetto rimosso dalla griglia.',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    // Sconnessione dell'utente dalla chat se i privilegi di amministrazione sono attivi
    if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove');
    }
}

// --- HANDLER PRINCIPALE ---

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || isAdmin || isOwner || isSam || m.fromMe) return false;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) return false;

    const extractedText = (m.text || m.caption || m.msg?.caption || m.msg?.text || '').toLowerCase();

    let linkFound = false;
    let reason = '';

    if (await containsSuspiciousLink(extractedText)) {
        linkFound = true;
        reason = isWhatsAppLink(extractedText) ? 'Link_Internal_WhatsApp' : 'Link_External_ShortURL';
    }

    // Se un trigger intercetta il pacchetto, avvia l'isolamento della minaccia
    if (linkFound) {
        await handleViolation(conn, m, reason, isBotAdmin);
        return true;
    }

    return false;
}
