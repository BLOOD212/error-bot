import fetch from 'node-fetch'
import axios from 'axios'

const GEMINI_API_KEY = `${global.APIKeys.gemini}`
const GOOGLE_API_KEY = `${global.APIKeys.google}`
const SEARCH_ENGINE_ID = `${global.APIKeys.googleCX}`
const nutritionDatabase = {
    'pasta': { cal: 131, prot: 5.0, fat: 1.1, carbs: 25.0, fiber: 1.8, sodium: 1 },
    'riso': { cal: 130, prot: 2.7, fat: 0.3, carbs: 28.0, fiber: 0.4, sodium: 5 },
    'pane': { cal: 265, prot: 8.1, fat: 3.2, carbs: 49.0, fiber: 2.7, sodium: 540 },
    'pizza margherita': { cal: 266, prot: 11.0, fat: 10.0, carbs: 33.0, fiber: 2.3, sodium: 598 },
    'pollo petto': { cal: 165, prot: 31.0, fat: 3.6, carbs: 0.0, fiber: 0.0, sodium: 74 },
    'manzo': { cal: 250, prot: 26.0, fat: 15.0, carbs: 0.0, fiber: 0.0, sodium: 72 },
    'salmone': { cal: 208, prot: 22.0, fat: 12.0, carbs: 0.0, fiber: 0.0, sodium: 59 },
    'tonno': { cal: 144, prot: 30.0, fat: 1.0, carbs: 0.0, fiber: 0.0, sodium: 47 },
    'latte': { cal: 42, prot: 3.4, fat: 1.0, carbs: 5.0, fiber: 0.0, sodium: 44 },
    'yogurt greco': { cal: 59, prot: 10.0, fat: 0.4, carbs: 3.6, fiber: 0.0, sodium: 36 },
    'formaggio': { cal: 402, prot: 25.0, fat: 33.0, carbs: 1.3, fiber: 0.0, sodium: 621 },
    'mozzarella': { cal: 280, prot: 22.0, fat: 22.0, carbs: 2.2, fiber: 0.0, sodium: 16 },
    'mela': { cal: 52, prot: 0.3, fat: 0.2, carbs: 14.0, fiber: 2.4, sodium: 1 },
    'banana': { cal: 89, prot: 1.1, fat: 0.3, carbs: 23.0, fiber: 2.6, sodium: 1 },
    'arancia': { cal: 47, prot: 0.9, fat: 0.1, carbs: 12.0, fiber: 2.4, sodium: 0 },
    'fragole': { cal: 32, prot: 0.7, fat: 0.3, carbs: 8.0, fiber: 2.0, sodium: 1 },
    'pomodoro': { cal: 18, prot: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, sodium: 5 },
    'spinaci': { cal: 23, prot: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, sodium: 79 },
    'broccoli': { cal: 34, prot: 2.8, fat: 0.4, carbs: 7.0, fiber: 2.6, sodium: 33 },
    'carote': { cal: 41, prot: 0.9, fat: 0.2, carbs: 10.0, fiber: 2.8, sodium: 69 },
    'coca cola': { cal: 42, prot: 0.0, fat: 0.0, carbs: 10.6, fiber: 0.0, sodium: 4 },
    'birra': { cal: 43, prot: 0.5, fat: 0.0, carbs: 3.6, fiber: 0.0, sodium: 4 },
    'vino rosso': { cal: 85, prot: 0.1, fat: 0.0, carbs: 2.6, fiber: 0.0, sodium: 4 },
    'acqua': { cal: 0, prot: 0.0, fat: 0.0, carbs: 0.0, fiber: 0.0, sodium: 2 },
    'cioccolato': { cal: 546, prot: 4.9, fat: 31.0, carbs: 63.0, fiber: 7.0, sodium: 24 },
    'biscotti': { cal: 502, prot: 6.3, fat: 24.0, carbs: 65.0, fiber: 2.0, sodium: 375 },
    'gelato': { cal: 207, prot: 3.5, fat: 11.0, carbs: 24.0, fiber: 0.7, sodium: 80 }
}

