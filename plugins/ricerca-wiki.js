import axios from 'axios'

let handler = async (m, { text }) => {
  if (!text) return m.reply('🔎 Inserisci il testo da cercare su Wikipedia');

  try {
    const { data } = await axios.get('https://it.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        titles: text,
        exintro: '',
        explaintext: ''
      }
    });
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    if (!page || page.missing !== undefined) {
      return m.reply('❌ Nessun risultato trovato.');
    }

    let title = page.title;
    let extract = page.extract || "Nessuna descrizione disponibile.";
    let parts = extract.split('\n').filter(line => line.trim().length);
    if (parts.length > 1) {
      extract = parts.join('\n - ');
    }
    m.reply(`▢ Wikipedia

‣ risultato di: ${title}

${extract}`);
  } catch (e) {
    m.reply(`Errore: ${e.message}`);
  }
}

handler.help = ['wikipedia'];
handler.tags = ['ricerca'];
handler.command = ['wiki','wikipedia'];
handler.register = false
export default handler;