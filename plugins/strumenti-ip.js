import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, `
╭
│ *Inserisci un indirizzo IP*
│
│ 『 📝 』\`Esempio:\`
│ *.ip 116.0.1938.76*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m)
    }
    const wait = await conn.reply(m.chat, `『 🕸️ 』 *Ricerca in corso...*`, m)

    try {
        const response = await fetch(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
        const data = await response.json()

        if (data.status !== 'success') {
            throw new Error(data.message || 'IP non valido o non trovato')
        }

        const result = `
ㅤㅤ⋆｡˚『 ╭ \`INFO IP\` ╯ 』˚｡⋆\n╭\n│
│ 『 🔍 』 \`IP:\` *${data.query}*
│ 『 🌍 』 \`Paese:\` *${data.country}*
│ 『 🏁 』 \`Codice:\` *${data.countryCode}*
│ 『 🏢 』 \`Regione:\` *${data.regionName}*
│ 『 🌆 』 \`Città:\` *${data.city}*
│ 『 📍 』 \`Distretto:\` *${data.district || '?'}*
│ 『 📮 』 \`CAP:\` *${data.zip || '?'}*
│ 『 🕒 』 \`Fuso:\` *${data.timezone}*
│ 『 🏢 』 \`ISP:\` *${data.isp}*
│ 『 🏛️ 』 \`Org:\` *${data.org || '?'}*
│ 『 📱 』 \`Mobile:\` ${data.mobile ? '『 ✅ 』' : '『 ❌ 』'}
│ 『 🖥️ 』 \`Hosting:\` ${data.hosting ? '『 ✅ 』' : '『 ❌ 』'}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        await conn.sendMessage(m.chat, {
            edit: wait.key,
            text: result
        })

    } catch (error) {
        console.error(error)
        await conn.sendMessage(m.chat, {
            edit: wait.key,
            text: global.errore
        })
    }
}

handler.help = ['ip <indirizzo>']
handler.tags = ['strumenti']
handler.command = /^(ip|ipinfo)$/i
handler.register = false

export default handler