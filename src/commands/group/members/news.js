const googleNewsScraper = require('google-news-scraper');

const reactToMessage = async (from, sock, msg, emoji) => {
    const reactonMessage = {
        react: {
            text: emoji,
            key: msg.key
        }
    }
    return sock.sendMessage(from, reactonMessage);
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;
    // react to the message with a loading indicator
    await reactToMessage(from, sock, msg, "🔄");
    try {
        if (!args[0]) {
            reactToMessage(from, sock, msg, "❌");
            return sendMessageWTyping(from, { text: `❌ *Enter news topic*` }, { quoted: msg });
        }

        // Fetch news
        const newsTopic = args.join(" ");
        const articles = await googleNewsScraper({ searchTerm: newsTopic, prettyURLs: true });
        if (articles.length == 0) {
            reactToMessage(from, sock, msg, "❌");
            return sendMessageWTyping(from, { text: "❌ *No news found*" }, { quoted: msg });
        }

        // Format news
        /* The articles array looks like this:
            [
                {
                    "title": "Article title",
                    "subtitle": "Article subtitle",
                    "link": "http://url-to-website.com/path/to/article",
                    "image": "http://url-to-website.com/path/to/image.jpg",
                    "source": "Name of publication",
                    "time": "Time/date published (human-readable)",
                    "ArticleType": "String, one of ['regular' | 'topicFeatured' | 'topicSmall']"
                }
            ]
        */

        const news = articles.map((article, i) => {
            return `*📰 ${i + 1}.*\n*Title:* ${article.title}\n*Source:* ${article.source}\n*Time:* ${article.time}\n*Link:* ${article.link}`;
        }).join("\n");

        // Send news
        reactToMessage(from, sock, msg, "✅");
        sendMessageWTyping(from, {
            text: `*📰 News on ${newsTopic}*\n\n${news}`
        }, { quoted: msg });

    } catch (error) {
        console.error(error);
        reactToMessage(from, sock, msg, "❌");
        sendMessageWTyping(from, { text: "❌ *Error fetching news*" }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["news"], handler });
