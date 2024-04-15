const fs = require('fs');
const Tiktok = require("@tobyg74/tiktok-api-dl");
const { reactToMessage } = require('../../../utils/sendReaction');

const validate = (url) => {
    // Regular expression to match TikTok URL pattern
    const regex = /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

    // Check if the URL matches the regex pattern
    return regex.test(url);
};



const extractUrl = (text) => {
    // extract the first URL from the text
    const url = text.match(/(https?:\/\/[^\s]+)/g);
    return url[0];
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    // react to the message with a loading indicator
    await reactToMessage(from, sock, msg, "🔄");

    let tiktok_url = args[0];
    if (!tiktok_url) {
        const quotedMsg = msgInfoObj.content;
        const parsedMsg = JSON.parse(quotedMsg);

        // Extract the quotedMessage object from the nested structure
        const quotedMessage = parsedMsg.extendedTextMessage.contextInfo.quotedMessage;

        // if quotedMessage.conversation exists, extract url from it
        if (quotedMessage.conversation) {
            tiktok_url = extractUrl(quotedMessage.conversation);
        } else if (quotedMessage.extendedTextMessage) {
            // Extract the text property from the quotedMessage object
            const quotedText = quotedMessage.extendedTextMessage.text;
            tiktok_url = extractUrl(quotedText);
        }

    }
    if (!validate(tiktok_url)) {
        await reactToMessage(from, sock, msg, "❌");
        return sock.sendMessage(from, { text: "❌ Invalid TikTok URL" }, { quoted: msg });
    }

    Tiktok.Downloader(tiktok_url, {
        version: "v3" //  version: "v1" | "v2" | "v3"
    }).then(async (result) => {
        if (result.status) {
            sock.sendMessage(from, { video: { url: result.result.video1 }, caption: result.result.desc }, { quoted: msg }).catch(console.error);
            await reactToMessage(from, sock, msg, "✅");
        }
    }).catch(async (err) => {
        console.error(err);
        sock.sendMessage(from, { text: "❌ Error while downloading TikTok video" }, { quoted: msg });
        await reactToMessage(from, sock, msg, "❌");
    }
    )
};

module.exports.command = () => ({ cmd: ["tiktok", "tik"], handler });
