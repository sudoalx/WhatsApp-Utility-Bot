const { EventRegistry, QueryArticles } = require("eventregistry");

const er = new EventRegistry({ apiKey: process.env.EVENT_REGISTRY_API_KEY });

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;

    try {
        if (!args[0]) {
            return sendMessageWTyping(from, { text: `❌ *Enter news topic*` }, { quoted: msg });
        }

        const conceptUri = await er.getConceptUri(args[0]);

        if (!conceptUri) {
            return sendMessageWTyping(from, { text: "❌ *No news found*" }, { quoted: msg });
        }

        const q = new QueryArticles(er, { conceptUri: conceptUri, sortBy: "date", lang: "eng", count: 10 });

        const articles = await q.getArticles();

        let news = "📰 *News:*";
        articles.forEach(article => {
            news += `\n📰 *${article.title}*\n🔗 *Read more:* ${article.url}`;
        });

        // Send news
        sendMessageWTyping(from, { text: news }, { quoted: msg });

    } catch (error) {
        console.error(error);
        sendMessageWTyping(from, { text: "❌ *Error fetching news*" }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["news"], handler });
