import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    try {
        // Avvisiamo l'utente che stiamo elaborando
        await m.reply('🎬 *Sto scaricando il meme...*')

        // Endpoint per cercare video popolari con la keyword "meme"
        let res = await fetch(`https://www.tikwm.com/api/feed/search?keywords=meme&count=10`)
        let json = await res.json()

        if (!json.data || !json.data.videos) {
            return m.reply('❌ Errore: Non sono riuscito a trovare video. Riprova.')
        }

        // Seleziona un video a caso tra i risultati
        let videoData = json.data.videos[Math.floor(Math.random() * json.data.videos.length)]
        
        // Prendiamo l'URL del video (senza watermark)
        let videoUrl = videoData.play

        // SCARICAMENTO MANUALE DEL BUFFER
        // Questo trasforma l'URL in un vero file video prima di inviarlo
        let response = await fetch(videoUrl)
        if (!response.ok) throw new Error('Errore nel download del file')
        let buffer = await response.buffer()

        // INVIO DEL VIDEO COME FILE
        await conn.sendMessage(m.chat, { 
            video: buffer, 
            caption: `🤣 *Meme Random*\n\n👤 *Autore:* ${videoData.author.unique_id}\n📝 *Desc:* ${videoData.title || 'Meme'}`,
            mimetype: 'video/mp4'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('⚠️ Si è verificato un errore nel recupero del video. Riprova tra poco.')
    }
}

handler.help = ['meme']
handler.tags = ['giochi']
handler.command = ['meme']

export default handler