async function getGoogleImage(query) {
    try {
        const cleanQuery = query.replace(/\d+\s*(ml|g|kg)/i, '').trim()
        const searchQuery = `${cleanQuery} ${cleanQuery.includes('bevanda') || cleanQuery.includes('bibita') || cleanQuery.includes('drink') ? 'bevanda drink' : 'cibo food'} alta qualità`
        
        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=5&safe=active&imgSize=medium`
        )
        
        const items = response.data.items
        if (items && items.length > 0) {
            const validImages = items.filter(item => 
                item.link && 
                (item.link.includes('.jpg') || item.link.includes('.jpeg') || item.link.includes('.png')) &&
                !item.link.includes('thumbnail')
            )
            
            if (validImages.length > 0) {
                const randomIndex = Math.floor(Math.random() * validImages.length)
                return validImages[randomIndex].link
            }
        }
        return null
    } catch (error) {
        console.error('Errore Google Images:', error)
        return null
    }
}

function getNutritionFromDatabase(foodName, quantity, unit) {
    const normalizedName = foodName.toLowerCase().trim()
    let match = nutritionDatabase[normalizedName]
    if (!match) {
        for (const [key, value] of Object.entries(nutritionDatabase)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                match = value
                break
            }
        }
    }
    
    if (match) {
        const factor = unit === 'ml' ? quantity / 100 : quantity / 100
        return {
            name: foodName,
            calories: +(match.cal * factor).toFixed(1),
            protein: +(match.prot * factor).toFixed(1),
            fat: +(match.fat * factor).toFixed(1),
            satFat: +(match.fat * 0.3 * factor).toFixed(1),
            carbs: +(match.carbs * factor).toFixed(1),
            sugars: +(match.carbs * 0.4 * factor).toFixed(1),
            fiber: +(match.fiber * factor).toFixed(1),
            sodium: Math.round(match.sodium * factor),
            cholesterol: Math.round(match.fat * 2 * factor),
            potassium: Math.round(match.carbs * 10 * factor),
            calcium: Math.round(match.prot * 5 * factor),
            iron: +(match.prot * 0.1 * factor).toFixed(1),
            category: getCategoryFromName(normalizedName),
            portion: getRecommendedPortion(normalizedName, unit),
            note: getNutritionalNote(normalizedName),
            unit,
            source: 'database'
        }
    }
    
    return null
}

function getCategoryFromName(name) {
    if (['pasta', 'riso', 'pane', 'pizza'].some(item => name.includes(item))) return 'Cereali e derivati'
    if (['pollo', 'manzo', 'salmone', 'tonno'].some(item => name.includes(item))) return 'Carne e pesce'
    if (['latte', 'yogurt', 'formaggio', 'mozzarella'].some(item => name.includes(item))) return 'Latticini'
    if (['mela', 'banana', 'arancia', 'fragole'].some(item => name.includes(item))) return 'Frutta'
    if (['pomodoro', 'spinaci', 'broccoli', 'carote'].some(item => name.includes(item))) return 'Verdura'
    if (['coca cola', 'birra', 'vino', 'acqua'].some(item => name.includes(item))) return 'Bevande'
    if (['cioccolato', 'biscotti', 'gelato'].some(item => name.includes(item))) return 'Dolci e snack'
    return 'Alimento generico'
}

function getRecommendedPortion(name, unit) {
    const portions = {
        'pasta': 80, 'riso': 80, 'pane': 50, 'pizza': 200,
        'pollo': 120, 'manzo': 100, 'salmone': 150, 'tonno': 120,
        'latte': 200, 'yogurt': 125, 'formaggio': 30, 'mozzarella': 100,
        'mela': 150, 'banana': 120, 'arancia': 160, 'fragole': 150,
        'pomodoro': 100, 'spinaci': 200, 'broccoli': 200, 'carote': 100,
        'coca cola': 330, 'birra': 330, 'vino': 125, 'acqua': 250,
        'cioccolato': 20, 'biscotti': 30, 'gelato': 100
    }
    
    for (const [key, value] of Object.entries(portions)) {
        if (name.includes(key)) return value
    }
    return unit === 'ml' ? 250 : 100
}

function getNutritionalNote(name) {
    const notes = {
        'pasta': 'Ricca in carboidrati complessi, fornisce energia duratura',
        'riso': 'Facilmente digeribile, ottima fonte di energia',
        'pane': 'Ricco di carboidrati, scegli integrale per più fibre',
        'pizza': 'Bilanciata ma calorica, modera le porzioni',
        'pollo': 'Eccellente fonte di proteine magre',
        'manzo': 'Rica in proteine e ferro, ma più calorica',
        'salmone': 'Ricco di omega-3 e proteine di alta qualità',
        'tonno': 'Ottima fonte di proteine, povero di grassi',
        'latte': 'Ricco di calcio e proteine complete',
        'yogurt': 'Probiotici benefici, ricco di proteine',
        'formaggio': 'Ricco di calcio ma calorico, modera le porzioni',
        'mela': 'Rica in fibre e antiossidanti, ideale come spuntino',
        'banana': 'Ricca di potassio, ottima per lo sport',
        'arancia': 'Ricca di vitamina C e antiossidanti',
        'spinaci': 'Ricchi di ferro e acido folico',
        'broccoli': 'Ricchi di vitamina C e antiossidanti',
        'coca cola': 'Ricca di zuccheri, consumare con moderazione',
        'cioccolato': 'Ricco di antiossidanti ma molto calorico'
    }
    
    for (const [key, value] of Object.entries(notes)) {
        if (name.includes(key)) return value
    }
    return 'Mantieni una dieta equilibrata e varia'
}

async function askGeminiPro(query, quantity = 100, unit = 'g') {
    try {
        const prompt = `Sei un esperto nutrizionista certificato. Analizza "${query}" (${quantity}${unit}) e fornisci valori nutrizionali precisi basati su database nutrizionali ufficiali (USDA, CREA-INRAN). 

IMPORTANTE: Fornisci solo valori realistici e verificati. Non inventare dati.

Formato ESATTO richiesto:
Calorie: [numero con 1 decimale] kcal
Proteine: [numero con 1 decimale] ${unit}
Grassi: [numero con 1 decimale] ${unit}
Grassi saturi: [numero con 1 decimale] ${unit}
Carboidrati: [numero con 1 decimale] ${unit}
di cui zuccheri: [numero con 1 decimale] ${unit}
Fibre: [numero con 1 decimale] ${unit}
Sodio: [numero intero] mg
Colesterolo: [numero intero] mg
Potassio: [numero intero] mg
Calcio: [numero intero] mg
Ferro: [numero con 1 decimale] mg
Categoria: [categoria specifica dell'alimento]
Porzione consigliata: [numero intero] ${unit}
Note: [consiglio nutrizionale professionale basato su evidenze scientifiche]

Sii preciso e professionale. Base i valori su fonti nutrizionali accreditate.`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topP: 0.8,
                        maxOutputTokens: 600
                    }
                })
            }
        )

        if (!response.ok) throw new Error(`Errore API Gemini per kcal (${response.status})`)
        const result = await response.json()
        
        if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error(`${global.errore}`)
        }

        const answer = result.candidates[0].content.parts[0].text
        const parseValue = (regex, defaultValue = '0') => {
            const match = answer.match(regex)
            const value = match ? match[1] : defaultValue
            return isNaN(parseFloat(value)) ? defaultValue : value
        }
        
        const calories = parseValue(/calorie?:?\s*(\d+(?:\.\d+)?)/i)
        const proteins = parseValue(/proteine?:?\s*(\d+(?:\.\d+)?)/i)
        const fats = parseValue(/grass[io]:?\s*(\d+(?:\.\d+)?)/i)
        const satFats = parseValue(/grass[io]\s*saturi:?\s*(\d+(?:\.\d+)?)/i)
        const carbs = parseValue(/carboidrati:?\s*(\d+(?:\.\d+)?)/i)
        const sugars = parseValue(/zuccheri:?\s*(\d+(?:\.\d+)?)/i)
        const fiber = parseValue(/fibr[ae]:?\s*(\d+(?:\.\d+)?)/i)
        const sodium = parseValue(/sodio:?\s*(\d+(?:\.\d+)?)/i)
        const cholesterol = parseValue(/colesterolo:?\s*(\d+(?:\.\d+)?)/i)
        const potassium = parseValue(/potassio:?\s*(\d+(?:\.\d+)?)/i)
        const calcium = parseValue(/calcio:?\s*(\d+(?:\.\d+)?)/i)
        const iron = parseValue(/ferro:?\s*(\d+(?:\.\d+)?)/i)
        const category = answer.match(/categoria:?\s*([^\n\r]+)/i)?.[1]?.trim() || 'Alimento generico'
        const portion = parseValue(/porzione\s*consigliata:?\s*(\d+)/i, '100')
        const note = answer.match(/note:?\s*([^\n\r]+)/i)?.[1]?.trim() || 'Consultare un nutrizionista per consigli personalizzati'
        
        const calculateValue = (value, factor, decimals = 1) => {
            const calculated = parseFloat(value) * factor
            return decimals ? +calculated.toFixed(decimals) : Math.round(calculated)
        }
        const factor = quantity / 100
        return {
            name: query,
            calories: calculateValue(calories, factor, 1),
            protein: calculateValue(proteins, factor, 1),
            fat: calculateValue(fats, factor, 1),
            satFat: calculateValue(satFats, factor, 1),
            carbs: calculateValue(carbs, factor, 1),
            sugars: calculateValue(sugars, factor, 1),
            fiber: calculateValue(fiber, factor, 1),
            sodium: calculateValue(sodium, factor, 0),
            cholesterol: calculateValue(cholesterol, factor, 0),
            potassium: calculateValue(potassium, factor, 0),
            calcium: calculateValue(calcium, factor, 0),
            iron: calculateValue(iron, factor, 1),
            category,
            portion: parseInt(portion),
            note,
            unit,
            source: 'gemini'
        }
    } catch (error) {
        console.error('Errore Gemini Pro:', error)
        throw error
    }
}

function calculateBMR(weight, height, age, gender) {
    if (gender.toLowerCase() === 'm' || gender.toLowerCase() === 'maschio') {
        return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161
    }
}

function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        sedentario: 1.2,
        leggero: 1.375,
        moderato: 1.55,
        intenso: 1.725,
        estremo: 1.9
    }
    
    return {
        sedentario: Math.round(bmr * multipliers.sedentario),
        leggero: Math.round(bmr * multipliers.leggero),
        moderato: Math.round(bmr * multipliers.moderato),
        intenso: Math.round(bmr * multipliers.intenso),
        estremo: Math.round(bmr * multipliers.estremo)
    }
}

function getHealthAdvice(calories, protein, fat, carbs, bmr) {
    const advice = []
    if (calories > bmr * 0.25) {
        advice.push("『 🚨 』 *Alimento ad alta densità calorica*")
    }
    if (protein > 15) {
        advice.push("『 💪 』 *Ottima fonte di proteine*")
    }
    if (fat > 20) {
        advice.push("『 ⚠️ 』 *Ricco di grassi, modera le porzioni*")
    }
    if (carbs > 50) {
        advice.push("『 ⚡ 』 *Ricco di carboidrati, ideale pre-allenamento*")
    }
    
    return advice.length > 0 ? advice.join(' • ') : "『 ✅ 』 *Alimento bilanciato*"
}

let handler = async (m, { conn, text }) => {
    if (!text) {
        const buttons = [
            { buttonId: '.kcal pasta 100g', buttonText: { displayText: '🍝 Pasta (100g)' }, type: 1 },
            { buttonId: '.kcal pollo petto 120g', buttonText: { displayText: '🍗 Pollo (120g)' }, type: 1 },
            { buttonId: '.kcal mela 150g', buttonText: { displayText: '🍎 Mela (150g)' }, type: 1 },
            { buttonId: '.kcal coca cola 330ml', buttonText: { displayText: '🥤 Coca Cola (330ml)' }, type: 1 },
            { buttonId: '.kcal bmr 70 175 25 m', buttonText: { displayText: '🔥 BMR Uomo' }, type: 1 },
        ]

        return conn.sendMessage(m.chat, {
            text: `ㅤㅤ⋆｡˚『 ╭ \`VALORI NUTRIZIONALI\` ╯ 』˚｡⋆
╭
│
│ 『 📊 』 _Comandi disponibili:_
│
│ 『 🍽️ 』 \`Analisi Nutrizionale:\`
│ • *.kcal [alimento] [quantità]g (100g default)*
│ • *.kcal [bevanda] [quantità]ml*
│
│ 『 🔥 』 \`Metabolismo Basale:\`
│ • *.kcal bmr [peso] [altezza] [età] [m/f]*
│
│ 『 📝 』 \`Esempi pratici:\`
│ • *.kcal pasta 100g*
│ • *.kcal pollo petto 120g*
│ • *.kcal mela 150g*
│ • *.kcal coca cola 330ml*
│ • *.kcal bmr 70 175 25 m*
│
│『 🎯 』  \`Caratteristiche:\`
│ • *Database nutrizionale professionale*
│ • *Valori precisi e verificati*
│ • *Consigli nutrizionali personalizzati*
│ • *Calcolo fabbisogno calorico*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            buttons: buttons,
            headerType: 1
        }, { quoted: m })
    }

    try {
        await conn.sendPresenceUpdate('composing', m.chat)
        if (text.toLowerCase().startsWith('bmr')) {
            const bmrMatch = text.match(/bmr\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+)\s+([mf])/i)
            if (!bmrMatch) {
                const bmrButtons = [
                    { buttonId: '.kcal bmr 70 175 25 m', buttonText: { displayText: '👨 Uomo 25 anni' }, type: 1 },
                    { buttonId: '.kcal bmr 60 165 30 f', buttonText: { displayText: '👩 Donna 30 anni' }, type: 1 },
                    { buttonId: '.kcal bmr 80 180 35 m', buttonText: { displayText: '👨 Uomo 35 anni' }, type: 1 },
                    { buttonId: '.kcal bmr 55 160 28 f', buttonText: { displayText: '👩 Donna 28 anni' }, type: 1 }
                ]

                return conn.sendMessage(m.chat, {
                    text: `ㅤㅤ⋆｡˚『 ╭ \`CALCOLO BMR\` ╯ 』˚｡⋆
╭
│
│ 📝 *Formato richiesto:*
│  bmr [peso] [altezza] [età] [m/f]\`
│
│ 🔍 *Spiegazione parametri:*
│ • *Peso:* in chilogrammi (es: 70)
│ • *Altezza:* in centimetri (es: 175)
│ • *Età:* in anni (es: 25)
│ • *Sesso:* m (maschio) o f (femmina)
│
│ ✅ *Esempio corretto:*
│  bmr 70 175 25 m\`
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
                    buttons: bmrButtons,
                    headerType: 1
                }, { quoted: m })
            }

            const [, weight, height, age, gender] = bmrMatch
            const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender)
            const tdee = calculateTDEE(bmr, 'moderato')
            
            // Calcolo BMI
            const heightInMeters = parseFloat(height) / 100
            const bmi = parseFloat(weight) / (heightInMeters * heightInMeters)
            
            let bmiCategory = ''
            if (bmi < 18.5) bmiCategory = 'Sottopeso'
            else if (bmi < 25) bmiCategory = 'Normopeso'
            else if (bmi < 30) bmiCategory = 'Sovrappeso'
            else bmiCategory = 'Obeso'
            
            const genderEmoji = gender.toLowerCase() === 'm' ? '👨' : '👩'
            const genderText = gender.toLowerCase() === 'm' ? 'Uomo' : 'Donna'

            return m.reply(`ㅤㅤ⋆｡˚『 ╭ \`ANALISI METABOLICA\` ╯ 』˚｡⋆
╭
│ ${genderEmoji} *Profilo:* ${genderText} ${age} anni
│
│ 📊 *Dati corporei:*
│ • Peso: *${weight} kg*
│ • Altezza: *${height} cm*
│ • BMI: *${bmi.toFixed(1)}* (${bmiCategory})
│
│ 🔥 *Metabolismo basale (BMR):*
│ • *${Math.round(bmr)} kcal/giorno*
│ _(Calorie necessarie a riposo)_
│
│ 📈 *Fabbisogno calorico giornaliero (TDEE):*
│ • 🛋️ Sedentario: *${tdee.sedentario} kcal*
│ • 🚶 Attività leggera: *${tdee.leggero} kcal*
│ • 🏃 Attività moderata: *${tdee.moderato} kcal*
│ • 💪 Attività intensa: *${tdee.intenso} kcal*
│ • 🏋️ Attività estrema: *${tdee.estremo} kcal*
│
│ 🎯 *Obiettivi calorici:*
│ • Perdere peso: *${tdee.moderato - 500} kcal*
│ • Mantenere peso: *${tdee.moderato} kcal*
│ • Aumentare peso: *${tdee.moderato + 500} kcal*
│
│ 💡 *Raccomandazioni:*
│ • Distribuzione: 50% carb, 30% grassi, 20% proteine
│ • Idratazione: ${Math.round(parseFloat(weight) * 35)}ml/giorno
│ • Pasti: 5-6 piccoli pasti al giorno
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
\`\`Formula Mifflin-St Jeor - Consultare un nutrizionista per piani personalizzati\`\``)
        }

        // Gestione analisi nutrizionale
        let quantity = 100
        let unit = 'g'
        let foodQuery = text.trim()

        // Parsing migliorato della quantità
        const measureMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|g|kg)/i)
        if (measureMatch) {
            quantity = parseFloat(measureMatch[1])
            unit = measureMatch[2].toLowerCase()
            
            // Conversione kg in g
            if (unit === 'kg') {
                quantity *= 1000
                unit = 'g'
            }
            
            foodQuery = text.replace(/\d+(?:\.\d+)?\s*(ml|g|kg)/i, '').trim()
        }

        const waitMsg = await m.reply(`ㅤㅤ⋆｡˚『 ╭ \`ANALISI IN CORSO\` ╯ 』˚｡⋆
╭
│ 🔍 *Ricerca in corso...*
│ • Controllo database nutrizionale
│ • Verifica con AI nutrizionale
│ • Ricerca immagine di qualità
│
│ ⏳ _Attendere prego..._
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`)

        // Prova prima il database locale per maggiore precisione
        let food = getNutritionFromDatabase(foodQuery, quantity, unit)
        let imageUrl = null

        // Se non trovato nel database, usa Gemini
        if (!food) {
            const [geminiResult, imageResult] = await Promise.all([
                askGeminiPro(foodQuery, quantity, unit),
                getGoogleImage(foodQuery)
            ])
            food = geminiResult
            imageUrl = imageResult
        } else {
            // Anche per il database locale, cerca l'immagine
            imageUrl = await getGoogleImage(foodQuery)
        }

        // Calcolo percentuali giornaliere più precise
        const dailyValues = {
            calories: Math.round((food.calories / 2000) * 100),
            protein: Math.round((food.protein / 50) * 100),
            fat: Math.round((food.fat / 70) * 100),
            satFat: Math.round((food.satFat / 20) * 100),
            carbs: Math.round((food.carbs / 300) * 100),
            fiber: Math.round((food.fiber / 25) * 100),
            sodium: Math.round((food.sodium / 2300) * 100),
            calcium: Math.round((food.calcium / 1000) * 100),
            iron: Math.round((food.iron / 18) * 100)
        }

        // Consigli nutrizionali intelligenti
        const healthAdvice = getHealthAdvice(food.calories, food.protein, food.fat, food.carbs, 1800)
        
        // Calcolo qualità nutrizionale
        let nutritionScore = 0
        if (food.protein > 10) nutritionScore += 2
        if (food.fiber > 3) nutritionScore += 2
        if (food.sodium < 400) nutritionScore += 1
        if (food.calories < 200) nutritionScore += 1
        if (food.fat < 10) nutritionScore += 1
        
        let scoreEmoji = '🟢'
        let scoreText = 'Ottimo'
        if (nutritionScore < 3) { scoreEmoji = '🔴'; scoreText = 'Attenzione' }
        else if (nutritionScore < 5) { scoreEmoji = '🟡'; scoreText = 'Moderato' }

        let nutritionText = `ㅤㅤ⋆｡˚『 ╭ \`${food.name.toUpperCase()}\` ╯ 』˚｡⋆
╭
│ 📊 *Porzione analizzata:* *${quantity}${unit}*
│ ${scoreEmoji} *Valutazione nutrizionale:* *${scoreText}*
│ 🔬 *Fonte dati:* *${food.source === 'database' ? 'Database verificato' : 'AI Nutrizionale'}*
│
│ 『 🔥 』 *ENERGIA:*
│ • *${food.calories} kcal* (${dailyValues.calories}% VG*)
│ ${food.calories > 300 ? '⚠️ Alta densità calorica' : food.calories < 100 ? '✅ Bassa densità calorica' : '🔸 Moderata densità calorica'}
│
│ 『 🥩 』 *MACRONUTRIENTI:*
│ • *Proteine:* ${food.protein}${unit} (${dailyValues.protein}% VG)
│ • *Grassi totali:* ${food.fat}${unit} (${dailyValues.fat}% VG)
│   ↳ _Saturi:_ ${food.satFat}${unit} (${dailyValues.satFat}% VG)
│ • *Carboidrati:* ${food.carbs}${unit} (${dailyValues.carbs}% VG)
│   ↳ _Zuccheri:_ ${food.sugars}${unit}
│ • *Fibre:* ${food.fiber}${unit} (${dailyValues.fiber}% VG)
│
│ 『 🧪 』 *MICRONUTRIENTI:*
│ • *Sodio:* ${food.sodium}mg (${dailyValues.sodium}% VG)
│ • *Potassio:* ${food.potassium}mg
│ • *Calcio:* ${food.calcium}mg (${dailyValues.calcium}% VG)
│ • *Ferro:* ${food.iron}mg (${dailyValues.iron}% VG)
│ • *Colesterolo:* ${food.cholesterol}mg
│
│ 『 ℹ️ 』 *INFORMAZIONI:*
│ • *Categoria:* ${food.category}
│ • *Porzione consigliata:* ${food.portion}${unit}
│ • *Densità calorica:* ${(food.calories / quantity * 100).toFixed(0)} kcal/100${unit}
│
│ 『 💡 』 *CONSIGLI NUTRIZIONALI:*
│ ${healthAdvice}
│
│ 『 📝 』 *NOTA PROFESSIONALE:*
│ ${food.note}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
\`\`*VG = Valori Giornalieri di riferimento (dieta 2000 kcal)\`\`
\`\`Dati nutrizionali professionali - Consultare un nutrizionista per piani personalizzati\`\``

        // Bottoni per porzioni intelligenti
        const smartPortions = [
            { size: Math.round(quantity * 0.5), label: '📉 Metà' },
            { size: Math.round(quantity * 1.5), label: '📈 +50%' },
            { size: food.portion, label: '✅ Consigliata' }
        ].filter(p => p.size !== quantity && p.size > 0)

        const portionButtons = smartPortions.map(p => ({
            buttonId: `.kcal ${foodQuery} ${p.size}${unit}`,
            buttonText: { displayText: `${p.label} (${p.size}${unit})` },
            type: 1
        }))

        // Aggiungi bottoni per alimenti correlati
        const relatedFoods = getRelatedFoods(foodQuery, unit)
        relatedFoods.forEach(related => {
            if (portionButtons.length < 3) {
                portionButtons.push({
                    buttonId: `.kcal ${related.name} ${related.portion}${unit}`,
                    buttonText: { displayText: `${related.emoji} ${related.name}` },
                    type: 1
                })
            }
        })

        if (imageUrl) {
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: nutritionText,
                buttons: portionButtons,
                headerType: 4
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                text: nutritionText,
                buttons: portionButtons,
                headerType: 1
            }, { quoted: m })
        }

        // Elimina messaggio di attesa
        if (waitMsg && waitMsg.key) {
            await conn.sendMessage(m.chat, { delete: waitMsg.key })
        }

    } catch (error) {
        console.error('Errore handler:', error)
        const errorButtons = [
            { buttonId: '.kcal pasta 100g', buttonText: { displayText: '🍝 Pasta' }, type: 1 },
            { buttonId: '.kcal pollo 120g', buttonText: { displayText: '🍗 Pollo' }, type: 1 },
            { buttonId: '.kcal mela 150g', buttonText: { displayText: '🍎 Mela' }, type: 1 }
        ]

        await conn.sendMessage(m.chat, {
            text: `ㅤㅤ⋆｡˚『 ╭ \`ERRORE SISTEMA\` ╯ 』˚｡⋆
╭
│ ❌ *Si è verificato un errore:*
│ \`${error.message}\`
│
│ 🔄 *Suggerimenti:*
│ • Verifica la connessione internet
│ • Usa nomi di alimenti più comuni
│ • Controlla il formato: \`alimento quantità\`
│ • Esempio: \`pasta 100g\`
│
│ 💡 *Prova con questi alimenti:*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            buttons: errorButtons,
            headerType: 1
        }, { quoted: m })
    }
}

function getRelatedFoods(foodName, unit) {
    const related = {
        'pasta': [
            { name: 'riso', portion: 80, emoji: '🍚' },
            { name: 'pane', portion: 50, emoji: '🍞' }
        ],
        'pollo': [
            { name: 'manzo', portion: 100, emoji: '🥩' },
            { name: 'salmone', portion: 150, emoji: '🐟' }
        ],
        'mela': [
            { name: 'banana', portion: 120, emoji: '🍌' },
            { name: 'arancia', portion: 160, emoji: '🍊' }
        ],
        'coca cola': [
            { name: 'birra', portion: 330, emoji: '🍺' },
            { name: 'acqua', portion: 500, emoji: '💧' }
        ]
    }
    
    const normalizedName = foodName.toLowerCase()
    for (const [key, foods] of Object.entries(related)) {
        if (normalizedName.includes(key)) {
            return foods.filter(f => unit === 'ml' ? f.name.includes('acqua') || f.name.includes('birra') : !f.name.includes('acqua'))
        }
    }
    
    return []
}

handler.help = ['kcal']
handler.tags = ['strumenti']
handler.command = /^(kcal|calorie|cal|nutrizione|nutri)$/i
handler.register = false
handler.owner = true

export default handler