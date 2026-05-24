import PhoneNumber from 'awesome-phonenumber'

const getGroupMessageRank = (chatId, userId) => {
    try {
        const groupUsers = []
        const chatData = global.db?.data?.chats?.[chatId]
        
        if (!chatData?.users) {
            return { rank: 0, total: 0, messages: 0 }
        }
        
        for (const [id, userData] of Object.entries(chatData.users)) {
            const messages = userData.messages || 0
            if (messages > 0) {
                groupUsers.push({ id, messages })
            }
        }
        
        groupUsers.sort((a, b) => b.messages - a.messages)
        
        const userIndex = groupUsers.findIndex(user => user.id === userId)
        const userMessages = groupUsers[userIndex]?.messages || 0
        
        return {
            rank: userIndex >= 0 ? userIndex + 1 : 0,
            total: groupUsers.length,
            messages: userMessages
        }
    } catch (error) {
        return { rank: 0, total: 0, messages: 0 }
    }
}

const getGlobalMessageRank = (userId) => {
    try {
        const allUsers = []
        
        if (global.db?.data?.chats) {
            const userTotals = {}
            
            for (const [chatId, chatData] of Object.entries(global.db.data.chats)) {
                if (chatData?.users) {
                    for (const [id, userData] of Object.entries(chatData.users)) {
                        const messages = userData.messages || 0
                        if (messages > 0) {
                            userTotals[id] = (userTotals[id] || 0) + messages
                        }
                    }
                }
            }
            
            for (const [id, totalMessages] of Object.entries(userTotals)) {
                allUsers.push({ id, messages: totalMessages })
            }
        }
        
        allUsers.sort((a, b) => b.messages - a.messages)
        
        const userIndex = allUsers.findIndex(user => user.id === userId)
        const userMessages = allUsers[userIndex]?.messages || 0
        
        return {
            rank: userIndex >= 0 ? userIndex + 1 : 0,
            total: allUsers.length,
            messages: userMessages
        }
    } catch (error) {
        return { rank: 0, total: 0, messages: 0 }
    }
}

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let pp = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg')
    
    if (!user.profile) user.profile = {}
    
    let currentLevel = user.level || Math.floor(Math.sqrt((user.exp || 0) / 100)) + 1
    let phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international')
    
    const groupRank = getGroupMessageRank(m.chat, m.sender)
    const globalRank = getGlobalMessageRank(m.sender)

    let menuBox = `
    ⋆｡˚『 ╭ \`COMANDI PROFILO\` ╯ 』˚｡⋆
╭
│  『 📝 』 \`${usedPrefix}setdesc\`
│  『 ⚧️ 』 \`${usedPrefix}setgenere\`
│  『 📸 』 \`${usedPrefix}setig\`
│  『 🌆 』 \`${usedPrefix}setcitta\`
│  『 🎂 』 \`${usedPrefix}setcompleanno\`
│  『 🎨 』 \`${usedPrefix}sethobby\`
│  『 💝 』 \`${usedPrefix}setstato\`
│  『 💼 』 \`${usedPrefix}setlavoro\`
│  『 🎵 』 \`${usedPrefix}setmusica\`
│  『 🍕 』 \`${usedPrefix}setcibo\`
│  『 🎬 』 \`${usedPrefix}setfilm\`
│  『 🎮 』 \`${usedPrefix}setgioco\`
│  『 🏃 』 \`${usedPrefix}setsport\`
│  『 🌍 』 \`${usedPrefix}setlingua\`
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

ㅤㅤ⋆｡˚『 ╭ \`RELAZIONI\` ╯ 』˚｡⋆
╭
│  『 💍 』 \`${usedPrefix}sposa @utente\`
│  『 💕 』 \`${usedPrefix}amante @utente\`
│  『 💔 』 \`${usedPrefix}divorzia\`
│  『 🔍 』 \`${usedPrefix}matrimoni\`
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

> *Usa* \`.profilo\` *per vedere il tuo profilo!*`

    try {
        await conn.sendMessage(m.chat, {
            text: menuBox,
            mentions: [m.sender],
            contextInfo: {
                ...global.fake.contextInfo,
                externalAdReply: {
                    title: `📋 Gestione Profilo - ${name}`,
                    body: `${phone} • Livello ${currentLevel} • ${formatNumber(user.euro || 0)}€`,
                    thumbnailUrl: pp,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: false
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('Errore nel comando infoprofilo:', e)
        await m.reply('『 ❌ 』- \`Errore nel caricamento delle informazioni.\`')
    }
}

handler.help = ['infoprofilo']
handler.tags = ['profilo']
handler.command = /^(infoprofilo|setprofilo)$/i
handler.register = false
export default handler