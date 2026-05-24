import { WAMessageStubType } from '@whiskeysockets/baileys'
import { format } from 'util'
import chalk from 'chalk'

export default function (m, conn = { user: {} }) {
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    let name = m.pushName || 'Unknown'
    
    // Gestione sicura del testo
    let text = m.text || (m.mtype === 'conversation' ? m.message.conversation : '') || ''
    
    // Log nel terminale
    let msg = `[${chalk.green(new Date().toLocaleTimeString())}] ${chalk.blue(name)}: ${text.slice(0, 50)}`
    console.log(msg)
}
