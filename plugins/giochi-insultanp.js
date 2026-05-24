const playAgainButtons = (prefix) => [
    {
        // Questo ID deve richiamare esattamente il comando handler.command
        buttonId: `${prefix}insultona`, 
        buttonText: { displayText: '🤬 SFACCIMM, N’ATA VOTA!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, text }) => {
    if (!m.isGroup) return

    let gruppi = global.db.data.chats[m.chat]
    if (gruppi.spacobot === false) return

    const cooldownKey = `insultona_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 4000; // Ridotto a 4 secondi per più cattiveria

    if (now - lastUse < cooldownTime) {
        return // Ignora silenziosamente se cliccano troppo in fretta
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    // Se il comando viene dal bottone, il "text" potrebbe essere vuoto, 
    // ma il bot deve comunque sapere chi insultare (quindi usiamo la quota o la menzione precedente)
    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    
    if (!menzione) {
        return m.reply('Tagga a nu piezz \'e fango o quota a coccheruno, sinnò chi cazzo aggia insultà?')
    }

    const categorie = {
        CATTIVERIA_PURA: [
            "mammata è na sbrinfia ca se ffa sburrà n'faccia pure r'e marrucchini r'a ferrovia, bucchenà!",
            "si nu figl 'e na latrina, to pat' è cornuto e to mmamm è na vavosa ca se venne p'un'euro 'o mercato!",
            "te n'aggia ditta tante ca t'aggia fà passà 'a voglia 'e nascere, piezz 'e rincoglionito e sfaccimm 'e rignante!",
            "si na mappina 'e mmerda, t'avess'a piglià n'infarto m'miezz 'a via a te e a tutta 'a razza toja!"
        ],
        SCHIFEZZE_NAPOLETANE: [
            "tieni n'addore 'e fessa r'a nonna ca manco 'e mosche te s'avvicinano, latrina mmerdosa!",
            "si talmente schifoso ca quann'o pat' s'è venuto a ffa 'o rito e' battesimo, o' prevete t'ha sputato 'nfacce!",
            "faje schifo pure a 'e scarrafune d'a fognatura, tieni 'a faccia comm'o pertuso r'o culo 'e n'asino!",
            "si nu scarto 'e mmerda, mammata s'abbuffa 'e cazzi e tu stai ancora cca a rompere 'e palle!"
        ],
        UMILIAZIONI_TOTALI: [
            "va’ jitt’o sango, tu e chi t'è mmuorto, si na mmerda ca cammina e nisciuno te vò bene!",
            "si cchiù cornuto 'e na sporta 'e purpetielli, a mugliereta se ffa sburrà r'o vico sano!",
            "nun sî bbuono manco p'essere jittato mmiez'a via, manco 'e cane te pìsciano 'ncuollo, scaurato!",
            "si nu perdente, na schifezza r'a natura, t'avesser'a appennere p'e palle ncopp'o Vesuvio!"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const insultoRandom = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        CATTIVERIA_PURA: "💀",
        SCHIFEZZE_NAPOLETANE: "🤮",
        UMILIAZIONI_TOTALI: "🔥"
    };

    await conn.sendMessage(m.chat, {
        text: `*${emojiCategoria[randomCategory]} SENTENZA: ${randomCategory.replace('_', ' ')}* \n\n@${menzione.split`@`[0]} ${insultoRandom}`,
        contextInfo: {
            mentionedJid: [menzione],
            forwardingScore: 999,
            isForwarded: true
        },
        buttons: playAgainButtons(usedPrefix),
        headerType: 1
    }, { quoted: m });
};

handler.help = ['insultanp'];
handler.tags = ['giochi'];
handler.command = /^(insultanp)$/i;
handler.group = true;

export default handler;
