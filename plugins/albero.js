import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'

// --- CONFIGURAZIONE DATABASE ---
const marriagesFile = path.resolve('media/database/sposi.json');
if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });

let marriages = loadMarriages();
global.db = global.db || { data: { users: {} } }

function loadMarriages() {
    try {
        return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    } catch (e) { return {}; }
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

// --- UTILS & DESIGN ---
const design = {
    header: (title) => `ㅤ⋆｡˚『 ╭ \`${title}\` ╯ 』˚｡⋆\n╭`,
    line: "│",
    footer: "*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*",
    divider: "├─ׄ──⭒─ׄ─ׅ"
};

const formatMessage = (title, content) => `${design.header(title)}\n${content}\n${design.footer}`;

const checkUser = (id) => {
    if (!id) return
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let u = global.db.data.users[id]
    if (!Array.isArray(u.p)) u.p = [] // Figli
    if (u.s === undefined) u.s = null // Genitore
}

// --- FUNZIONI GRAFICHE ---
async function createMarriageImage(user1, user2, conn, isMarriage = true) {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, isMarriage ? '#FF6F61' : '#4B5EAA');
    grad.addColorStop(1, isMarriage ? '#FFF5EE' : '#E6E6FA');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 800, 500);

    const drawAvatar = async (id, x, y) => {
        let img;
        try {
            let url = await conn.profilePictureUrl(id, 'image').catch(() => 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg');
            img = await loadImage(url);
        } catch { img = await loadImage('https://telegra.ph/file/2416c30c33306fa33c5e0.jpg'); }
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, x - 90, y - 90, 180, 180);
        ctx.restore();
        ctx.strokeStyle = isMarriage ? '#FF69B4' : '#4B5EAA';
        ctx.lineWidth = 6; ctx.stroke();
    };

    await drawAvatar(user1, 200, 200);
    await drawAvatar(user2, 600, 200);

    ctx.fillStyle = isMarriage ? '#FF1493' : '#4B5EAA';
    ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center';
    ctx.fillText(isMarriage ? 'Matrimonio Celebrato!' : 'Divorzio Completato', 400, 380);
    
    return canvas.toBuffer();
}

