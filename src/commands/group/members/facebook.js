const snapsave = require("snapsave-scraper");
const { reactToMessage } = require("../../../utils/sendReaction");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { evv, type, content, sendMessageWTyping, senderJid, ig } = msgInfoObj;

    await reactToMessage(from, sock, msg, "🔄");

    // convert the content text to json
    const contentAsJSON = JSON.parse(content);
    const { extendedTextMessage } = contentAsJSON;
    const quotedMessage = extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.text


    let urlFb = quotedMessage ?? args[0]
    if (!urlFb) {
        reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from, { text: "❌ Please provide a valid Facebook URL." }, { quoted: msg });
    }


    if (!(urlFb.includes("facebook.com/"))) {
        await reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from,
            { text: `❌ Wrong URL! Only Facebook videos can be downloaded.` },
            { quoted: msg }
        );
    }
    if (urlFb.includes("?")) urlFb = urlFb.split("/?")[0];
    console.log("Found URL:", urlFb);
    snapsave(urlFb).then(async res => {

        if (res.status) {
            const data = [...new Set(res.data.map(item => item.url))];
            for (const element of data) {

                setTimeout(() => {
                    const url = element;
                    if (url.includes("jpg") || url.includes("png") || url.includes("jpeg") || url.includes("webp")) {
                        sock.sendMessage(from,
                            { image: { url: url } },
                            { quoted: msg }
                        );
                    } else if (url.includes("mp4") || url.includes("mkv") || url.includes("webm")) {
                        sock.sendMessage(from,
                            { video: { url: url } },
                            { quoted: msg }
                        );
                    }
                }, 1000 * 1);
            }
        } else {
            await reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: "❌ Unable to download media." }, { quoted: msg });
        }
    })
}

module.exports.command = () => ({ cmd: ["fb", "facebook"], handler });