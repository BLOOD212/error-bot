import axios from 'axios';
import { createWriteStream, unlinkSync, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { FormData } from 'formdata-node';

const aud = 25 * 1024 * 1024;
const img = 10 * 1024 * 1024;
const vid = 50 * 1024 * 1024;
const erpollo = 1000;
const mpt = 600000;
const opto = 45000; // Aumentato a 45s per dare tempo all'upload

const requestCache = new Map();
const CACHE_TTL = 3600000;

// Assicura che la cartella temp esista
const tempDir = join(process.cwd(), 'temp');
if (!existsSync(tempDir)) mkdirSync(tempDir);

function getCachedResult(key) {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.result;
    return null;
}

function setCachedResult(key, result) {
    requestCache.set(key, { result, timestamp: Date.now() });
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const ocrkey = global.APIKeys.ocrspace;
    const assemblykey = global.APIKeys.assemblyai;
    let tempPath;
    let operationStartTime = Date.now();

    try {
        if (!m.quoted) return m.reply(`Rispondi a un audio, video o immagine con *${usedPrefix + command}*`);

        const quoted = m.quoted;
        const mime = quoted.mimetype || '';
        if (!/audio|video|image/.test(mime)) throw 'Formato non supportato.';

        await conn.sendPresenceUpdate('composing', m.chat);
        const media = await quoted.download();
        
        // --- LOGICA AUDIO / VIDEO (AssemblyAI) ---
        if (mime.includes('audio') || mime.includes('video')) {
            const ext = mime.includes('audio') ? 'mp3' : 'mp4';
            tempPath = join(tempDir, `media_${Date.now()}.${ext}`);
            
            // Scrittura sincrona per sicurezza o attesa del completamento
            const writeStream = createWriteStream(tempPath);
            await new Promise((resolve, reject) => {
                writeStream.write(media);
                writeStream.end();
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // Upload con retry migliorato
            let uploadUrl;
            try {
                const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', 
                    media, // Inviamo direttamente il buffer, è più stabile per file < 50MB
                    {
                        headers: { 
                            'authorization': assemblykey,
                            'content-type': 'application/octet-stream'
                        },
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );
                uploadUrl = uploadResponse.data.upload_url;
            } catch (e) {
                console.error("Dettaglio Errore Upload:", e.response?.data || e.message);
                throw new Error('Errore durante il caricamento sui server di trascrizione.');
            }

            // Richiesta trascrizione
            const transcriptReq = await axios.post('https://api.assemblyai.com/v2/transcript',
                { audio_url: uploadUrl, language_detection: true },
                { headers: { 'authorization': assemblykey } }
            );

            // Polling del risultato
            let transcriptResult;
            while (true) {
                if (Date.now() - operationStartTime > opto) throw new Error('Tempo scaduto durante l\'elaborazione.');
                
                transcriptResult = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptReq.data.id}`, {
                    headers: { 'authorization': assemblykey }
                });

                if (transcriptResult.data.status === 'completed') {
                    const text = transcriptResult.data.text.trim();
                    const conf = (transcriptResult.data.confidence * 100).toFixed(1);
                    return m.reply(`『 📊 』 *Accuratezza:* ${conf}%\n\n『 📝 』 *Testo:*\n${text}`);
                }
                if (transcriptResult.data.status === 'error') throw new Error('Errore AssemblyAI: ' + transcriptResult.data.error);
                
                await new Promise(r => setTimeout(r, 2000));
            }
        } 
        
        // --- LOGICA IMMAGINE (OCR Space) ---
        else if (mime.includes('image')) {
            const formData = new FormData();
            formData.append('apikey', ocrkey);
            formData.append('language', 'ita');
            formData.append('OCREngine', '2'); // Motore 2 è più veloce per testo semplice
            formData.append('file', media, { filename: 'image.jpg', contentType: mime });

            const ocrRes = await axios.post('https://api.ocr.space/parse/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const text = ocrRes.data.ParsedResults?.[0]?.ParsedText;
            if (!text) throw 'Nessun testo trovato nell\'immagine.';
            
            m.reply(`『 📝 』 *Testo Rilevato:*\n\n${text.trim()}`);
        }

    } catch (e) {
        console.error(e);
        m.reply(`『 ❌ 』 *Errore:* ${e.message || e}`);
    } finally {
        if (tempPath && existsSync(tempPath)) unlinkSync(tempPath);
    }
};

handler.help = ['trascrivi'];
handler.tags = ['strumenti'];
handler.command = ['trascrivi', 'totext'];

export default handler;