// --- HANDLER PRINCIPALE ---
let handler = async (m, { conn, text, command, usedPrefix }) => {
    let user = m.sender
    checkUser(user)

    if (command === 'famiglia') {
        let menu = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        menu += `👉 *${usedPrefix}sposa @tag* - Proposta di matrimonio\n`
        menu += `👉 *${usedPrefix}divorzia* - Sciogli l'unione\n`
        menu += `👉 *${usedPrefix}adotta @tag* - Adotta un figlio\n`
        menu += `👉 *${usedPrefix}disereda @tag* - Rimuovi un figlio\n`
        menu += `👉 *${usedPrefix}albero* - Visualizza la dinastia\n`
        return m.reply(menu)
    }

    if (command === 'sposa') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga il partner!*')
        checkUser(target)

        if (marriages[user]) return m.reply('*⚠️ Sei già sposato!*')
        if (marriages[target]) return m.reply('*⚠️ Questa persona è già impegnata!*')

        global.marriage_proposals = global.marriage_proposals || {}
        global.marriage_proposals[target] = { proposer: user, timeout: setTimeout(() => delete global.marriage_proposals[target], 60000) }

        const buttons = [
            { buttonId: `${usedPrefix}accettasposa`, buttonText: { displayText: 'SÌ, LO VOGLIO ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiutasposa`, buttonText: { displayText: 'NO ❌' }, type: 1 }
        ]

        return conn.sendMessage(m.chat, {
            text: `*💍 PROPOSTA DI MATRIMONIO 💍*\n\n@${user.split('@')[0]} ha chiesto la mano di @${target.split('@')[0]}.\n\n*Vuoi accettare?*`,
            footer: 'SISTEMA GENEALOGICO',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }, { quoted: m })
    }

    if (command === 'accettasposa') {
        let proposal = global.marriage_proposals[user]
        if (!proposal) return m.reply('*⚠️ Nessuna proposta pendente.*')
        
        let partner = proposal.proposer
        marriages[user] = partner
        marriages[partner] = user
        saveMarriages()
        clearTimeout(proposal.timeout)
        delete global.marriage_proposals[user]

        let img = await createMarriageImage(user, partner, conn, true)
        return conn.sendMessage(m.chat, { image: img, caption: `*💖 VIVA GLI SPOSI!* @${user.split('@')[0]} e @${partner.split('@')[0]} sono ora uniti!`, mentions: [user, partner] })
    }

    if (command === 'divorzia') {
        let ex = marriages[user]
        if (!ex) return m.reply('*⚠️ Non sei sposato.*')
        
        delete marriages[user]
        delete marriages[ex]
        saveMarriages()

        let img = await createMarriageImage(user, ex, conn, false)
        return conn.sendMessage(m.chat, { image: img, caption: `*💔 Divorzio completato tra @${user.split('@')[0]} e @${ex.split('@')[0]}*`, mentions: [user, ex] })
    }

    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ Tagga chi vuoi adottare!*')
        checkUser(target)
        if (global.db.data.users[target].s) return m.reply('*❌ Ha già un genitore!*')
        
        global.db.data.users[user].p.push(target)
        global.db.data.users[target].s = user
        m.reply(`*👶 Hai adottato @${target.split('@')[0]}!*`, null, { mentions: [target] })
    }

    if (command === 'disereda') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ Tagga il figlio!*')
        let figli = global.db.data.users[user].p || []
        if (!figli.includes(target)) return m.reply('*❌ Non è tuo figlio.*')
        
        global.db.data.users[user].p = figli.filter(id => id !== target)
        global.db.data.users[target].s = null
        m.reply(`*🚫 @${target.split('@')[0]} rimosso dalla famiglia.*`, null, { mentions: [target] })
    }

    if (command === 'albero' || command === 'famigliamia') {
        let target = m.mentionedJid[0] || user
        checkUser(target)
        await m.reply('⏳ *Generazione albero in corso...*')

        const canvas = createCanvas(800, 800)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, 800, 800)

        const drawBox = async (id, x, y, label, color) => {
            if (!id) return
            ctx.fillStyle = color; ctx.fillRect(x - 80, y - 50, 160, 100)
            ctx.strokeStyle = '#f1c40f'; ctx.strokeRect(x - 80, y - 50, 160, 100)
            ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'
            ctx.fillText(label, x, y - 35)
            let name = await conn.getName(id)
            ctx.fillText(name.substring(0, 15), x, y + 40)
            try {
                let url = await conn.profilePictureUrl(id, 'image').catch(() => 'https://telegra.ph/file/2416c30c33306fa33c5e0.jpg')
                let img = await loadImage(url)
                ctx.save(); ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.clip()
                ctx.drawImage(img, x - 25, y - 25, 50, 50); ctx.restore()
            } catch {}
        }

        let u = global.db.data.users[target]
        let partner = marriages[target]
        let padre = u.s

        if (padre) {
            ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(400, 150); ctx.lineTo(400, 350); ctx.stroke()
            await drawBox(padre, 400, 100, 'GENITORE', '#3498db')
        }

        if (partner) {
            ctx.strokeStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(300, 350); ctx.lineTo(500, 350); ctx.stroke()
            await drawBox(target, 300, 350, 'TU', '#fff'); await drawBox(partner, 500, 350, 'PARTNER', '#ff7675')
        } else {
            await drawBox(target, 400, 350, 'TU', '#fff')
        }

        let figli = u.p || []
        if (figli.length > 0) {
            let startX = 400 - (figli.length - 1) * 100
            figli.slice(0, 4).forEach(async (f, i) => {
                let fx = startX + (i * 200)
                ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(400, 350); ctx.lineTo(fx, 600); ctx.stroke()
                await drawBox(f, fx, 600, 'FIGLIO', '#2ecc71')
            })
        }

        setTimeout(() => {
            conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `🌳 Albero di @${target.split('@')[0]}`, mentions: [target] })
        }, 1500)
    }
}

handler.command = /^(sposa|accettasposa|rifiutasposa|divorzia|adotta|disereda|albero|famigliamia|famiglia)$/i
handler.group = true
export default handler
