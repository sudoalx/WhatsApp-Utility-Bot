const snapsave = require("snapsave-scraper");
const { reactToMessage } = require("../../../utils/sendReaction");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { evv, type, content, sendMessageWTyping, senderJid, ig } = msgInfoObj;

    await await reactToMessage(from, sock, msg, "🔄");

    // convert the content text to json
    const contentAsJSON = JSON.parse(content);
    console.log(contentAsJSON);
    const { extendedTextMessage } = contentAsJSON;
    const quotedMessageExt = extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.text


    let urlInsta = quotedMessageExt ?? args[0]
    if (!urlInsta) {
        await reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from, { text: "❌ Please provide a valid Instagram URL." }, { quoted: msg });
    }

    // sanitize the url, extract url from the message by using regex
    urlInsta = urlInsta.match(/(https?:\/\/[^ ]*)/)?.[0];

    if (!(urlInsta.includes("instagram.com/p/") ||
        urlInsta.includes("instagram.com/reel/") ||
        urlInsta.includes("instagram.com/tv/") ||
        urlInsta.includes("instagram.com/stories/")
    )) {
        await reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from,
            { text: `❌ Wrong URL! Only Instagram posted videos, tv and reels can be downloaded.` },
            { quoted: msg }
        );
    }

    if (urlInsta.includes("?")) urlInsta = urlInsta.split("/?")[0];
    snapsave(urlInsta).then(async res => {

        if (res.status) {
            const data = [...new Set(res.data.map(item => item.url))];
            for (const element of data) {

                setTimeout(async () => {
                    const url = element;
                    if (url.includes("jpg") || url.includes("png") || url.includes("jpeg") || url.includes("webp")) {
                        sock.sendMessage(from,
                            { image: { url: url } },
                            { quoted: msg }
                        );
                        await reactToMessage(from, sock, msg, "✅");
                    } else {
                        sock.sendMessage(from,
                            { video: { url: url } },
                            { quoted: msg }
                        );
                        await reactToMessage(from, sock, msg, "✅");
                    }
                }, 1000 * 1);
            }
        } else {
            sendMessageWTyping(from, { text: "Unable to download the media." }, { quoted: msg });
        }
    })
}

module.exports.command = () => ({ cmd: ["insta", "i"], handler });