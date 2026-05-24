import fs from 'fs';
import fetch from 'node-fetch';

async function generaDatabase() {
    let tutteLeDomande = [];
    const target = 1000;
    const batch = 50;

    console.log("Inizio download 1000 domande...");

    for (let i = 0; i < (target / batch); i++) {
        try {
            const res = await fetch(`https://opentdb.com/api.php?amount=${batch}&type=multiple`);
            const data = await res.json();

            if (data.results) {
                const pulite = data.results.map(q => ({
                    categoria: q.category,
                    domanda: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
                    opzioni: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
                    corretta: q.correct_answer
                }));
                tutteLeDomande.push(...pulite);
                console.log(`Scaricate ${tutteLeDomande.length} domande...`);
            }
            await new Promise(r => setTimeout(r, 3000));
        } catch (err) {
            console.error("Errore durante il download:", err);
        }
    }

    fs.writeFileSync('./media/database/quiz-data.json', JSON.stringify(tutteLeDomande, null, 2));
    console.log("Database completato! 1000 domande salvate in media/database/quiz-data.json");
}

generaDatabase();
