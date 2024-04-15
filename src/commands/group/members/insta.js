const snapsave = require("snapsave-scraper");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { evv, type, content, sendMessageWTyping, senderJid, ig } = msgInfoObj;

    // convert the content text to json
    const contentAsJSON = JSON.parse(content);
    const { extendedTextMessage } = contentAsJSON;
    const quotedMessage = extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.text


    let urlInsta = quotedMessage ?? args[0]
    if (!urlInsta) return sendMessageWTyping(from, { text: "❌ Please provide a valid Instagram URL." }, { quoted: msg });


    if (!(urlInsta.includes("instagram.com/p/") ||
        urlInsta.includes("instagram.com/reel/") ||
        urlInsta.includes("instagram.com/tv/")))
        return sendMessageWTyping(from,
            { text: `❌ Wrong URL! Only Instagram posted videos, tv and reels can be downloaded.` },
            { quoted: msg }
        );

    if (urlInsta.includes("?")) urlInsta = urlInsta.split("/?")[0];
    console.log("Found URL:", urlInsta);
    snapsave(urlInsta).then(async res => {

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
            sendMessageWTyping(from, { text: "Unable to download the media." }, { quoted: msg });
        }
    })
}

module.exports.command = () => ({ cmd: ["insta", "i"], handler });