
import fs from 'fs'
import crypto from 'crypto'

const SNAI_PATH = './media/snai.png'

const CAMPIONATI = {
  "SERIE A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "MONDIALI": ["Italia", "Argentina", "Brasile", "Francia", "Germania", "Spagna", "Inghilterra", "Portogallo", "Olanda", "Belgio", "Croazia", "Marocco", "Giappone", "Uruguay", "Svizzera", "USA"]
}

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }

function getMatch(seed, lista, count = 1) {
  let matches = []
  let temp = [...lista]
  for (let i = 0; i < count; i++) {
    const hash = crypto.createHash('md5').update(seed + i).digest('hex')
    const idx1 = parseInt(hash.substring(0, 8), 16) % temp.length
    const casa = temp.splice(idx1, 1)[0]
    const idx2 = parseInt(hash.substring(8, 16), 16) % temp.length
    const trasf = temp.splice(idx2, 1)[0]
    matches.push({ casa, trasf, quota: (Math.random() * (2.1 - 1.6) + 1.6).toFixed(2) })
  }
  return matches
}

async function modificaMessaggio(conn, chatId, key, testo) {
  try { await conn.sendMessage(chatId, { text: testo, edit: key }) } catch (e) { console.error(e) }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const mode = args[0]?.toUpperCase() 
  const puntata = parseInt(args[1])
  const tipoCamp = args[2]
  const scelta = args[3]?.toUpperCase()

  // STEP 0: Menu Iniziale
  if (!mode || !['SINGOLA', 'TRIPLA'].includes(mode)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} SINGOLA`, buttonText: { displayText: '⚽ SINGOLA' }, type: 1 },
      { buttonId: `${usedPrefix + command} TRIPLA`, buttonText: { displayText: '🚀 TRIPLA' }, type: 1 }
    ]
    const cap = `╔════════════════╗\n     🎰  *SNAI BETTING* 🎰\n╚════════════════╝\n\n👤 *UTENTE:* @${who.split('@')[0]}\n💰 *SALDO:* ${formatNumber(user.euro)}€\n\n🎯 *SCEGLI LA TUA GIOCATA:*`
    return conn.sendMessage(m.chat, {
      ...(fs.existsSync(SNAI_PATH) ? { image: fs.readFileSync(SNAI_PATH) } : {}),
      caption: cap, buttons, mentions: [who]
    }, { quoted: m })
  }

  // STEP 1: Selezione Importo
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${mode} 100`, buttonText: { displayText: '💵 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} 500`, buttonText: { displayText: '💵 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} 1000`, buttonText: { displayText: '💵 1000€' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `🕹️ *MODALITÀ:* ${mode}\n\n💸 _Quanto vuoi puntare?_`, buttons }, { quoted: m })
  }

  // STEP 2: Selezione Campionato
  if (!tipoCamp) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${mode} ${puntata} SERIEA`, buttonText: { displayText: '🇮🇹 SERIE A' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} ${puntata} MONDIALI`, buttonText: { displayText: '🌎 MONDIALI' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `🏆 _Seleziona la competizione per la tua ${mode}:_`, buttons }, { quoted: m })
  }

  const lista = CAMPIONATI[tipoCamp === 'SERIEA' ? "SERIE A" : "MONDIALI"]
  const matches = getMatch(who + mode + tipoCamp, lista, mode === 'SINGOLA' ? 1 : 3)

  // STEP 3: Pronostico
  if (!scelta) {
    if (mode === 'SINGOLA') {
      const m1 = matches[0]
      const buttons = [
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} 1`, buttonText: { displayText: `🏠 (1) ${m1.casa}` }, type: 1 },
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} X`, buttonText: { displayText: '🤝 (X) Pareggio' }, type: 1 },
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} 2`, buttonText: { displayText: `✈️ (2) ${m1.trasf}` }, type: 1 }
      ]
      return conn.sendMessage(m.chat, { text: `🏠 *CASA:* ${m1.casa}\n✈️ *TRASFERTA:* ${m1.trasf}\n\n❓ *Su chi scommetti?*`, buttons }, { quoted: m })
    } else {
      let txt = `📋 *SCHEDINA TRIPLA DA COMPORRE*\n\n`
      matches.forEach((m, i) => txt += `${i+1}. ⚽ ${m.casa} vs ${m.trasf}\n`)
      txt += `\n🎯 _Scegli una combinazione rapida:_`
      const buttons = ['111', '1X2', '2X1', '222'].map(c => ({ 
        buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} ${c}`, 
        buttonText: { displayText: `Gioca ${c}` }, type: 1 
      }))
      return conn.sendMessage(m.chat, { text: txt, buttons }, { quoted: m })
    }
  }

  if (user.euro < puntata) return m.reply(`❌ *SALDO INSUFFICIENTE!*`)
  user.euro -= puntata

  // Simulazione Risultati
  let liveText = `🎟️ *RICEVUTA SNAI - ${mode}*\n💵 *PUNTATA:* ${formatNumber(puntata)}€\n`
  let quotaTotale = 1
  matches.forEach(m => quotaTotale *= parseFloat(m.quota))
  liveText += `📈 *QUOTA:* x${quotaTotale.toFixed(2)}\n💎 *VINCITA:* ${formatNumber(Math.floor(puntata * quotaTotale))}€\n───────────────────\n`
  
  const live = await conn.sendMessage(m.chat, { text: liveText + `⏳ _Calcolo risultati..._` })

  let vintoTotale = true
  let resText = ""

  for (let i = 0; i < matches.length; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const mMatch = matches[i]
    const gC = Math.floor(Math.random() * 4)
    const gT = Math.floor(Math.random() * 4)
    const esito = gC > gT ? '1' : (gC < gT ? '2' : 'X')
    const miaGiocata = mode === 'SINGOLA' ? scelta : scelta[i]
    const mVinto = esito === miaGiocata
    
    if (!mVinto) vintoTotale = false
    resText += `${mVinto ? '✅' : '❌'} *Match ${i+1}:* ${mMatch.casa} ${gC}-${gT} ${mMatch.trasf}\n   └─ _Tuo segno: ${miaGiocata}_ ${mVinto ? '(VINTO)' : '(PERSO)'}\n`
    await modificaMessaggio(conn, m.chat, live.key, liveText + resText)
  }

  let vincitaFinale = 0
  if (vintoTotale) {
    vincitaFinale = Math.floor(puntata * quotaTotale)
    user.euro += vincitaFinale
  }

  const finaleMsg = liveText + resText + `───────────────────\n${vintoTotale ? `🏆 *CASSA!* +${formatNumber(vincitaFinale)}€` : `💀 *PERSA!* -${formatNumber(puntata)}€`}\n🏦 *SALDO:* ${formatNumber(user.euro)}€`
  await modificaMessaggio(conn, m.chat, live.key, finaleMsg)
}

handler.command = /^(schedina|bet|multipla)$/i
handler.group = true

export default handler
