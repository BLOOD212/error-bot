import yts from 'yt-search';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🩸 *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    const url = vid.url;

    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━━┓\n   🎧  *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐏𝐋𝐀𝐘𝐄𝐑* 🎧\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: '𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 • 𝟤𝟢𝟤𝟨',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "🩸", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    // LISTA API AGGIORNATA AL 22 APRILE 2026
    const apiList = [
        `https://api.boxiwan.my.id/api/download/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.skizo.tech/api/y2mate?url=${url}`,
        `https://api.tesshu.my.id/api/download/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.botcahx.eu.org/api/dowloader/ytmp${isAudio ? '3' : '4'}?url=${url}&apikey=btch-932`
    ];

    for (let api of apiList) {
        try {
            console.log(`[BLOOD] Tentativo su: ${api}`);
            let res = await fetch(api);
            let json = await res.json();
            
            // Estrazione flessibile del link
            downloadUrl = json.data?.url || json.result?.url || json.result?.dl || json.url || json.result?.link;
            
            if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) break;
        } catch (e) {
            continue;
        }
    }

    if (!downloadUrl) {
        throw new Error('SERVER_OFFLINE');
    }

    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `blood_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    // Download con headers per simulare un browser (evita blocchi 403)
    const response = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    
    if (!response.ok) throw new Error('ERRORE_DOWNLOAD');
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);

    if (isAudio) {
        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓*`
        }, { quoted: m });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error('DEBUG:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`🚀 *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐄𝐑𝐑𝐎𝐑:*\n\nNessun server disponibile. Prova a scrivere il titolo esatto della canzone o usa un link diretto.`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
