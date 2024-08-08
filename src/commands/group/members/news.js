const googleNewsScraper = require('google-news-scraper');
const { reactToMessage } = require('../../../utils/sendReaction');

const prefix = process.env.PREFIX ?? '/'

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping, evv } = msgInfoObj;
    // react to the message with a loading indicator
    await reactToMessage(from, sock, msg, "🔄");
    try {
        if (!args[0]) {
            reactToMessage(from, sock, msg, "❌");
            return sendMessageWTyping(from, {
                text: `❌ *Enter news topic*\n*Example:*\n\`\`\`${prefix}news covid\n\`\`\`\n*Limit the number of articles to be shown:*\n\`\`\`${prefix}news covid;5\`\`\``
            }, { quoted: msg });
        }

        const evvSplit = evv.split(";");
        const evvLength = evvSplit.length;
        let newsTopic = args.join(" ");
        let maxArticles = 10;

        if (evvLength >= 1) {
            newsTopic = evvSplit[0].trim();
            maxArticles = evvSplit[1] ? parseInt(evvSplit[1].trim()) : 10;
        }


        // Fetch news
        const encodedTopic = encodeURIComponent(newsTopic);
        let articles = await googleNewsScraper({ baseUrl: `https://news.google.com/search?q=${encodedTopic}` });
        if (articles.length === 0) {
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

        // Limit the number of articles
        articles = articles.slice(0, maxArticles);


        const news = articles.map((article, i) => {
            return `📰 *${article.title}*\n*Source:* ${article.source}\n*Published:* ${article.time}\n*Read article:* ${article.link}`;
        }).join("\n\n");


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
