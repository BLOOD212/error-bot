let handler = m => m;

handler.before = async function (m) {
    if (!m.isGroup) return;
    let chat = global.db.data.chats[m.chat];
    if (!chat.messageCount) chat.messageCount = 0;
    chat.messageCount++;

    let time = 3600000;
    if (new Date() - (chat.lastReset || 0) > time) {
        if (chat.messageCount < 2000) {
            let metadata = await this.groupMetadata(m.chat);
            let members = metadata.participants.map(p => p.id);
            let frasi = [
                `⚠️ GRUPPO INATTIVO (${chat.messageCount} msg).\n\nSveglia gente!`,
                `💤 Dormite tutti? Solo ${chat.messageCount} messaggi nell'ultima ora. Datevi una mossa!`,
                `🚨 Rilevata inattività. Scrivete qualcosa!`,
                `⚠️ Allerta: Il gruppo sta morendo. Rompete il silenzio!`,
                `📉 Statistiche in calo. Risvegliatevi tutti!`
            ];
            await this.sendMessage(m.chat, { text: frasi[Math.floor(Math.random() * frasi.length)], mentions: members });
        }
        chat.messageCount = 0;
        chat.lastReset = new Date() * 1;
    }
};

export default handler;
