const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const WSF = require("wa-sticker-formatter");
// const { path } = require("@ffmpeg-installer/ffmpeg");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { getMemberData, member } = require("../../mongo-DB/membersDataDb");
const { writeFile } = require('fs/promises');
const fs = require('fs');

const getRandom = (ext = '') => `${Math.floor(Math.random() * 10000)}${ext}`;

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
    await reactToMessage(from, sock, msg, "🔄");
    const { senderJid, type, content, isGroup, sendMessageWTyping, evv } = msgInfoObj;

    if (msg.message.extendedTextMessage) {
        msg.message = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    }

    const isMedia = type === "imageMessage" || type === "videoMessage";
    const isTaggedImage = type === "extendedTextMessage" && content.includes("imageMessage");
    const isTaggedVideo = type === "extendedTextMessage" && content.includes("videoMessage");

    if (!isGroup) {
        const limit = await getMemberData(senderJid);
        if (limit.dmLimit <= 0) {
            return sendMessageWTyping(from, { text: 'You have used your monthly limit.\nWait for next month.' }, { quoted: msg });
        }
        member.updateOne({ _id: senderJid }, { $inc: { dmLimit: -1 } });
    }

    let packName = "WA Utility Bot";
    let authorName = "WA Utility Bot";

    const isPackIncluded = args.includes('pack');
    const isAuthorIncluded = args.includes('author');

    if (args.includes('nometadata') === false) {
        packName = isPackIncluded ? evv.split('pack')[1].split('author')[0] : "WA Utility Bot";
        authorName = isAuthorIncluded ? evv.split('author')[1].split('pack')[0] : "WA Utility Bot";
    }

    const outputOptions = args.includes("crop") || args.includes("c")
        ? [
            `-vcodec`, `libwebp`, `-vf`,
            `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
            `-loop`, `0`, `-ss`, `00:00:00.0`, `-t`, `00:00:09.0`, `-preset`,
            `default`, `-an`, `-vsync`, `0`, `-s`, `512:512`,
        ]
        : [
            `-vcodec`, `libwebp`, `-vf`,
            `scale='min(220,iw)':min'(220,ih)':force_original_aspect_ratio=decrease,fps=15, pad=220:220:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
        ];

    const media = isTaggedImage ? getRandom('.png') : getRandom('.mp4');

    if (isMedia || isTaggedImage || isTaggedVideo) {
        if (msg.message?.videoMessage?.seconds > 11) {
            await reactToMessage(from, sock, msg, "❌");
            return sendMessageWTyping(from,
                { text: "Send a video less than 11 seconds long." },
                { quoted: msg }
            );
        }
        const buffer = await downloadMediaMessage(msg, 'buffer', {}).catch(err => {
            console.error(err);
            reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: "❌ Error while downloading media." }, { quoted: msg });
        });
        await writeFile(media, buffer);
        await buildSticker(media).catch(err => {
            console.error(err);
            reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: "❌ Error while creating sticker." }, { quoted: msg });
        });
    } else {
        sendMessageWTyping(from, { text: `❌ *Error reply to image or video only*` }, { quoted: msg });
        console.error('Error not replied');
    }

    async function buildSticker(media) {
        const ran = getRandom('.webp');
        try {
            const file = ffmpeg(`./${media}`).input(media).on("error", err => fs.unlinkSync(media))
                .addOutputOptions(outputOptions).toFormat("webp").save(ran);
            file.on("end", () => {
                WSF.setMetadata(packName, authorName, ran).then(() => {
                    reactToMessage(from, sock, msg, "✅");
                    sock.sendMessage(from,
                        { sticker: fs.readFileSync(ran) },
                        { quoted: msg }
                    ).then(() => {
                        try {
                            fs.unlinkSync(media);
                            fs.unlinkSync(ran);
                        } catch (err) {
                            console.error('Error deleting files:', err);
                        }
                    }).catch(err => {
                        console.error(err);
                        sendMessageWTyping(from, { text: "❌ Error while processing sticker." }, { quoted: msg });
                    });
                });
            });
        } catch (err) {
            await reactToMessage(from, sock, msg, "❌");
            sendMessageWTyping(from, { text: err.toString() }, { quoted: msg });
            console.error(err);
        }
    }
};

module.exports.command = () => ({ cmd: ["sticker", "s"], handler });
