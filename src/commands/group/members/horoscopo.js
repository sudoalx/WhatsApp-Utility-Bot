const cheerio = require('cheerio');
const axios = require('axios');
const { reactToMessage } = require('../../../utils/sendReaction');



const getHoroscopeEs = async (sign) => {
    const URL = `https://www.20minutos.es/horoscopo/solar/prediccion/${sign}/`;
    const res = await axios.get(URL);
    const $ = cheerio.load(res.data);
    const horoscopeTitle = $('body > div#main > div#content > div.prediction > h2').text();
    const horoscopeParagraphs = $('body > div#main > div#content > div.prediction > p');
    return {
        title: horoscopeTitle,
        paragraphs: horoscopeParagraphs.map((i, p) => $(p).text()).get().join("\n")
    }
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    reactToMessage(from, sock, msg, "🔄");
    const { prefix, sendMessageWTyping } = msgInfoObj;
    let horo_text = ['aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis']

    if (!args[0]) {
        reactToMessage(from, sock, msg, "❌");
        return sock.sendMessage(from, { text: "❌ Por favor, proporciona un signo del zodiaco válido:\n" + horo_text.join("\n") }, { quoted: msg });
    }

    let sign = args[0].toLowerCase();

    if (horo_text.indexOf(sign) === -1) {
        reactToMessage(from, sock, msg, "❌");
        sendMessageWTyping(from, { text: "❌ Por favor, proporciona un signo del zodiaco válido:\n" + horo_text.join("\n") }, { quoted: msg });
    } else {
        getHoroscopeEs(sign).then(res => {
            sendMessageWTyping(from, {
                text: `*Fecha*: ${new Date().toLocaleDateString()}\n*Signo*: ${res.title}\n*Predicción*:\n${res.paragraphs}`
            }, { quoted: msg });
            reactToMessage(from, sock, msg, "✅");
        }).catch(err => {
            console.error(err);
            reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: "❌ Error al obtener el horóscopo. Por favor, inténtalo de nuevo más tarde." }, { quoted: msg });
        });
    }
}

module.exports.command = () => ({ cmd: ['horoscopo', 'horos'], handler });