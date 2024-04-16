const snapsave = require("snapsave-scraper");
const { reactToMessage } = require("../../../utils/sendReaction");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { evv, type, content, sendMessageWTyping, senderJid, ig } = msgInfoObj;

    let sendAll = 0;
    await reactToMessage(from, sock, msg, "🔄");

    // convert the content text to json
    const contentAsJSON = JSON.parse(content);
    const { extendedTextMessage } = contentAsJSON;
    // Get the quoted message
    const quotedMessage = extendedTextMessage.contextInfo.quotedMessage;

    let sourceUrl = null;
    // Check if quotedMessage is defined
    if (quotedMessage) {
        // Handle the case where quotedMessage is defined
        // If quotedMessage has an extendedTextMessage (opengraph preview), use that, otherwise use the conversation (text message)
        const quotedText = quotedMessage.extendedTextMessage?.text ?? quotedMessage.conversation;
        sourceUrl = quotedText;
        sendAll = args[0] ?? 0;
    } else {
        // Handle the case where quotedMessage is undefined
        // If args[0] is defined, use that, otherwise send an error message
        sourceUrl = args[0] ?? null;
        sendAll = args[1] ?? 0;
    }

    // sanitize the url, extract url from the message by using regex
    sourceUrl = sourceUrl.match(/(https?:\/\/[^ ]*)/)?.[0];

    // Check if sourceUrl is defined, if not, send an error message
    if (!sourceUrl) {
        await reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from, { text: "❌ Please provide a valid Facebook or Instagram URL." }, { quoted: msg });
    }

    if (!(sourceUrl.includes("instagram.com/p/") ||
        sourceUrl.includes("instagram.com/reel/") ||
        sourceUrl.includes("instagram.com/tv/") ||
        sourceUrl.includes("instagram.com/stories/") ||
        sourceUrl.includes("facebook.com/"))) {
        await reactToMessage(from, sock, msg, "❌");
        return sendMessageWTyping(from,
            { text: `❌ Wrong URL! Only videos from Facebook or Instagram can be downloaded.` },
            { quoted: msg }
        );
    }
    // remove the query string from the url
    if (sourceUrl.includes("?")) sourceUrl = sourceUrl.split("/?")[0];
    console.log("Found URL:", sourceUrl);
    snapsave(sourceUrl).then(async res => {

        if (res.status) {
            const data = [...new Set(res.data.map(item => item.url))];
            const urlsToSend = sendAll ? data : [data[0]];
            for (const url of urlsToSend) {
                setTimeout(async () => {
                    sock.sendMessage(from, { [url.includes("jpg") || url.includes("png") || url.includes("jpeg") || url.includes("webp") ? "image" : "video"]: { url } }, { quoted: msg });
                    await reactToMessage(from, sock, msg, "✅");
                }, 1000 * 1);
            }
        } else {
            console.error("Error downloading media:", res);
            await reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: "❌ Unable to download media." }, { quoted: msg });
        }
    })
}

module.exports.command = () => ({ cmd: ["i", "insta", "fb", "facebook"], handler });