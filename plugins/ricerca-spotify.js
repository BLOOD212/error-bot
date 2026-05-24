import fetch from 'node-fetch'
import axios from 'axios'

const euro = [
  '✧─ׄ─ׅ─ׄ', '─ׄ✧─ׄ─ׅ', '─ׄ─✧─ׄ─ׅ─ׄ', '─ׄ─ׅ─ׄ✧─ׄ', '─ׄ─ׅ✧─ׄ', '─ׄ─ׅ─ׄ✧'
]

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`SPOTIFY\` ╯ 』˚｡⋆\n╭\n│
│  \`inserisci il titolo della canzone.\`
│
│ 『 📚 』 \`Esempio d'uso:\`
│ *${usedPrefix}${command} in control youngboy nba*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m)

  const query = args.join(' ')

  let token
  try {
    const clientId = APIKeys.spotifyclientid 
    const clientSecret = APIKeys.spotifysecret
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })
    const json = await res.json()
    token = json.access_token
  } catch(e) {
    console.error("Errore autenticazione Spotify:", e);
    return conn.reply(m.chat, 'Errore durante l\'autenticazione con Spotify. Controlla Client ID e Client Secret.', m)
  }

  let tracks
  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (!data.tracks?.items?.length) return conn.reply(m.chat, `\`Non ho trovato nessuna canzone per "${query}", Prova con una ricerca diversa\``, m)
    tracks = data.tracks.items
  } catch(e) {
    console.error("Errore ricerca Spotify:", e);
    return conn.reply(m.chat, 'Errore durante la ricerca su Spotify', m)
  }

  try {
    const cards = tracks.map((track, index) => {
      const nome = track.name
      const artista = track.artists.map(a => a.name).join(', ')
      const album = track.album.name
      const img = track.album.images[0]?.url || ''
      const durataMs = track.duration_ms
      const durata = new Date(durataMs).toISOString().substr(14, 5)
      const urlSpotify = track.external_urls.spotify
      const popularity = track.popularity
      const releaseDate = track.album.release_date
      const trackId = track.id
      const percent = Math.floor(Math.random() * 101)
      const euroIndex = Math.floor((percent / 100) * (euro.length - 1))
      const stella = euro[euroIndex]
      const tempo = `${Math.floor((percent / 100) * (durataMs / 1000) / 60)}:${String(Math.floor((percent / 100) * (durataMs / 1000) % 60)).padStart(2, '0')}`

      return {
        image: { url: img },
        title: `- \`${nome.substring(0, 60) + (nome.length > 60 ? '...' : '')}\``,
        body: `『 👤 』 *${artista}*\n『 💿 』 *${album.substring(0, 30) + (album.length > 30 ? '...' : '')}*\n『 ⏱️ 』 *${durata}*\n『 📊 』 *${popularity}% popolarità*\n『 📅 』 *${releaseDate}*\n\n        *\`${tempo} ${stella} ${durata}\`*\n『 🔊 』 \`Volume:\` *▓▓░░*`,
        footer: '˗ˏˋ ☾ 𝚟𝚊𝚛𝚎𝚋𝚘𝚝 ☽ ˎˊ˗',
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🎵 Apri su Spotify",
              url: urlSpotify
            })
          }
        ]
      };
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `🎵 \`Risultati Spotify per:\` `,
        title: '',
        footer: `- *${query}*`,
        cards: cards
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Errore nell'invio del messaggio:", error);
    const track = tracks[0]
    const nome = track.name
    const artista = track.artists.map(a => a.name).join(', ')
    const img = track.album.images[0]?.url || ''
    const durataMs = track.duration_ms
    const durata = new Date(durataMs).toISOString().substr(14, 5)
    const urlSpotify = track.external_urls.spotify
    const percent = Math.floor(Math.random() * 101)
    const euroIndex = Math.floor((percent / 100) * (euro.length - 1))
    const stella = euro[euroIndex]
    const tempo = `${Math.floor((percent / 100) * (durataMs / 1000) / 60)}:${String(Math.floor((percent / 100) * (durataMs / 1000) % 60)).padStart(2, '0')}`

    let testoDecorato = `
ㅤㅤ⋆｡˚『🎵 ╭ \`SPOTIFY\` ╯ 』˚｡⋆\n╭\n│
│ 『 🎧 』 *\`${nome}\`*
│ 『 👤 』 *\`${artista}\`*
│
│    *\`${tempo} ${stella} ${durata}\`*
│   『 🔊 』 \`Volume:\` *▓▓░░*
│
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: testoDecorato + `\n\n🎵 *Ascolta su Spotify:* ${urlSpotify}`,
      buttons: buttons,
      headerType: 4,
      contextInfo: {
        ...global.fake.contextInfo
      }
    }, { quoted: m });
  }
}

handler.help = ['spotify <titolo>']
handler.tags = ['ricerca']
handler.command = /^spotify$/i
handler.register = false

export default handler